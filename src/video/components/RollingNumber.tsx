import { useMemo, type CSSProperties } from 'react'
import { Easing, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { CELL_EM, COMMA_EM, leadingGapEm } from '../layout'
import { clamp } from '../math'

type Props = {
  /** Final value; decides how many digit columns exist. */
  value: number
  valueAt: (frame: number) => number
  fontSize: number
  color: string
  fontFamily: string
}

/** Frames a digit takes to slide into place after it changes. */
const SETTLE = 8
const ENTER_EM = 0.22
/** Columns changing faster than they can settle swap crisply and recede. */
const FAST_DIM = 0.55

const settleEasing = Easing.out(Easing.cubic)
/** Frames the optical left shift is averaged over, so it glides when the leading digit changes. */
const ALIGN_SMOOTHING = 10

/**
 * Always shows whole digits. A changed digit replaces the old one and rises
 * into place as it fades in, so no frame shows a half-cut or doubled glyph.
 */
export function RollingNumber({ value, valueAt, fontSize, color, fontFamily }: Props) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const digits = String(Math.max(0, Math.round(value))).length
  const cell = CELL_EM * fontSize

  const appearAt = useMemo(() => {
    const frames: number[] = [0]
    for (let place = 1; place < digits; place++) {
      let f = 0
      while (f < durationInFrames && Math.floor(valueAt(f)) < 10 ** place) f++
      frames.push(f)
    }
    return frames
  }, [digits, durationInFrames, valueAt])

  const digitAt = (f: number, place: number) => Math.floor(Math.floor(Math.max(0, valueAt(f))) / 10 ** place) % 10

  const glyph = (digit: number, style: CSSProperties, key: string) => (
    <div
      key={key}
      style={{
        position: 'absolute',
        top: 0,
        // Geist's digit advance can exceed the cell, and CSS stops centering
        // overflowing text. A 1em box keeps the ink (which fits) centered.
        left: '50%',
        width: fontSize,
        marginLeft: -fontSize / 2,
        height: fontSize,
        lineHeight: `${fontSize}px`,
        textAlign: 'center',
        ...style,
      }}
    >
      {digit}
    </div>
  )

  // Narrow leading digits (like 1) leave space inside their cell. Shift by the
  // gap of the digit on screen now, not the final one, so the ink stays on the
  // left edge throughout the count.
  let gap = 0
  for (let k = 0; k < ALIGN_SMOOTHING; k++) {
    const shown = String(Math.floor(Math.max(0, valueAt(frame - k))))
    gap += leadingGapEm(Number(shown[0]))
  }
  const shift = (gap / ALIGN_SMOOTHING) * fontSize

  const columns = []
  for (let place = digits - 1; place >= 0; place--) {
    const presence =
      place === 0
        ? 1
        : spring({ frame: frame - appearAt[place]!, fps, config: { damping: 200 }, durationInFrames: 14 })

    const current = digitAt(frame, place)
    let lastChange = -1
    let changes = 0
    for (let k = 0; k < SETTLE; k++) {
      if (digitAt(frame - k, place) !== digitAt(frame - k - 1, place)) {
        if (lastChange < 0) lastChange = k
        changes++
      }
    }
    const fast = clamp((changes - 1) / 3, 0, 1)

    let content
    if (lastChange < 0 || fast > 0) {
      content = glyph(current, {}, 'still')
    } else {
      const t = settleEasing((lastChange + 1) / (SETTLE + 1))
      content = glyph(current, { opacity: t, transform: `translateY(${(1 - t) * ENTER_EM * fontSize}px)` }, 'in')
    }

    columns.push(
      <div
        key={`d${place}`}
        style={{
          position: 'relative',
          width: cell * presence,
          height: fontSize,
          opacity: presence * (1 - FAST_DIM * fast),
        }}
      >
        {content}
      </div>,
    )

    if (place > 0 && place % 3 === 0) {
      columns.push(
        <div
          key={`c${place}`}
          style={{
            width: COMMA_EM * fontSize * presence,
            height: fontSize,
            lineHeight: `${fontSize}px`,
            opacity: presence,
            textAlign: 'center',
          }}
        >
          ,
        </div>,
      )
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: fontSize,
        fontSize,
        fontFamily,
        fontWeight: 600,
        color,
        whiteSpace: 'nowrap',
        transform: `translateX(${-shift}px)`,
      }}
    >
      {columns}
    </div>
  )
}
