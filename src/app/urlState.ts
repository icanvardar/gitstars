import { isFormatId, type FormatId } from '../video/formats'
import type { StyleId, ThemeId } from '../video/schema'

export type UrlState = {
  repo: string | null
  theme: ThemeId
  format: FormatId
  style: StyleId
}

export function readUrlState(): UrlState {
  const params = new URLSearchParams(window.location.search)
  const theme = params.get('theme')
  const format = params.get('format')
  const style = params.get('style')
  return {
    repo: params.get('repo'),
    theme: theme === 'light' || theme === 'dark' ? theme : 'dark',
    format: isFormatId(format) ? format : 'square',
    style: style === 'reveal' ? 'reveal' : 'minimal',
  }
}

export function writeUrlState(state: UrlState) {
  const params = new URLSearchParams()
  if (state.repo) params.set('repo', state.repo)
  params.set('style', state.style)
  params.set('theme', state.theme)
  params.set('format', state.format)
  const next = `${window.location.pathname}?${params.toString().replace(/%2F/g, '/')}`
  if (next !== `${window.location.pathname}${window.location.search}`) {
    window.history.replaceState(null, '', next)
  }
}
