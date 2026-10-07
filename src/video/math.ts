export type Point = { x: number; y: number }

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
export const lerp = (from: number, to: number, t: number) => from + (to - from) * t

const integer = new Intl.NumberFormat('en-US')
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const monthYear = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
const fullDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const formatInteger = (n: number) => integer.format(Math.round(n))
export const formatCompact = (n: number) => compact.format(n).toUpperCase()
/** Compact form that never rounds up: 12,480 is 12.4K, not 12.5K. */
export function formatCompactFloor(n: number): string {
  const value = Math.max(0, Math.floor(n))
  if (value < 1000) return String(value)
  const step = 10 ** (Math.floor(Math.log10(value)) - 2)
  return formatCompact(Math.floor(value / step) * step)
}
const YEAR = 365.25 * 24 * 60 * 60 * 1000

/** Repo age as a value and unit, e.g. 3.4 Years or 8 Months. */
export function formatAge(ms: number): { label: string; value: string } {
  const years = Math.max(0, ms) / YEAR
  if (years >= 10) return { label: 'Years', value: String(Math.floor(years)) }
  if (years >= 1) return { label: 'Years', value: (Math.floor(years * 10) / 10).toString() }
  const months = Math.max(1, Math.floor(years * 12))
  return { label: months === 1 ? 'Month' : 'Months', value: String(months) }
}

export const formatMonthYear = (t: number) => monthYear.format(t)
export const formatFullDate = (t: number) => fullDate.format(t)

/** 10, 25, 50, 100, 250, 500, 1K ... the first milestone at or above `stars`. */
export function nextMilestone(stars: number): number {
  for (let magnitude = 10; ; magnitude *= 10) {
    for (const step of [1, 2.5, 5]) {
      const milestone = step * magnitude
      if (milestone >= stars) return milestone
    }
  }
}

/**
 * Monotone cubic interpolation (Fritsch-Carlson). The curve never overshoots
 * the data, so a cumulative star count never appears to dip.
 */
export function monotoneSpline(input: Point[]) {
  const points = mergeClose(input)
  const n = points.length
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const dx = xs.slice(1).map((x, i) => x - xs[i]!)
  const slopes = dx.map((d, i) => (ys[i + 1]! - ys[i]!) / d)

  const tangents = xs.map((_, i) => {
    if (i === 0) return slopes[0] ?? 0
    if (i === n - 1) return slopes[n - 2] ?? 0
    const m0 = slopes[i - 1]!
    const m1 = slopes[i]!
    if (m0 * m1 <= 0) return 0
    const d0 = dx[i - 1]!
    const d1 = dx[i]!
    return (3 * (d0 + d1)) / ((2 * d1 + d0) / m0 + (d1 + 2 * d0) / m1)
  })

  let path = `M ${xs[0]!.toFixed(2)} ${ys[0]!.toFixed(2)}`
  for (let i = 0; i < n - 1; i++) {
    const d = dx[i]! / 3
    path += ` C ${(xs[i]! + d).toFixed(2)} ${(ys[i]! + tangents[i]! * d).toFixed(2)}, ${(xs[i + 1]! - d).toFixed(2)} ${(ys[i + 1]! - tangents[i + 1]! * d).toFixed(2)}, ${xs[i + 1]!.toFixed(2)} ${ys[i + 1]!.toFixed(2)}`
  }

  const at = (x: number): number => {
    if (n === 1 || x <= xs[0]!) return ys[0]!
    if (x >= xs[n - 1]!) return ys[n - 1]!
    let lo = 0
    let hi = n - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (xs[mid]! <= x) lo = mid
      else hi = mid
    }
    const h = dx[lo]!
    const s = (x - xs[lo]!) / h
    const s2 = s * s
    const s3 = s2 * s
    return (
      (2 * s3 - 3 * s2 + 1) * ys[lo]! +
      (s3 - 2 * s2 + s) * h * tangents[lo]! +
      (-2 * s3 + 3 * s2) * ys[lo + 1]! +
      (s3 - s2) * h * tangents[lo + 1]!
    )
  }

  return { path, at, first: points[0]!, last: points[n - 1]! }
}

function mergeClose(points: Point[]): Point[] {
  const out: Point[] = []
  for (const point of points) {
    const prev = out.at(-1)
    if (prev && point.x - prev.x < 0.5) {
      prev.y = point.y
    } else {
      out.push({ ...point })
    }
  }
  return out
}

/** Deterministic PRNG so every render of a frame is identical. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A five-point star centered in a 24x24 box. */
export function starPath(innerRatio = 0.5): string {
  const cx = 12
  const cy = 12.6
  const outer = 10.4
  const inner = outer * innerRatio
  const parts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const angle = -Math.PI / 2 + (i * Math.PI) / 5
    parts.push(`${i === 0 ? 'M' : 'L'} ${(cx + r * Math.cos(angle)).toFixed(3)} ${(cy + r * Math.sin(angle)).toFixed(3)}`)
  }
  return `${parts.join(' ')} Z`
}
