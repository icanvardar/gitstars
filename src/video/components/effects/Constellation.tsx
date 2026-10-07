import { useMemo } from 'react'
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { lerp, mulberry32 } from '../../math'
import type { VideoTheme } from '../../theme'
import { Avatar } from '../Avatar'
import { clampBoth, type EffectProps } from './types'

type Face = { name: string; avatar: string | null }

const MAX_FACES = 8

/**
 * Stargazer avatars light up around the frame, link into a constellation, then
 * rush into the star at the moment it fills.
 */
export function Constellation({
  cx,
  cy,
  color,
  start,
  impact,
  width,
  height,
  u,
  faces,
  theme,
  fontFamily,
}: EffectProps & { impact: number; faces: Face[]; theme: VideoTheme; fontFamily: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const avatarSize = 52 * u

  const points = useMemo(() => {
    const random = mulberry32(5021)
    const list = faces.slice(0, MAX_FACES)
    const offset = random() * Math.PI * 2
    return list.map((face, i) => {
      const angle = offset + (i / list.length) * Math.PI * 2 + (random() - 0.5) * 0.4
      const rx = width * (0.36 + random() * 0.06)
      const ry = height * (0.32 + random() * 0.06)
      return {
        face,
        x: Math.min(width - avatarSize, Math.max(avatarSize, width / 2 + Math.cos(angle) * rx)),
        y: Math.min(height - avatarSize, Math.max(avatarSize, height / 2 + Math.sin(angle) * ry)),
      }
    })
  }, [faces, width, height, avatarSize])

  if (frame < start || frame > impact + 2 || points.length === 0) return null

  const gather = interpolate(frame, [impact - 18, impact], [0, 1], { ...clampBoth, easing: Easing.in(Easing.cubic) })
  const lines = interpolate(frame, [start + 6, impact - 18], [0, 1], { ...clampBoth, easing: Easing.out(Easing.cubic) })

  const placed = points.map((point, i) => {
    const appear = spring({ frame: frame - start - i * 2, fps, config: { damping: 18, stiffness: 160 }, durationInFrames: 20 })
    return {
      ...point,
      appear,
      x: lerp(point.x, cx, gather),
      y: lerp(point.y, cy, gather),
      scale: (0.6 + 0.4 * appear) * (1 - gather * 0.75),
    }
  })

  return (
    <>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, opacity: lines * (1 - gather) * 0.5 }}>
        {placed.map((point, i) => {
          const next = placed[(i + 1) % placed.length]!
          return (
            <line
              key={i}
              x1={point.x}
              y1={point.y}
              x2={lerp(point.x, next.x, lines)}
              y2={lerp(point.y, next.y, lines)}
              stroke={color}
              strokeWidth={1.5 * u}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      {placed.map((point) => (
        <div
          key={point.face.name}
          style={{
            position: 'absolute',
            left: point.x - avatarSize / 2,
            top: point.y - avatarSize / 2,
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize,
            padding: 3 * u,
            backgroundColor: color,
            opacity: Math.min(1, point.appear) * (1 - gather * gather),
            transform: `scale(${point.scale})`,
            boxSizing: 'border-box',
          }}
        >
          <Avatar
            src={point.face.avatar}
            name={point.face.name}
            size={avatarSize - 6 * u}
            radius={avatarSize}
            theme={theme}
            fontFamily={fontFamily}
          />
        </div>
      ))}
    </>
  )
}
