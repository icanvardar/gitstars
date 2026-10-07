/** Width of one odometer digit cell, in em. Wide enough that no Geist digit is clipped. */
export const CELL_EM = 0.62
export const COMMA_EM = 0.28
/** Small repos show more of their stargazers; big ones keep the header calm. */
export const MAX_STARGAZERS = 12
export function maxVisibleStargazers(stars: number): number {
  return stars < 100 ? MAX_STARGAZERS : 7
}

/** Geist SemiBold digit metrics in em: [advance, ink left, ink right]. */
const DIGIT_METRICS: [number, number, number][] = [
  [0.683, 0.046, 0.637],
  [0.427, 0.038, 0.32],
  [0.642, 0.059, 0.584],
  [0.637, 0.046, 0.591],
  [0.643, 0.026, 0.597],
  [0.656, 0.057, 0.598],
  [0.615, 0.046, 0.579],
  [0.538, 0.02, 0.538],
  [0.644, 0.036, 0.608],
  [0.618, 0.036, 0.572],
]

/**
 * Vertical ink bounds of Geist digits inside a 1em line box. Spacing is measured
 * from the ink so gaps look the same at every size.
 */
export const NUMBER_INK_TOP = 0.13
export const NUMBER_INK_BOTTOM = 0.86

/** Empty space between a digit's ink and the left/right edge of its centered cell. */
function cellGaps(digit: number) {
  const [advance, inkLeft, inkRight] = DIGIT_METRICS[digit] ?? [CELL_EM, 0, CELL_EM]
  const start = (CELL_EM - advance) / 2
  return { left: start + inkLeft, right: CELL_EM - (start + inkRight) }
}

export type Layout = ReturnType<typeof computeLayout>

/** Empty space before the ink of a leading digit inside its cell, in em. */
export function leadingGapEm(digit: number): number {
  return cellGaps(digit).left
}

/**
 * Width of the visible ink of the whole number. The counter shifts itself left
 * by its leading gap, so its ink starts exactly at the container's left edge.
 */
export function inkWidthEm(stars: number): number {
  const digits = String(Math.max(0, Math.round(stars)))
  return numberWidthEm(stars) - cellGaps(Number(digits[0])).left - cellGaps(Number(digits.at(-1))).right
}

export function numberWidthEm(stars: number): number {
  const digits = String(Math.max(0, Math.round(stars))).length
  const commas = Math.floor((digits - 1) / 3)
  return digits * CELL_EM + commas * COMMA_EM
}

export type LayoutMode = 'history' | 'milestone'

export function computeLayout(
  width: number,
  height: number,
  stars: number,
  stargazerCount: number,
  mode: LayoutMode,
) {
  const u = Math.min(width, height) / 1080
  const aspect = width / height
  const orientation = aspect > 1.2 ? 'landscape' : aspect < 0.9 ? 'portrait' : 'square'
  const pad = (orientation === 'landscape' ? 120 : 88) * u
  const innerWidth = width - pad * 2

  const visible = Math.min(maxVisibleStargazers(stars), stargazerCount)
  const stackSize = 48 * u
  const stackOverlap = (visible > 7 ? 18 : 14) * u
  const stackWidth = visible ? stackSize + (visible - 1) * (stackSize - stackOverlap) : 0

  const avatar = 64 * u
  const headerGap = 20 * u
  const header = {
    top: pad,
    left: pad,
    avatar,
    gap: headerGap,
    fontSize: 40 * u,
    maxTextWidth: innerWidth - avatar - headerGap - (stackWidth ? stackWidth + 40 * u : 0),
  }

  const stack = {
    count: visible,
    size: stackSize,
    overlap: stackOverlap,
    ring: 3 * u,
    top: pad + (avatar - stackSize) / 2,
    right: pad,
  }

  const areaTop = pad + avatar + 36 * u
  const areaBottom = height - pad

  const widthEm = numberWidthEm(stars)
  const baseFont = { landscape: 220, square: 196, portrait: 210 }[orientation] * u
  const fontSize = Math.min(baseFont, innerWidth / widthEm)
  const inkHeight = (NUMBER_INK_BOTTOM - NUMBER_INK_TOP) * fontSize

  const labelSize = 20 * u
  const numberToTrackLabels = 64 * u
  const trackLabelsToLine = 22 * u

  // Milestone mode reads as one compact group, centered under the header.
  // History mode anchors the number high so the curve gets the room.
  const trackBlock = numberToTrackLabels + labelSize + trackLabelsToLine
  const heroHeight =
    mode === 'milestone' ? inkHeight + trackBlock : inkHeight
  const heroTop =
    mode === 'milestone' ? areaTop + (areaBottom - areaTop - heroHeight) / 2 - 12 * u : areaTop + 48 * u

  const inkTop = heroTop
  const number = {
    top: inkTop - NUMBER_INK_TOP * fontSize,
    left: pad,
    fontSize,
    widthEm,
  }
  const inkBottom = inkTop + inkHeight

  const trackLabelTop = inkBottom + numberToTrackLabels
  const track = { left: pad, width: innerWidth, labelTop: trackLabelTop, labelSize, y: trackLabelTop + labelSize + trackLabelsToLine }


  const chartTop = inkBottom + (orientation === 'portrait' ? 110 : 72) * u
  const chartBottom = areaBottom - 52 * u
  const chart = { left: pad, top: chartTop, width: innerWidth, height: chartBottom - chartTop }

  const scale = Math.min(1.3, (innerWidth * 0.8) / (widthEm * fontSize))
  const finalFont = fontSize * scale
  const starSize = (orientation === 'landscape' ? 120 : 128) * u
  const starGap = 52 * u
  const dateGap = 56 * u
  const dateSize = 20 * u
  const finalInk = (NUMBER_INK_BOTTOM - NUMBER_INK_TOP) * finalFont
  const groupHeight = starSize + starGap + finalInk + dateGap + dateSize
  const groupTop = (height - groupHeight) / 2 + (pad + avatar) / 4
  const finalInkTop = groupTop + starSize + starGap

  const finale = {
    scale,
    numberLeft: (width - inkWidthEm(stars) * finalFont) / 2,
    numberTop: finalInkTop - NUMBER_INK_TOP * finalFont,
    star: { size: starSize, top: groupTop, left: (width - starSize) / 2 },
    date: { top: finalInkTop + finalInk + dateGap, fontSize: dateSize },
  }

  return { u, width, height, orientation, pad, header, stack, number, track, chart, finale }
}
