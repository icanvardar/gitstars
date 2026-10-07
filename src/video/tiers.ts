import type { ThemeId } from './schema'

export const MILESTONES = [100, 250, 500, 1e3, 2.5e3, 5e3, 1e4, 2.5e4, 5e4, 1e5, 2.5e5, 5e5, 1e6] as const

export type TierId = 'base' | 'bronze' | 'silver' | 'gold' | 'rare' | 'icon' | 'legendary'
type MilestoneTierId = Exclude<TierId, 'base'>

export type TierPalette = {
  /** Star, halo and effect color on the video background. */
  accent: string
  /** Card material, top to bottom. */
  material: [string, string, string]
  /** Text and glyphs printed on the card. */
  ink: string
  /** Thin inner frame on the card. */
  edge: string
}

export type Tier = {
  id: TierId
  name: string
  /** The largest milestone the repo has reached. */
  milestone: number
  palette: TierPalette
}

/** Multicolor foil used by the legendary tier. */
export const PRISM = ['#FF7AB6', '#FFB86B', '#F9E86B', '#6BE3B0', '#6BB6FF', '#B69CFF'] as const

const TIER_FOR_MILESTONE: Record<number, MilestoneTierId> = {
  100: 'bronze',
  250: 'bronze',
  500: 'silver',
  1000: 'silver',
  2500: 'gold',
  5000: 'gold',
  10000: 'rare',
  25000: 'rare',
  50000: 'icon',
  100000: 'icon',
  250000: 'legendary',
  500000: 'legendary',
  1000000: 'legendary',
}

const NAMES: Record<MilestoneTierId, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  rare: 'Rare Gold',
  icon: 'Icon',
  legendary: 'Legendary',
}

const MATERIALS: Record<MilestoneTierId, Omit<TierPalette, 'accent'>> = {
  bronze: { material: ['#EBBE96', '#B97848', '#6B3D1F'], ink: '#2A1508', edge: 'rgba(255, 228, 200, 0.55)' },
  silver: { material: ['#F4F6F9', '#BAC3CD', '#76818D'], ink: '#191E24', edge: 'rgba(255, 255, 255, 0.7)' },
  gold: { material: ['#FCE9A6', '#E2B33F', '#98690C'], ink: '#271900', edge: 'rgba(255, 246, 210, 0.7)' },
  rare: { material: ['#FFF3C4', '#F2C24A', '#7A5304'], ink: '#1F1400', edge: 'rgba(255, 250, 225, 0.85)' },
  icon: { material: ['#FFFDF5', '#EFE2BF', '#BFA165'], ink: '#2A2112', edge: 'rgba(191, 161, 101, 0.8)' },
  legendary: { material: ['#2E2355', '#151029', '#06050C'], ink: '#F5F2FF', edge: 'rgba(182, 156, 255, 0.75)' },
}

const ACCENTS: Record<MilestoneTierId, Record<ThemeId, string>> = {
  bronze: { dark: '#D69462', light: '#A35E2C' },
  silver: { dark: '#CBD3DD', light: '#6C7682' },
  gold: { dark: '#E3B341', light: '#BF8700' },
  rare: { dark: '#F5C84F', light: '#B07800' },
  icon: { dark: '#F1E4C3', light: '#9C7F3F' },
  legendary: { dark: '#B69CFF', light: '#7254F0' },
}

/** Returns the tier for the largest milestone reached, or null below the first one. */
export function getTier(stars: number, theme: ThemeId): Tier | null {
  let milestone: number | null = null
  for (const m of MILESTONES) if (stars >= m) milestone = m
  if (milestone === null) return null
  const id = TIER_FOR_MILESTONE[milestone]!
  return { id, name: NAMES[id], milestone, palette: { accent: ACCENTS[id][theme], ...MATERIALS[id] } }
}

/** Tier-less material for repos under 100 stars in the Reveal style. */
export function baseTier(theme: ThemeId): Tier {
  return {
    id: 'base',
    name: 'Rising',
    milestone: 0,
    palette: {
      accent: theme === 'dark' ? '#A1A1AA' : '#71717A',
      material: theme === 'dark' ? ['#3A3A40', '#232327', '#121214'] : ['#F4F4F5', '#D4D4D8', '#A1A1AA'],
      ink: theme === 'dark' ? '#EDEDED' : '#18181B',
      edge: theme === 'dark' ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.8)',
    },
  }
}
