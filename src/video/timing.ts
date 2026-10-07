/** All values are frames at 60fps. */
export const FPS = 60
export const DURATION = 480

export const INTRO = {
  avatar: 4,
  name: 10,
  divider: 16,
  label: 22,
  number: 26,
  baseline: 36,
} as const

export const GROWTH = {
  start: 72,
  end: 300,
  stargazers: 84,
  stargazerStagger: 12,
} as const

export const FINALE = {
  start: 324,
  star: 340,
  starFill: 376,
  caption: 364,
  date: 376,
  /** Everything has settled by here; the rest is a still hold for a clean loop. */
  settled: 424,
} as const
