import { useMemo } from 'react'
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Avatar } from '../components/Avatar'
import { RollingNumber } from '../components/RollingNumber'
import { useSvgId } from '../components/svgId'
import { MONO, SANS } from '../fonts'
import { inkWidthEm, numberWidthEm } from '../layout'
import type { StarsVideoProps } from '../schema'
import type { VideoTheme } from '../theme'
import { REVEAL } from './timing'

const clampBoth = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

type StageProps = { width: number; height: number; u: number; theme: VideoTheme; color: string }

/** Overhead spotlight and a glow on the floor. Stays for the whole video. */
export function Stage({ width, height, theme, color }: StageProps) {
  const frame = useCurrentFrame()
  const beam = useSvgId('beam')
  const floor = useSvgId('floor')
  const lightUp = interpolate(frame, [REVEAL.stage, REVEAL.stage + 50], [0, 1], { ...clampBoth, easing: Easing.out(Easing.cubic) })
  const tint = interpolate(frame, [REVEAL.flares, REVEAL.flares + 60], [0, 1], clampBoth)
  const strength = theme.haloStrength

  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, opacity: lightUp }}>
      <defs>
        <linearGradient id={beam} x1="0" y1="0" x2="0" y2="1">
          <stop offset={0} stopColor={color} stopOpacity={0.2 * strength * (0.4 + 0.6 * tint)} />
          <stop offset={0.75} stopColor={color} stopOpacity={0.04 * strength} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
        </linearGradient>
        <radialGradient id={floor}>
          <stop offset={0} stopColor={color} stopOpacity={0.28 * strength * (0.4 + 0.6 * tint)} />
          <stop offset={0.5} stopColor={color} stopOpacity={0.08 * strength} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <polygon
        points={`${width * 0.42},0 ${width * 0.58},0 ${width * 0.5 + width * 0.36},${height} ${width * 0.5 - width * 0.36},${height}`}
        fill={`url(#${beam})`}
      />
      <ellipse cx={width / 2} cy={height * 0.9} rx={width * 0.42} ry={height * 0.08} fill={`url(#${floor})`} />
    </svg>
  )
}

/** Two spotlights sweep in from the lower corners and cross at center stage, then a flare streaks across. */
export function Flares({ width, height, u, color }: StageProps) {
  const frame = useCurrentFrame()
  const beamId = useSvgId('sweep-beam')
  const lineId = useSvgId('flare-line')
  const glowId = useSvgId('cross-glow')

  if (frame < REVEAL.flares || frame > REVEAL.badge + 30) return null
  const fadeAll = interpolate(frame, [REVEAL.badge - 10, REVEAL.badge + 30], [1, 0], clampBoth)
  const fadeIn = interpolate(frame, [REVEAL.flares, REVEAL.flares + 24], [0, 1], { ...clampBoth, easing: Easing.out(Easing.cubic) })
  const sweep = interpolate(frame, [REVEAL.flares, REVEAL.flareLine + 6], [0, 1], { ...clampBoth, easing: Easing.inOut(Easing.cubic) })
  const line = interpolate(frame, [REVEAL.flareLine, REVEAL.flareLine + 26], [0, 1], { ...clampBoth, easing: Easing.out(Easing.cubic) })
  const lineFade = interpolate(frame, [REVEAL.flareLine, REVEAL.flareLine + 6, REVEAL.flareLine + 40], [0, 1, 0], clampBoth)
  const crossGlow = interpolate(frame, [REVEAL.flareLine - 20, REVEAL.flareLine, REVEAL.flareLine + 50], [0, 1, 0], clampBoth)

  const length = Math.hypot(width, height) * 1.1
  const spread = Math.tan((3.2 * Math.PI) / 180) * length
  const target = { x: width / 2, y: height / 2 }

  const beam = (originX: number, side: 1 | -1) => {
    const origin = { x: originX, y: height + 20 * u }
    const aim = (Math.atan2(target.x - origin.x, origin.y - target.y) * 180) / Math.PI
    const angle = aim + side * (1 - sweep) * 38
    return (
      <g transform={`translate(${origin.x} ${origin.y}) rotate(${angle})`}>
        <polygon points={`0,0 ${-spread},${-length} ${spread},${-length}`} fill={`url(#${beamId})`} />
      </g>
    )
  }

  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, opacity: fadeAll * fadeIn }}>
      <defs>
        <linearGradient id={beamId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={-length}>
          <stop offset={0} stopColor={color} stopOpacity={0.42} />
          <stop offset={0.45} stopColor={color} stopOpacity={0.14} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
        </linearGradient>
        <linearGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
          <stop offset={0} stopColor={color} stopOpacity={0} />
          <stop offset={0.5} stopColor="#FFFFFF" stopOpacity={0.95} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
        </linearGradient>
        <radialGradient id={glowId}>
          <stop offset={0} stopColor={color} stopOpacity={0.5} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      {beam(width * 0.1, -1)}
      {beam(width * 0.9, 1)}
      <circle cx={target.x} cy={target.y} r={260 * u} fill={`url(#${glowId})`} opacity={crossGlow} />
      <rect
        x={width / 2 - width * 0.48 * line}
        y={height / 2 - 1.5 * u}
        width={width * 0.96 * line}
        height={3 * u}
        fill={`url(#${lineId})`}
        opacity={lineFade}
      />
    </svg>
  )
}

/** The owner's avatar drops in with a tier-colored ring, then steps back. */
export function OwnerBadge({ props, width, height, u, theme, color }: StageProps & { props: StarsVideoProps }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  if (frame < REVEAL.badge || frame > REVEAL.badgeOut + 24) return null

  const size = 240 * u
  const land = spring({ frame: frame - REVEAL.badge, fps, config: { damping: 14, stiffness: 120 } })
  const ring = interpolate(frame, [REVEAL.badge + 6, REVEAL.badge + 46], [0, 1], { ...clampBoth, easing: Easing.inOut(Easing.cubic) })
  const nameIn = spring({ frame: frame - REVEAL.badge - 18, fps, config: { damping: 200 }, durationInFrames: 30 })
  const out = interpolate(frame, [REVEAL.badgeOut, REVEAL.badgeOut + 20], [0, 1], { ...clampBoth, easing: Easing.in(Easing.cubic) })

  const cx = width / 2
  const cy = height / 2 - 40 * u
  const ringR = size / 2 + 14 * u
  const circumference = 2 * Math.PI * ringR
  const scale = (1.35 - 0.35 * land) * (1 - out * 0.25)

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: Math.min(1, land * 1.5) * (1 - out) }}>
      <div
        style={{
          position: 'absolute',
          left: cx - size / 2,
          top: cy - size / 2,
          width: size,
          height: size,
          transform: `scale(${scale})`,
        }}
      >
        <Avatar src={props.ownerAvatar} name={props.owner} size={size} radius={size} theme={theme} fontFamily={SANS} />
      </div>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <circle
          cx={cx}
          cy={cy}
          r={ringR * scale}
          fill="none"
          stroke={color}
          strokeWidth={3 * u}
          strokeLinecap="round"
          strokeDasharray={`${circumference * scale * ring} ${circumference * scale}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width,
          top: cy + size / 2 + 56 * u,
          textAlign: 'center',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 52 * u,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: theme.text,
          opacity: nameIn,
          transform: `translateY(${(1 - nameIn) * 16 * u}px)`,
        }}
      >
        {props.owner}
      </div>
    </div>
  )
}

/** The count rolls up from zero in the middle of the stage. */
export function CountReveal({ stars, width, height, u, theme, color }: StageProps & { stars: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const valueAt = useMemo(() => {
    const ease = Easing.out(Easing.exp)
    return (f: number) => stars * ease(Math.min(1, Math.max(0, (f - REVEAL.count) / (REVEAL.countEnd - REVEAL.count))))
  }, [stars])

  if (frame < REVEAL.count - 10 || frame > REVEAL.countOut + 16) return null

  const widthEm = numberWidthEm(stars)
  const fontSize = Math.min(300 * u, (width * 0.8) / widthEm)
  const left = (width - inkWidthEm(stars) * fontSize) / 2
  const top = height / 2 - fontSize * 0.5
  const enter = spring({ frame: frame - REVEAL.count + 10, fps, config: { damping: 200 }, durationInFrames: 24 })
  const land = spring({ frame: frame - REVEAL.countEnd, fps, config: { damping: 10, stiffness: 180 } })
  const out = interpolate(frame, [REVEAL.countOut, REVEAL.countOut + 14], [0, 1], { ...clampBoth, easing: Easing.in(Easing.cubic) })
  const scale = (1 + 0.04 * Math.sin(Math.min(1, land) * Math.PI)) * (1 + out * 0.3)

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: enter * (1 - out) }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width,
          top: top - 64 * u,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 22 * u,
          lineHeight: 1,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color,
        }}
      >
        GitHub stars
      </div>
      <div
        style={{
          position: 'absolute',
          left,
          top,
          transform: `scale(${scale})`,
          transformOrigin: `${(inkWidthEm(stars) * fontSize) / 2}px ${fontSize / 2}px`,
        }}
      >
        <RollingNumber value={stars} valueAt={valueAt} fontSize={fontSize} color={theme.text} fontFamily={SANS} />
      </div>
    </div>
  )
}
