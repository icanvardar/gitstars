/** Reveal style beats, in frames at 60fps. */
export const REVEAL_DURATION = 660

export const REVEAL = {
  /** Spotlight and floor glow come up. */
  stage: 0,
  /** Tier-colored light pillars rise and a lens flare crosses the stage. */
  flares: 30,
  flareLine: 96,
  /** Owner avatar badge. */
  badge: 132,
  badgeOut: 240,
  /** The star count rolls up from zero. */
  count: 258,
  countEnd: 372,
  countOut: 392,
  /** Flash, then the card spins in. */
  flash: 400,
  flip: 404,
  flipEnd: 470,
  shine: 484,
  /** Everything is in place; the card floats for the rest of the hold. */
  settled: 540,
} as const
