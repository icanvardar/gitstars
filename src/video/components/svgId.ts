import { useId } from 'react'

/** React ids contain characters that break `url(#id)` references. */
export function useSvgId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
}
