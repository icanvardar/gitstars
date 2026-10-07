import { evolvePath } from '@remotion/paths'
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import type { Layout } from '../layout'
import { starPath } from '../math'
import type { VideoTheme } from '../theme'
import { FINALE } from '../timing'
import { PrismFill } from './effects/PrismFill'
import { useSvgId } from './svgId'

export const STAR = starPath(0.5)
/** Gaussian-like falloff so the halo has no visible edge. */
const HALO_STOPS = [
  [0, 0.3],
  [0.2, 0.2],
  [0.4, 0.09],
  [0.6, 0.03],
  [0.8, 0.008],
  [1, 0],
] as const
const clampBoth = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

type Props = {
  layout: Layout
  theme: VideoTheme
  color: string
  /** Fill the star with multicolor foil instead of a flat color. */
  prism?: boolean
}

/** Outline draws itself, then fills and settles with a soft halo. */
export function StarMark({ layout, theme, color, prism = false }: Props) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const halo = useSvgId('star-halo')
  const foil = useSvgId('star-foil')
  const { size, top, left } = layout.finale.star

  const draw = interpolate(frame, [FINALE.star, FINALE.star + 48], [0, 1], {
    ...clampBoth,
    easing: Easing.inOut(Easing.cubic),
  })
  const fill = interpolate(frame, [FINALE.starFill, FINALE.starFill + 26], [0, 1], {
    ...clampBoth,
    easing: Easing.out(Easing.cubic),
  })
  const pop = spring({ frame: frame - FINALE.star, fps, config: { damping: 16, stiffness: 110, mass: 0.9 } })
  const scale = 0.86 + 0.14 * pop
  if (frame < FINALE.star) return null

  const { strokeDasharray, strokeDashoffset } = evolvePath(draw, STAR)
  const haloSize = size * 3.4
  const paint = prism ? `url(#${foil})` : color

  return (
    <>
      <svg
        width={haloSize}
        height={haloSize}
        style={{ position: 'absolute', left: left + size / 2 - haloSize / 2, top: top + size / 2 - haloSize / 2, opacity: fill }}
      >
        <defs>
          <radialGradient id={halo}>
            {HALO_STOPS.map(([offset, opacity]) => (
              <stop key={offset} offset={offset} stopColor={color} stopOpacity={opacity * theme.haloStrength} />
            ))}
          </radialGradient>
        </defs>
        <circle cx={haloSize / 2} cy={haloSize / 2} r={haloSize / 2} fill={`url(#${halo})`} />
      </svg>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ position: 'absolute', left, top, transform: `scale(${scale})`, overflow: 'visible' }}
      >
        {prism && (
          <defs>
            <PrismFill id={foil} frame={frame} />
          </defs>
        )}
        <path d={STAR} fill={paint} fillOpacity={fill} stroke="none" />
        <path
          d={STAR}
          fill="none"
          stroke={paint}
          strokeWidth={1.1}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
    </>
  )
}
