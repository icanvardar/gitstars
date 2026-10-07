import { spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { SANS } from '../fonts'
import type { Layout } from '../layout'
import type { StarsVideoProps } from '../schema'
import type { VideoTheme } from '../theme'
import { GROWTH } from '../timing'
import { Avatar } from './Avatar'

type Props = {
  stargazers: StarsVideoProps['stargazers']
  layout: Layout
  theme: VideoTheme
}

/** All avatars land within this many frames, however many there are. */
const ARRIVAL_WINDOW = 110

/** Overlapping stack of the most recent stargazers; the newest lands last, on the right. */
export function Stargazers({ stargazers, layout, theme }: Props) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { stack, u } = layout
  const people = stargazers.slice(0, stack.count).reverse()
  if (!people.length) return null
  const stagger = Math.min(GROWTH.stargazerStagger, ARRIVAL_WINDOW / people.length)

  return (
    <div style={{ position: 'absolute', top: stack.top, right: stack.right, display: 'flex' }}>
      {people.map((person, i) => {
        const s = spring({
          frame: frame - (GROWTH.stargazers + i * stagger),
          fps,
          config: { damping: 14, stiffness: 170, mass: 0.6 },
        })
        return (
          <div
            key={person.login}
            style={{
              marginLeft: i === 0 ? 0 : -stack.overlap,
              borderRadius: '50%',
              border: `${stack.ring}px solid ${theme.background}`,
              backgroundColor: theme.background,
              opacity: Math.min(1, s * 1.6),
              transform: `translateY(${(1 - s) * 10 * u}px) scale(${0.6 + 0.4 * s})`,
            }}
          >
            <Avatar
              src={person.avatar}
              name={person.login}
              size={stack.size - stack.ring * 2}
              radius={(stack.size - stack.ring * 2) / 2}
              theme={theme}
              fontFamily={SANS}
            />
          </div>
        )
      })}
    </div>
  )
}
