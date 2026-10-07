import { useMemo } from 'react'
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { Backdrop } from './components/Grain'
import { useVideoFonts } from './fonts'
import { computeLayout } from './layout'
import { buildStarModel, hasUsableHistory } from './model'
import { Counter } from './scenes/Counter'
import { Finale, FinaleBackdrop } from './scenes/Finale'
import { Growth } from './scenes/Growth'
import { Intro } from './scenes/Intro'
import type { StarsVideoProps } from './schema'
import { THEMES } from './theme'
import { getTier } from './tiers'
import { FINALE } from './timing'

export function StarsVideo(props: StarsVideoProps) {
  useVideoFonts()
  const frame = useCurrentFrame()
  const { width, height, durationInFrames } = useVideoConfig()
  const theme = THEMES[props.theme]
  const tier = getTier(props.stars, props.theme)
  const mode = hasUsableHistory(props) ? 'history' : 'milestone'
  const layout = useMemo(
    () => computeLayout(width, height, props.stars, props.stargazers.length, mode),
    [width, height, props.stars, props.stargazers.length, mode],
  )
  const model = useMemo(() => buildStarModel(props, layout), [props, layout])

  const push =
    tier?.id === 'legendary'
      ? interpolate(frame, [FINALE.starFill - 20, durationInFrames], [0, 0.04], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.quad),
        })
      : 0
  const { star } = layout.finale

  return (
    // The web renderer copies computed text styles onto a canvas, so host-page
    // values the Canvas API rejects (e.g. optimizeLegibility) must not leak in.
    <AbsoluteFill style={{ backgroundColor: theme.background, overflow: 'hidden', textRendering: 'auto' }}>
      <Backdrop theme={theme} width={width} height={height} />
      <AbsoluteFill
        style={{
          transform: push ? `scale(${1 + push})` : undefined,
          transformOrigin: `${star.left + star.size / 2}px ${height / 2}px`,
        }}
      >
        <Growth props={props} model={model} layout={layout} theme={theme} />
        <FinaleBackdrop layout={layout} theme={theme} tier={tier} />
        <Intro props={props} layout={layout} theme={theme} />
        <Counter stars={props.stars} model={model} layout={layout} theme={theme} />
        <Finale props={props} layout={layout} theme={theme} tier={tier} />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
