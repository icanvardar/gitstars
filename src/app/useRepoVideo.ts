import { useCallback, useRef, useState } from 'react'
import { loadAvatar, sizedAvatarUrl } from '../github/avatars'
import { GitHubError, type RepoRef } from '../github/client'
import { loadRepoData } from '../github/starHistory'
import type { RepoData } from '../github/types'
import { MAX_STARGAZERS } from '../video/layout'
import type { StarsVideoProps } from '../video/schema'

export type VideoContent = Omit<StarsVideoProps, 'theme' | 'style'>

export type LoadState =
  | { status: 'idle' }
  | { status: 'loading'; message: string }
  | { status: 'error'; message: string }
  | { status: 'ready'; repo: RepoData }

/** Optional personal token for the real star-history curve until "Sign in with GitHub" ships. */
function storedToken(): string | null {
  try {
    return localStorage.getItem('gitstars:token')
  } catch {
    return null
  }
}

async function toVideoContent(data: RepoData): Promise<VideoContent> {
  const people = data.stargazers.slice(0, MAX_STARGAZERS)
  const [ownerAvatar, ...avatars] = await Promise.all([
    loadAvatar(sizedAvatarUrl(data.ownerAvatarUrl, 160)),
    ...people.map((person) => loadAvatar(sizedAvatarUrl(person.avatarUrl, 120))),
  ])
  return {
    owner: data.owner,
    repo: data.repo,
    ownerAvatar: ownerAvatar ?? null,
    ownerIsOrg: data.ownerIsOrg,
    stars: data.stars,
    history: data.history,
    stargazers: people.map((person, i) => ({ login: person.login, avatar: avatars[i] ?? null })),
    stats:
      data.forks === undefined ? null : { forks: data.forks, watchers: data.watchers, createdAt: data.createdAt },
    asOf: data.fetchedAt,
  }
}

function describeError(error: unknown): string {
  if (error instanceof GitHubError) {
    switch (error.kind) {
      case 'not-found':
        return "We couldn't find that repository. Private repos are coming soon."
      case 'rate-limited': {
        const minutes = error.resetAt ? Math.max(1, Math.ceil((error.resetAt - Date.now()) / 60000)) : null
        return minutes
          ? `GitHub's hourly limit for your network is used up. Try again in ${minutes} min.`
          : "GitHub's hourly limit for your network is used up. Try again soon."
      }
      default:
        return error.message
    }
  }
  return 'Something went wrong. Please try again.'
}

export function useRepoVideo() {
  const [state, setState] = useState<LoadState>({ status: 'idle' })
  const [content, setContent] = useState<VideoContent | null>(null)
  const controller = useRef<AbortController | null>(null)

  const load = useCallback(async (ref: RepoRef) => {
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort

    setState({ status: 'loading', message: 'Reading repository' })
    try {
      const repo = await loadRepoData(ref, {
        token: storedToken(),
        signal: abort.signal,
        onStatus: (message) => !abort.signal.aborted && setState({ status: 'loading', message }),
      })
      setState({ status: 'loading', message: 'Preparing your video' })
      const next = await toVideoContent(repo)
      if (abort.signal.aborted) return
      setContent(next)
      setState({ status: 'ready', repo })
    } catch (error) {
      if (abort.signal.aborted) return
      setState({ status: 'error', message: describeError(error) })
    }
  }, [])

  return { state, content, load }
}
