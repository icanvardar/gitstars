import type { StarsVideoProps } from './schema'

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.UTC(2026, 9, 7)

/** A plausible S-shaped growth curve: a slow start, a launch spike, then steady growth. */
function syntheticHistory(stars: number, days: number): { t: number; v: number }[] {
  const points = []
  for (let i = 0; i <= 60; i++) {
    const x = i / 60
    const launch = 1 / (1 + Math.exp(-14 * (x - 0.42)))
    const steady = x * 0.35
    points.push({ x, y: launch * 0.65 + steady })
  }
  const max = points.at(-1)!.y
  const min = points[0]!.y
  return points.map(({ x, y }) => ({
    t: NOW - (1 - x) * days * DAY,
    v: Math.max(1, Math.round(((y - min) / (max - min)) * stars)),
  }))
}

const LOGINS = [
  'ada',
  'linus',
  'grace',
  'ken',
  'margaret',
  'dennis',
  'barbara',
  'alan',
  'radia',
  'guido',
  'frances',
  'bjarne',
  'hedy',
  'donald',
]

export const sampleProps: StarsVideoProps = {
  owner: 'gitstars',
  repo: 'gitstars',
  ownerAvatar: null,
  ownerIsOrg: true,
  stars: 12480,
  history: null,
  stargazers: LOGINS.map((login) => ({ login, avatar: null })),
  stats: { forks: 1240, watchers: 312, createdAt: NOW - 3.4 * 365 * DAY },
  asOf: NOW,
  theme: 'dark',
  style: 'minimal',
}

/** One sample per tier, from plain (under 100) to legendary. */
export const TIER_SAMPLE_STARS = [64, 180, 640, 3140, 12480, 61200, 312400] as const

export function tierSampleProps(stars: number): StarsVideoProps {
  return { ...sampleProps, stars }
}

export const sampleHistoryProps: StarsVideoProps = {
  ...sampleProps,
  repo: 'rocket',
  stars: 48210,
  history: syntheticHistory(48210, 900),
}
