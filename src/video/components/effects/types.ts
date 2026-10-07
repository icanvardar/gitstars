export type EffectProps = {
  /** Center of the finale star. */
  cx: number
  cy: number
  /** Rendered star size; effects scale from it. */
  size: number
  color: string
  /** Frame the effect starts. */
  start: number
  width: number
  height: number
  u: number
}

export const clampBoth = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
