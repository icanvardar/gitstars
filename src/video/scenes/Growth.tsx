import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { StarCurve } from '../components/StarCurve'
import { Stargazers } from '../components/Stargazers'
import type { Layout } from '../layout'
import type { StarModel } from '../model'
import type { StarsVideoProps } from '../schema'
import type { VideoTheme } from '../theme'
import { FINALE } from '../timing'

type Props = {
  props: StarsVideoProps
  model: StarModel
  layout: Layout
  theme: VideoTheme
}

const clampBoth = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

export function Growth({ props, model, layout, theme }: Props) {
  const frame = useCurrentFrame()
  const recede = interpolate(frame, [FINALE.start, FINALE.start + 26], [0, 1], clampBoth)
  const stackOut = interpolate(frame, [FINALE.start, FINALE.start + 24], [1, 0], clampBoth)

  return (
    <>
      <AbsoluteFill style={{ opacity: 1 - recede }}>
        <StarCurve model={model} layout={layout} theme={theme} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: stackOut }}>
        <Stargazers stargazers={props.stargazers} layout={layout} theme={theme} />
      </AbsoluteFill>
    </>
  )
}
