import { Easing, interpolate, useCurrentFrame } from 'remotion'
import { useSvgId } from '../svgId'
import { clampBoth, type EffectProps } from './types'

const SWEEP_FRAMES = 34

/**
 * A bright glint crosses the star, trailed by a faint band of light across the
 * whole frame.
 */
export function LightSweep({ cx, cy, size, start, width, height, path }: EffectProps & { path: string }) {
  const frame = useCurrentFrame()
  const clipId = useSvgId('sweep-clip')
  const bandId = useSvgId('sweep-band')
  const p = interpolate(frame, [start, start + SWEEP_FRAMES], [0, 1], {
    ...clampBoth,
    easing: Easing.inOut(Easing.quad),
  })
  if (p <= 0 || p >= 1) return null

  const wide = interpolate(frame, [start + 4, start + SWEEP_FRAMES + 24], [0, 1], {
    ...clampBoth,
    easing: Easing.inOut(Easing.cubic),
  })
  const wideX = -width * 0.4 + wide * width * 1.8

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: -height * 0.25,
          left: wideX - width * 0.2,
          width: width * 0.4,
          height: height * 1.5,
          transform: 'rotate(18deg)',
          backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.06), rgba(255,255,255,0))',
          opacity: Math.sin(wide * Math.PI),
        }}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ position: 'absolute', left: cx - size / 2, top: cy - size / 2, overflow: 'visible' }}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={path} />
          </clipPath>
          <linearGradient id={bandId} x1="0" x2="1" y1="0" y2="0">
            <stop offset={0} stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset={0.5} stopColor="#FFFFFF" stopOpacity={0.85} />
            <stop offset={1} stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect x={-10 + p * 34} y={-6} width={7} height={36} fill={`url(#${bandId})`} transform={`rotate(20 ${-6.5 + p * 34} 12)`} />
        </g>
      </svg>
    </>
  )
}
