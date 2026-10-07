import { spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { RollingNumber } from '../components/RollingNumber'
import { SANS } from '../fonts'
import type { Layout } from '../layout'
import { lerp } from '../math'
import type { StarModel } from '../model'
import type { VideoTheme } from '../theme'
import { FINALE, INTRO } from '../timing'

type Props = {
  stars: number
  model: StarModel
  layout: Layout
  theme: VideoTheme
}

/** The hero number: rolls up during growth, then glides to center stage for the finale. */
export function Counter({ stars, model, layout, theme }: Props) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { number, finale, u } = layout

  const enter = spring({ frame: frame - INTRO.number, fps, config: { damping: 200 }, durationInFrames: 36 })
  const move = spring({
    frame: frame - FINALE.start,
    fps,
    config: { damping: 200, mass: 1.1 },
    durationInFrames: 54,
  })

  const x = lerp(number.left, finale.numberLeft, move)
  const y = lerp(number.top, finale.numberTop, move) + (1 - enter) * 20 * u
  const scale = lerp(1, finale.scale, move)

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transformOrigin: '0 0',
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          opacity: enter,
        }}
      >
        <RollingNumber value={stars} valueAt={model.valueAt} fontSize={number.fontSize} color={theme.text} fontFamily={SANS} />
      </div>
    </>
  )
}
