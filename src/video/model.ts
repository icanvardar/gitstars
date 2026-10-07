import { Easing, interpolate } from 'remotion'
import type { Layout } from './layout'
import { formatMonthYear, monotoneSpline, nextMilestone, type Point } from './math'
import type { StarsVideoProps } from './schema'
import { GROWTH } from './timing'

/** Leaves breathing room above the highest point of the curve. */
const HEADROOM = 0.9

const growthEasing = Easing.bezier(0.65, 0, 0.25, 1)

export function progressAt(frame: number): number {
  return interpolate(frame, [GROWTH.start, GROWTH.end], [0, 1], {
    easing: growthEasing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}

type Base = {
  /** Star count shown by the counter at a given frame. */
  valueAt: (frame: number) => number
  tipAt: (frame: number) => Point
}

export type HistoryModel = Base & {
  mode: 'history'
  linePath: string
  areaPath: string
  startLabel: string
}

export type MilestoneModel = Base & {
  mode: 'milestone'
  milestone: number
  reached: boolean
  fraction: number
  trackY: number
}

export type StarModel = HistoryModel | MilestoneModel

export function hasUsableHistory({ history, stars }: Pick<StarsVideoProps, 'history' | 'stars'>): boolean {
  const first = history?.[0]
  const last = history?.at(-1)
  return Boolean(history && first && last && history.length >= 2 && last.t > first.t && last.v > 0 && stars > 0)
}

export function buildStarModel(props: StarsVideoProps, layout: Layout): StarModel {
  const { chart } = layout
  const { stars, history } = props
  const bottom = chart.top + chart.height

  const first = history?.[0]
  const last = history?.at(-1)
  if (history && first && last && hasUsableHistory(props)) {
    const span = last.t - first.t
    const toY = (v: number) => bottom - (v / last.v) * chart.height * HEADROOM
    const spline = monotoneSpline(history.map((p) => ({ x: chart.left + ((p.t - first.t) / span) * chart.width, y: toY(p.v) })))
    const xAt = (frame: number) => chart.left + progressAt(frame) * chart.width

    return {
      mode: 'history',
      linePath: spline.path,
      areaPath: `${spline.path} L ${spline.last.x.toFixed(2)} ${bottom.toFixed(2)} L ${spline.first.x.toFixed(2)} ${bottom.toFixed(2)} Z`,
      startLabel: formatMonthYear(first.t),
      tipAt: (frame) => {
        const x = xAt(frame)
        return { x, y: spline.at(x) }
      },
      valueAt: (frame) => {
        const y = spline.at(xAt(frame))
        return Math.max(0, ((bottom - y) / (chart.height * HEADROOM)) * stars)
      },
    }
  }

  const { track } = layout
  const milestone = nextMilestone(Math.max(stars, 1))
  const fraction = stars / milestone
  return {
    mode: 'milestone',
    milestone,
    reached: stars >= milestone,
    fraction,
    trackY: track.y,
    tipAt: (frame) => ({
      x: track.left + track.tipInset + (track.width - 2 * track.tipInset) * fraction * progressAt(frame),
      y: track.y,
    }),
    valueAt: (frame) => stars * progressAt(frame),
  }
}
