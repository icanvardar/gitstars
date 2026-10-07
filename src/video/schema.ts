import { z } from 'zod'

export const themeIdSchema = z.enum(['light', 'dark'])
export type ThemeId = z.infer<typeof themeIdSchema>

export const styleIdSchema = z.enum(['minimal', 'reveal'])
export type StyleId = z.infer<typeof styleIdSchema>

export const starsVideoSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  ownerAvatar: z.string().nullable(),
  ownerIsOrg: z.boolean(),
  stars: z.number().int().nonnegative(),
  /** Cumulative stars over time. When null the video shows progress toward the next milestone. */
  history: z.array(z.object({ t: z.number(), v: z.number() })).nullable(),
  /** Most recent first. `avatar` is a same-origin URL or null for a monogram. */
  stargazers: z.array(z.object({ login: z.string(), avatar: z.string().nullable() })),
  /** Shown on the Reveal card. */
  stats: z.object({ forks: z.number(), watchers: z.number(), createdAt: z.number() }).nullable(),
  asOf: z.number(),
  theme: themeIdSchema,
  style: styleIdSchema,
})

export type StarsVideoProps = z.infer<typeof starsVideoSchema>
