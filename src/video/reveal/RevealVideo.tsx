import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { LightRays } from '../components/effects/LightRays'
import { Particles } from '../components/effects/Particles'
import { Shockwave } from '../components/effects/Shockwave'
import { Backdrop } from '../components/Grain'
import { useVideoFonts } from '../fonts'
import type { StarsVideoProps } from '../schema'
import { THEMES } from '../theme'
import { baseTier, getTier } from '../tiers'
import { Card, CARD_ASPECT } from './Card'
import { REVEAL } from './timing'
import { CountReveal, Flares, OwnerBadge, Stage } from './Walkout'

const clampBoth = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const SPIN_TURNS = 1.5
const SHINE_FRAMES = 40
const SHINE_EVERY = 130

/** FIFA-style walkout: stage, flares, owner badge, count, then the card spins in. */
export function RevealVideo(props: StarsVideoProps) {
  useVideoFonts()
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const theme = THEMES[props.theme]
  const tier = getTier(props.stars, props.theme) ?? baseTier(props.theme)
  const color = tier.palette.accent
  const u = Math.min(width, height) / 1080
  const stage = { width, height, u, theme, color }

  const cardH = Math.min(height * 0.8, (width * 0.8) / CARD_ASPECT)
  const cardW = cardH * CARD_ASPECT
  const cx = width / 2
  const cy = height / 2

  const spin = spring({ frame: frame - REVEAL.flip, fps, config: { damping: 22, stiffness: 55, mass: 1 }, durationInFrames: REVEAL.flipEnd - REVEAL.flip })
  const angle = (1 - spin) * SPIN_TURNS * 2 * Math.PI
  const facing = Math.cos(angle)
  const grow = spring({ frame: frame - REVEAL.flip, fps, config: { damping: 200 }, durationInFrames: 40 })
  const appear = interpolate(frame, [REVEAL.flip, REVEAL.flip + 8], [0, 1], clampBoth)
  const float = interpolate(frame, [REVEAL.flipEnd, REVEAL.settled], [0, 1], { ...clampBoth, easing: Easing.inOut(Easing.quad) })
  const bob = Math.sin(((frame - REVEAL.flipEnd) / fps) * 1.7) * 10 * u * float
  const sinceShine = frame - REVEAL.shine
  const shine = sinceShine < 0 ? 0 : (sinceShine % SHINE_EVERY) / SHINE_FRAMES

  const cardScale = 0.72 + 0.28 * grow
  const cardY = cy - cardH / 2 + (1 - grow) * 60 * u + bob

  const rich = tier.id === 'rare' || tier.id === 'icon' || tier.id === 'legendary'
  const burst = tier.id === 'gold' || rich

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background, overflow: 'hidden', textRendering: 'auto' }}>
      <Backdrop theme={theme} width={width} height={height} />
      <Stage {...stage} />
      <Flares {...stage} />
      <OwnerBadge {...stage} props={props} />
      <CountReveal {...stage} stars={props.stars} />

      <LightRays
        cx={cx}
        cy={cy}
        size={cardW * 0.42}
        color={color}
        start={REVEAL.flash}
        width={width}
        height={height}
        u={u}
        strength={theme.haloStrength * (rich ? 1.1 : 0.7)}
      />
      <Shockwave
        cx={cx}
        cy={cy}
        size={cardW * 0.3}
        color={color}
        start={REVEAL.flash}
        width={width}
        height={height}
        u={u}
        count={tier.id === 'legendary' ? 3 : 1}
      />

      {frame >= REVEAL.flip && (
        <div
          style={{
            position: 'absolute',
            left: cx - cardW / 2,
            top: cardY,
            width: cardW,
            height: cardH,
            opacity: appear,
            transform: `scale(${cardScale * Math.max(0.02, Math.abs(facing))}, ${cardScale})`,
          }}
        >
          <Card
            props={props}
            tier={tier}
            theme={theme}
            width={cardW}
            height={cardH}
            shine={shine}
            back={facing < 0}
            shade={(1 - Math.abs(facing)) * 0.55}
            frame={frame}
          />
        </div>
      )}

      {burst && (
        <Particles
          cx={cx}
          cy={cy}
          size={cardW * 0.4}
          color={color}
          start={REVEAL.flipEnd - 16}
          width={width}
          height={height}
          u={u}
        />
      )}
    </AbsoluteFill>
  )
}
