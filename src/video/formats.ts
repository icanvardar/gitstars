export const FORMATS = {
  landscape: { width: 1920, height: 1080, label: '16:9' },
  square: { width: 1080, height: 1080, label: '1:1' },
  portrait: { width: 1080, height: 1350, label: '4:5' },
} as const

export type FormatId = keyof typeof FORMATS

export const FORMAT_IDS = Object.keys(FORMATS) as FormatId[]

export function isFormatId(value: unknown): value is FormatId {
  return typeof value === 'string' && value in FORMATS
}
