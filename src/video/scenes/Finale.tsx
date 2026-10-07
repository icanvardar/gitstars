import { spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Constellation } from '../components/effects/Constellation'
import { LightRays } from '../components/effects/LightRays'
import { LightSweep } from '../components/effects/LightSweep'
import { Particles } from '../components/effects/Particles'
import { Shockwave } from '../components/effects/Shockwave'
import type { EffectProps } from '../components/effects/types'
import { STAR, StarMark } from '../components/StarMark'
import { MONO, SANS } from '../fonts'
import type { Layout } from '../layout'
import { formatCompact, formatFullDate } from '../math'
import type { StarsVideoProps } from '../schema'
import type { VideoTheme } from '../theme'
import type { Tier } from '../tiers'
import { FINALE } from '../timing'

type Props = {
  props: StarsVideoProps
  layout: Layout
  theme: VideoTheme
  tier: Tier | null
}

function effectBase({ layout, theme, tier }: Omit<Props, 'props'>): EffectProps {
  const { star } = layout.finale
  return {
    cx: star.left + star.size / 2,
    cy: star.top + star.size / 2,
    size: star.size,
    color: tier?.palette.accent ?? theme.accent,
    start: FINALE.starFill,
    width: layout.width,
    height: layout.height,
    u: layout.u,
  }
}

/** Tier effects that sit behind the number. */
export function FinaleBackdrop({ layout, theme, tier }: Omit<Props, 'props'>) {
  if (!tier) return null
  const base = effectBase({ layout, theme, tier })
  const id = tier.id
  return (
    <>
      {(id === 'rare' || id === 'legendary') && (
        <LightRays {...base} start={FINALE.starFill - 6} strength={theme.haloStrength} />
      )}
      {id === 'bronze' && <Shockwave {...base} />}
      {id === 'icon' && <Shockwave {...base} />}
      {id === 'legendary' && <Shockwave {...base} count={3} />}
    </>
  )
}

export function Finale({ props, layout, theme, tier }: Props) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { finale, width, u } = layout
  const base = effectBase({ layout, theme, tier })

  const rise = (start: number) => spring({ frame: frame - start, fps, config: { damping: 200 }, durationInFrames: 36 })
  const dateIn = rise(FINALE.date)
  const date = formatFullDate(props.asOf)

  const faces = [
    { name: props.owner, avatar: props.ownerAvatar },
    ...props.stargazers.map((s) => ({ name: s.login, avatar: s.avatar })),
  ]

  return (
    <>
      <StarMark layout={layout} theme={theme} color={base.color} prism={tier?.id === 'legendary'} />
      {(tier?.id === 'silver' || tier?.id === 'rare') && <LightSweep {...base} start={FINALE.starFill + 10} path={STAR} />}
      {tier?.id === 'gold' && <Particles {...base} />}
      {tier?.id === 'icon' && (
        <Constellation
          {...base}
          start={FINALE.star}
          impact={FINALE.starFill}
          faces={faces}
          theme={theme}
          fontFamily={SANS}
        />
      )}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width,
          top: finale.date.top,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: finale.date.fontSize,
          lineHeight: 1,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: theme.muted,
          opacity: dateIn * 0.7,
          transform: `translateY(${(1 - dateIn) * 10 * u}px)`,
        }}
      >
        {tier ? (
          <>
            <span style={{ color: base.color }}>{formatCompact(tier.milestone)} milestone</span> · {date}
          </>
        ) : (
          <>As of {date}</>
        )}
      </div>
    </>
  )
}
