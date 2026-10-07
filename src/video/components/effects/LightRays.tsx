import { Easing, interpolate, useCurrentFrame } from 'remotion'
import { useSvgId } from '../svgId'
import { clampBoth, type EffectProps } from './types'

const RAYS = 14

/** Slowly rotating god rays behind the star. They stay for the hold. */
export function LightRays({ cx, cy, size, color, start, width, height, strength = 1 }: EffectProps & { strength?: number }) {
  const frame = useCurrentFrame()
  const fadeId = useSvgId('rays')
  if (frame < start) return null

  const appear = interpolate(frame, [start, start + 40], [0, 1], { ...clampBoth, easing: Easing.out(Easing.cubic) })
  const reach = size * 5.2
  const rotation = (frame - start) * 0.12

  const rays = Array.from({ length: RAYS }, (_, i) => {
    const half = ((i % 2 === 0 ? 5 : 2.6) * Math.PI) / 180
    const angle = (i / RAYS) * Math.PI * 2
    const length = reach * (i % 2 === 0 ? 1 : 0.72) * (0.6 + 0.4 * appear)
    const ax = cx + Math.cos(angle - half) * length
    const ay = cy + Math.sin(angle - half) * length
    const bx = cx + Math.cos(angle + half) * length
    const by = cy + Math.sin(angle + half) * length
    return `M ${cx} ${cy} L ${ax.toFixed(1)} ${ay.toFixed(1)} L ${bx.toFixed(1)} ${by.toFixed(1)} Z`
  })

  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, opacity: appear * 0.4 * strength }}>
      <defs>
        <radialGradient id={fadeId} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={reach}>
          <stop offset={0} stopColor={color} stopOpacity={0.55} />
          <stop offset={0.3} stopColor={color} stopOpacity={0.22} />
          <stop offset={0.7} stopColor={color} stopOpacity={0.05} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`rotate(${rotation} ${cx} ${cy})`}>
        {rays.map((d, i) => (
          <path key={i} d={d} fill={`url(#${fadeId})`} />
        ))}
      </g>
    </svg>
  )
}
