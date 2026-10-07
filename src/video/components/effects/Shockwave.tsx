import { Easing, interpolate, useCurrentFrame } from 'remotion'
import { useSvgId } from '../svgId'
import { clampBoth, type EffectProps } from './types'

const RING_FRAMES = 56

/** Expanding rings with a soft flash at the moment of impact. */
export function Shockwave({ cx, cy, size, color, start, width, height, u, count = 1, gap = 9 }: EffectProps & { count?: number; gap?: number }) {
  const frame = useCurrentFrame()
  const flashId = useSvgId('flash')
  if (frame < start || frame > start + RING_FRAMES + gap * (count - 1)) return null

  const flash = interpolate(frame, [start, start + 4, start + 30], [0, 0.5, 0], clampBoth)
  const flashRadius = size * 2.4

  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id={flashId}>
          <stop offset={0} stopColor={color} stopOpacity={0.9} />
          <stop offset={0.35} stopColor={color} stopOpacity={0.3} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={flashRadius} fill={`url(#${flashId})`} opacity={flash} />
      {Array.from({ length: count }, (_, i) => {
        const p = interpolate(frame, [start + i * gap, start + i * gap + RING_FRAMES], [0, 1], {
          ...clampBoth,
          easing: Easing.out(Easing.cubic),
        })
        if (p <= 0 || p >= 1) return null
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={size * (0.5 + p * (3.6 + i * 0.9))}
            fill="none"
            stroke={color}
            strokeWidth={(1 - p) * 7 * u + 0.8 * u}
            opacity={(1 - p) ** 1.4 * (0.75 - i * 0.12)}
          />
        )
      })}
    </svg>
  )
}
