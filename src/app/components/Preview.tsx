import { Player, type PlayerRef } from '@remotion/player'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { FORMATS, type FormatId } from '../../video/formats'
import type { StarsVideoProps } from '../../video/schema'
import { compositionFor, posterFrameFor } from '../../video/composition'

type Props = {
  props: StarsVideoProps
  format: FormatId
  busy: string | null
}

export function Preview({ props, format, busy }: Props) {
  const player = useRef<PlayerRef>(null)
  const [playing, setPlaying] = useState(false)
  const { width, height } = FORMATS[format]
  const { component, durationInFrames, fps } = compositionFor(format, props.style)

  useEffect(() => {
    const current = player.current
    if (!current) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    current.addEventListener('play', onPlay)
    current.addEventListener('pause', onPause)
    return () => {
      current.removeEventListener('play', onPlay)
      current.removeEventListener('pause', onPause)
    }
  }, [format, durationInFrames])

  useEffect(() => {
    const current = player.current
    if (!current) return
    current.seekTo(0)
    current.play()
    // If the browser still refuses to autoplay, rest on a finished frame rather than the empty first one.
    const poster = window.setTimeout(() => {
      if (!current.isPlaying()) current.seekTo(posterFrameFor(props.style))
    }, 400)
    return () => window.clearTimeout(poster)
  }, [props, format])

  return (
    <div
      className="w-full select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
      onDragStart={(event) => event.preventDefault()}
    >
      <div className="relative overflow-hidden rounded-[20px] border border-line bg-surface p-1.5 shadow-[0_24px_64px_-24px_rgb(0_0_0/0.35)]">
        <div className="relative overflow-hidden rounded-[14px]" style={{ aspectRatio: `${width} / ${height}` }}>
          <Player
            key={`${format}-${props.style}`}
            ref={player}
            component={component}
            inputProps={props}
            durationInFrames={durationInFrames}
            fps={fps}
            compositionWidth={width}
            compositionHeight={height}
            style={{ width: '100%', height: '100%' }}
            autoPlay
            initiallyMuted
            loop
            clickToPlay
            spaceKeyToPlayOrPause
            acknowledgeRemotionLicense
          />
          <AnimatePresence>
            {busy ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 grid place-items-center bg-canvas/60 backdrop-blur-md"
              >
                <div className="relative overflow-hidden rounded-full border border-line bg-surface px-4 py-2 text-[13px] text-muted">
                  {busy}
                  <span className="absolute inset-0 animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--ink)_6%,transparent)] to-transparent" />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          {!playing && !busy ? (
            <button
              type="button"
              onClick={() => player.current?.play()}
              className="absolute inset-0 grid place-items-center"
              aria-label="Play preview"
            >
              <span className="grid size-14 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md">
                <svg viewBox="0 0 24 24" className="ml-0.5 size-5 fill-current" aria-hidden>
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
                </svg>
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
