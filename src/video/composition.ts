import { FORMATS, type FormatId } from './formats'
import { RevealVideo } from './reveal/RevealVideo'
import { REVEAL, REVEAL_DURATION } from './reveal/timing'
import type { StarsVideoProps, StyleId } from './schema'
import { StarsVideo } from './StarsVideo'
import { DURATION, FINALE, FPS } from './timing'

export function compositionFor(format: FormatId, style: StyleId) {
  const { width, height } = FORMATS[format]
  return {
    id: `stars-${style}-${format}`,
    component: style === 'reveal' ? RevealVideo : StarsVideo,
    width,
    height,
    fps: FPS,
    durationInFrames: style === 'reveal' ? REVEAL_DURATION : DURATION,
  }
}

/** A representative still: the settled finale, or the card after it lands. */
export function posterFrameFor(style: StyleId): number {
  return style === 'reveal' ? REVEAL.settled + 20 : FINALE.settled
}

export type { StarsVideoProps }
