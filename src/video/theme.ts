import type { ThemeId } from './schema'

export type VideoTheme = {
  background: string
  text: string
  muted: string
  faint: string
  accent: string
  /** Edge darkening of the radial vignette. */
  vignette: string
  vignetteOpacity: number
  ambientOpacity: number
  grainOpacity: number
  haloStrength: number
  monogram: [string, string]
}

export const THEMES: Record<ThemeId, VideoTheme> = {
  dark: {
    background: '#0A0A0A',
    text: '#EDEDED',
    muted: '#767676',
    faint: 'rgba(237, 237, 237, 0.10)',
    accent: '#E3B341',
    vignette: '#000000',
    vignetteOpacity: 0.55,
    ambientOpacity: 0.07,
    grainOpacity: 0.06,
    haloStrength: 1,
    monogram: ['#26262A', '#1A1A1D'],
  },
  light: {
    background: '#FAFAFA',
    text: '#0A0A0A',
    muted: '#7A7A7A',
    faint: 'rgba(10, 10, 10, 0.09)',
    accent: '#BF8700',
    vignette: '#000000',
    vignetteOpacity: 0.05,
    ambientOpacity: 0.08,
    grainOpacity: 0.04,
    haloStrength: 0.7,
    monogram: ['#E4E4E7', '#D4D4D8'],
  },
}
