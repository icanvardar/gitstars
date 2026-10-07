import type { CSSProperties } from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { MONO } from '../fonts'
import type { Layout } from '../layout'
import { formatCompact, type Point } from '../math'
import { progressAt, type HistoryModel, type MilestoneModel, type StarModel } from '../model'
import type { VideoTheme } from '../theme'
import { GROWTH, INTRO } from '../timing'
import { useSvgId } from './svgId'

type Props = {
  model: StarModel
  layout: Layout
  theme: VideoTheme
}

const clampBoth = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

function useCurveTimeline() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return {
    frame,
    baseline: spring({ frame: frame - INTRO.baseline, fps, config: { damping: 200 }, durationInFrames: 48 }),
    progress: progressAt(frame),
    tipVisible: interpolate(frame, [GROWTH.start - 8, GROWTH.start + 10], [0, 1], clampBoth),
    arrival: interpolate(frame, [GROWTH.end, GROWTH.end + 50], [0, 1], clampBoth),
  }
}

function caption(layout: Layout, theme: VideoTheme): CSSProperties {
  return {
    position: 'absolute',
    fontFamily: MONO,
    fontSize: 20 * layout.u,
    lineHeight: 1,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: theme.muted,
    whiteSpace: 'nowrap',
  }
}

function Tip({ at, layout, theme, visible, arrival }: { at: Point; layout: Layout; theme: VideoTheme; visible: number; arrival: number }) {
  const glow = useSvgId('tip-glow')
  const { u } = layout
  return (
    <g opacity={visible}>
      <defs>
        <radialGradient id={glow}>
          <stop offset="0" stopColor={theme.accent} stopOpacity={0.5} />
          <stop offset="1" stopColor={theme.accent} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={at.x} cy={at.y} r={48 * u} fill={`url(#${glow})`} />
      {arrival > 0 && arrival < 1 ? (
        <circle
          cx={at.x}
          cy={at.y}
          r={(7 + arrival * 42) * u}
          fill="none"
          stroke={theme.accent}
          strokeWidth={2 * u * (1 - arrival)}
          opacity={(1 - arrival) * 0.7}
        />
      ) : null}
      <circle cx={at.x} cy={at.y} r={10.5 * u} fill={theme.background} />
      <circle cx={at.x} cy={at.y} r={6.5 * u} fill={theme.accent} />
    </g>
  )
}

function HistoryCurve({ model, layout, theme }: Props & { model: HistoryModel }) {
  const { frame, baseline, tipVisible, arrival } = useCurveTimeline()
  const clip = useSvgId('curve-clip')
  const area = useSvgId('curve-area')
  const { chart, u, width, height } = layout
  const bottom = chart.top + chart.height
  const tip = model.tipAt(frame)

  return (
    <>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id={clip}>
            <rect x={chart.left - 40 * u} y={0} width={Math.max(0, tip.x - chart.left + 40 * u)} height={height} />
          </clipPath>
          <linearGradient id={area} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={theme.accent} stopOpacity={0.16} />
            <stop offset="1" stopColor={theme.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <line
          x1={chart.left}
          y1={bottom}
          x2={chart.left + chart.width * baseline}
          y2={bottom}
          stroke={theme.faint}
          strokeWidth={1.5 * u}
        />
        <g clipPath={`url(#${clip})`} opacity={tipVisible}>
          <path d={model.areaPath} fill={`url(#${area})`} />
          <path
            d={model.linePath}
            fill="none"
            stroke={theme.accent}
            strokeWidth={3.5 * u}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <Tip at={tip} layout={layout} theme={theme} visible={tipVisible} arrival={arrival} />
      </svg>
      <div style={{ ...caption(layout, theme), left: chart.left, top: bottom + 22 * u, opacity: baseline }}>
        {model.startLabel}
      </div>
    </>
  )
}

function MilestoneTrack({ model, layout, theme }: Props & { model: MilestoneModel }) {
  const { frame, baseline, tipVisible, arrival } = useCurveTimeline()
  const { track, u, width, height, pad } = layout
  const y = model.trackY
  const tip = model.tipAt(frame)

  return (
    <>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <line
          x1={track.left}
          y1={y}
          x2={track.left + track.width * baseline}
          y2={y}
          stroke={theme.faint}
          strokeWidth={2 * u}
          strokeLinecap="round"
        />
        <line
          x1={track.left}
          y1={y}
          x2={tip.x}
          y2={y}
          stroke={theme.accent}
          strokeWidth={4 * u}
          strokeLinecap="round"
          opacity={tipVisible}
        />
        <Tip at={tip} layout={layout} theme={theme} visible={tipVisible} arrival={arrival} />
      </svg>
      <div style={{ ...caption(layout, theme), left: pad, top: track.labelTop, opacity: baseline }}>
        {model.reached ? 'Milestone reached' : 'Next milestone'}
      </div>
      <div
        style={{
          ...caption(layout, theme),
          right: pad,
          top: track.labelTop,
          color: theme.text,
          opacity: baseline,
        }}
      >
        {formatCompact(model.milestone)}
      </div>
    </>
  )
}

export function StarCurve(props: Props) {
  return props.model.mode === 'history' ? (
    <HistoryCurve {...props} model={props.model} />
  ) : (
    <MilestoneTrack {...props} model={props.model} />
  )
}
