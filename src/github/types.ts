export type StarPoint = {
  /** Unix time in milliseconds. */
  t: number
  /** Cumulative star count at `t`. */
  v: number
}

export type Stargazer = {
  login: string
  avatarUrl: string
}

export type RepoData = {
  owner: string
  repo: string
  description: string | null
  ownerAvatarUrl: string
  ownerIsOrg: boolean
  stars: number
  forks: number
  watchers: number
  createdAt: number
  /** Only available with an authenticated GitHub token. */
  history: StarPoint[] | null
  /** Most recent first. */
  stargazers: Stargazer[]
  fetchedAt: number
}
