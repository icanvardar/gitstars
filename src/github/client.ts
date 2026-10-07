const API = 'https://api.github.com'

export type GitHubErrorKind = 'not-found' | 'rate-limited' | 'unauthorized' | 'network' | 'unknown'

export class GitHubError extends Error {
  readonly kind: GitHubErrorKind
  /** Unix ms when the rate limit window resets. */
  readonly resetAt: number | null

  constructor(kind: GitHubErrorKind, message: string, resetAt: number | null = null) {
    super(message)
    this.name = 'GitHubError'
    this.kind = kind
    this.resetAt = resetAt
  }
}

export type GhOptions = {
  token?: string | null
  accept?: string
  signal?: AbortSignal
}

export type GhResponse<T> = {
  data: T
  headers: Headers
}

export async function gh<T>(path: string, options: GhOptions = {}): Promise<GhResponse<T>> {
  const headers: Record<string, string> = {
    Accept: options.accept ?? 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (options.token) headers.Authorization = `Bearer ${options.token}`

  let response: Response
  try {
    response = await fetch(`${API}${path}`, { headers, signal: options.signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new GitHubError('network', 'Could not reach GitHub. Check your connection and try again.')
  }

  if (response.ok) {
    return { data: (await response.json()) as T, headers: response.headers }
  }

  const remaining = response.headers.get('x-ratelimit-remaining')
  const reset = response.headers.get('x-ratelimit-reset')
  if ((response.status === 403 || response.status === 429) && remaining === '0') {
    throw new GitHubError(
      'rate-limited',
      'GitHub rate limit reached for your network.',
      reset ? Number(reset) * 1000 : null,
    )
  }
  if (response.status === 404) {
    throw new GitHubError('not-found', 'Repository not found.')
  }
  if (response.status === 401) {
    throw new GitHubError('unauthorized', 'GitHub needs authentication for this request.')
  }
  throw new GitHubError('unknown', `GitHub responded with ${response.status}.`)
}

export type RepoRef = { owner: string; repo: string }

const NAME = /^[A-Za-z0-9_.-]+$/

export function parseRepoInput(input: string): RepoRef | null {
  let value = input.trim()
  if (!value) return null

  value = value
    .replace(/^git\+/, '')
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '')
    .replace(/^git@github\.com:/i, '')
    .replace(/[?#].*$/, '')

  const [owner, rawRepo] = value.split('/')
  const repo = rawRepo?.replace(/\.git$/i, '')
  if (!owner || !repo || !NAME.test(owner) || !NAME.test(repo)) return null
  return { owner, repo }
}
