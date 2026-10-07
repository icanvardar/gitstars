import { useMemo } from 'react'
import { Easing, useCurrentFrame } from 'remotion'
import { mulberry32 } from '../../math'
import type { EffectProps } from './types'

const COUNT = 24
const SPARKLE = 'M 0 -1 L 0.22 -0.22 L 1 0 L 0.22 0.22 L 0 1 L -0.22 0.22 L -1 0 L -0.22 -0.22 Z'
const burst = Easing.out(Easing.cubic)

/** Seeded burst of dots and sparkles that drift out from the star and fade. */
export function Particles({ cx, cy, size, color, start, width, height, u }: EffectProps) {
  const frame = useCurrentFrame()
  const particles = useMemo(() => {
    const random = mulberry32(2477)
    return Array.from({ length: COUNT }, (_, i) => ({
      angle: (i / COUNT) * Math.PI * 2 + (random() - 0.5) * 0.5,
      distance: size * (1.4 + random() * 2.2),
      radius: (2 + random() * 4) * u,
      life: 54 + random() * 46,
      delay: random() * 8,
      sparkle: random() < 0.4,
      twinkle: random() * Math.PI * 2,
    }))
  }, [size, u])

  if (frame < start) return null

  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      {particles.map((particle, i) => {
        const age = frame - start - particle.delay
        if (age < 0 || age > particle.life) return null
        const t = age / particle.life
        const travel = burst(t) * particle.distance
        const x = cx + Math.cos(particle.angle) * travel
        const y = cy + Math.sin(particle.angle) * travel + t * t * 26 * u
        const fade = Math.min(1, age / 4) * (1 - t) ** 1.6
        const flicker = 0.75 + 0.25 * Math.sin(age * 0.5 + particle.twinkle)
        const r = particle.radius * (1 - t * 0.5)
        return particle.sparkle ? (
          <path
            key={i}
            d={SPARKLE}
            fill={color}
            opacity={fade * flicker}
            transform={`translate(${x} ${y}) scale(${r * 2.2})`}
          />
        ) : (
          <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={fade * flicker * 0.85} />
        )
      })}
    </svg>
  )
}
