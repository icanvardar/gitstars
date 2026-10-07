import { useSyncExternalStore } from 'react'
import type { ThemeId } from '../video/schema'

const query = '(prefers-color-scheme: dark)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

/** The OS color scheme, kept live as the user switches it. */
export function useSystemTheme(): ThemeId {
  return useSyncExternalStore(
    subscribe,
    () => (window.matchMedia(query).matches ? 'dark' : 'light'),
    () => 'dark',
  )
}
