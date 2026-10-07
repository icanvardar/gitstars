import { readCache, writeCache } from './cache'
import { gh, GitHubError, type RepoRef } from './client'
import type { RepoData, StarPoint, Stargazer } from './types'

const PER_PAGE = 100
/** GitHub refuses stargazer pages beyond this, i.e. the first 40k stars. */
const MAX_PAGES = 400
const SAMPLE_PAGES = 12
const MAX_POINTS = 160
const MAX_STARGAZERS = 24
const MAX_EVENT_PAGES = 3

type ApiRepo = {
  name: string
  full_name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  subscribers_count?: number
  created_at: string
  owner: { login: string; avatar_url: string; type: string }
}

type ApiStargazer = {
  starred_at: string
  user: { login: string; avatar_url: string } | null
}

type ApiEvent = {
  type: string
  created_at: string
  actor: { login: string; avatar_url: string }
}

export type LoadOptions = {
  /**
   * Unlocks the real star-history curve for repos the token's user administers.
   * Reserved for "Sign in with GitHub".
   */
  token?: string | null
  signal?: AbortSignal
  onStatus?: (status: string) => void
}

export async function loadRepoData(ref: RepoRef, options: LoadOptions = {}): Promise<RepoData> {
  const { token = null, signal, onStatus } = options
  const cacheKey = `v2:${ref.owner}/${ref.repo}`.toLowerCase() + (token ? ':auth' : '')

  const cached = await readCache<RepoData>(cacheKey)
  if (cached) return cached

  onStatus?.('Reading repository')
  const { data: repo } = await gh<ApiRepo>(`/repos/${ref.owner}/${ref.repo}`, { token, signal })
  const [owner = ref.owner, name = repo.name] = repo.full_name.split('/')
  const stars = repo.stargazers_count
  const totalPages = Math.ceil(stars / PER_PAGE)

  let history: StarPoint[] | null = null
  let stargazers: Stargazer[] = []

  if (token && stars > 0) {
    onStatus?.('Tracing star history')
    try {
      const sampled = await sampleStargazers(owner, name, stars, token, signal)
      history = sampled.history
      if (totalPages <= MAX_PAGES) stargazers = sampled.recent
    } catch (error) {
      // GitHub only lists stargazers to people with admin access to the repo.
      const restricted = error instanceof GitHubError && (error.kind === 'not-found' || error.kind === 'unauthorized')
      if (!restricted) throw error
    }
  }

  if (stargazers.length === 0 && stars > 0) {
    onStatus?.('Finding recent stargazers')
    stargazers = await recentStargazersFromEvents(owner, name, token, signal)
  }

  const data: RepoData = {
    owner,
    repo: name,
    description: repo.description,
    ownerAvatarUrl: repo.owner.avatar_url,
    ownerIsOrg: repo.owner.type === 'Organization',
    stars,
    forks: repo.forks_count,
    watchers: repo.subscribers_count ?? 0,
    createdAt: Date.parse(repo.created_at),
    history,
    stargazers,
    fetchedAt: Date.now(),
  }
  await writeCache(cacheKey, data)
  return data
}

async function sampleStargazers(
  owner: string,
  repo: string,
  stars: number,
  token: string,
  signal?: AbortSignal,
): Promise<{ history: StarPoint[]; recent: Stargazer[] }> {
  const pages = Math.min(Math.ceil(stars / PER_PAGE), MAX_PAGES)
  const exhaustive = pages <= SAMPLE_PAGES
  const pageNumbers = exhaustive
    ? range(1, pages)
    : [...new Set(range(0, SAMPLE_PAGES - 1).map((i) => Math.round(1 + (i * (pages - 1)) / (SAMPLE_PAGES - 1))))]

  const fetched = await mapLimit(pageNumbers, 4, async (page) => {
    const { data } = await gh<ApiStargazer[]>(
      `/repos/${owner}/${repo}/stargazers?per_page=${PER_PAGE}&page=${page}`,
      { token, signal, accept: 'application/vnd.github.star+json' },
    )
    return { page, items: data }
  })
  fetched.sort((a, b) => a.page - b.page)

  const points: StarPoint[] = []
  for (const { page, items } of fetched) {
    const offset = (page - 1) * PER_PAGE
    if (exhaustive) {
      items.forEach((item, i) => points.push({ t: Date.parse(item.starred_at), v: offset + i + 1 }))
    } else if (items[0]) {
      points.push({ t: Date.parse(items[0].starred_at), v: offset + 1 })
    }
  }

  const last = fetched.at(-1)
  const lastItem = last?.items.at(-1)
  if (last && lastItem && !exhaustive) {
    points.push({ t: Date.parse(lastItem.starred_at), v: (last.page - 1) * PER_PAGE + last.items.length })
  }

  const now = Date.now()
  if (!points.length || points.at(-1)!.t < now) points.push({ t: now, v: stars })

  const recent: Stargazer[] = (last?.items ?? [])
    .slice()
    .reverse()
    .flatMap((item) => (item.user ? [{ login: item.user.login, avatarUrl: item.user.avatar_url }] : []))
    .slice(0, MAX_STARGAZERS)

  return { history: downsample(dedupe(points), MAX_POINTS), recent }
}

async function recentStargazersFromEvents(
  owner: string,
  repo: string,
  token: string | null,
  signal?: AbortSignal,
): Promise<Stargazer[]> {
  const seen = new Set<string>()
  const result: Stargazer[] = []
  for (let page = 1; page <= MAX_EVENT_PAGES && result.length < MAX_STARGAZERS; page++) {
    let events: ApiEvent[]
    try {
      ;({ data: events } = await gh<ApiEvent[]>(`/repos/${owner}/${repo}/events?per_page=100&page=${page}`, {
        token,
        signal,
      }))
    } catch (error) {
      if (page === 1) throw error
      break
    }
    for (const event of events) {
      if (event.type !== 'WatchEvent' || seen.has(event.actor.login)) continue
      seen.add(event.actor.login)
      result.push({ login: event.actor.login, avatarUrl: event.actor.avatar_url })
    }
    if (events.length < 100) break
  }
  return result.slice(0, MAX_STARGAZERS)
}

function dedupe(points: StarPoint[]): StarPoint[] {
  const out: StarPoint[] = []
  for (const point of points.sort((a, b) => a.t - b.t)) {
    const prev = out.at(-1)
    if (prev && prev.t === point.t) prev.v = Math.max(prev.v, point.v)
    else out.push({ ...point })
  }
  return out
}

function downsample(points: StarPoint[], max: number): StarPoint[] {
  if (points.length <= max) return points
  const step = (points.length - 1) / (max - 1)
  return range(0, max - 1).map((i) => points[Math.round(i * step)]!)
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await fn(items[index]!)
    }
  })
  await Promise.all(workers)
  return results
}
