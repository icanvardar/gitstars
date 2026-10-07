import { spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Avatar } from '../components/Avatar'
import { SANS } from '../fonts'
import type { Layout } from '../layout'
import type { StarsVideoProps } from '../schema'
import type { VideoTheme } from '../theme'
import { INTRO } from '../timing'

/** Average Geist advance per character, used to keep long names on one line. */
const CHAR_EM = 0.56

type Props = {
  props: StarsVideoProps
  layout: Layout
  theme: VideoTheme
}

export function Intro({ props, layout, theme }: Props) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { header, u } = layout

  const rise = (start: number) => spring({ frame: frame - start, fps, config: { damping: 200 }, durationInFrames: 40 })
  const avatarIn = rise(INTRO.avatar)
  const nameIn = rise(INTRO.name)

  const text = `${props.owner} / ${props.repo}`
  const fontSize = Math.min(header.fontSize, header.maxTextWidth / (text.length * CHAR_EM))

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: header.left,
          top: header.top,
          height: header.avatar,
          display: 'flex',
          alignItems: 'center',
          gap: header.gap,
        }}
      >
        <div style={{ opacity: avatarIn, transform: `translateY(${(1 - avatarIn) * 18 * u}px)` }}>
          <Avatar
            src={props.ownerAvatar}
            name={props.owner}
            size={header.avatar}
            radius={props.ownerIsOrg ? 14 * u : header.avatar / 2}
            theme={theme}
            fontFamily={SANS}
            style={{ border: `${Math.max(1, u)}px solid ${theme.faint}` }}
          />
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            opacity: nameIn,
            transform: `translateY(${(1 - nameIn) * 14 * u}px)`,
          }}
        >
          <span style={{ color: theme.muted, fontWeight: 450 }}>{props.owner}</span>
          <span style={{ color: theme.muted, opacity: 0.5, fontWeight: 300 }}> / </span>
          <span style={{ color: theme.text, fontWeight: 600 }}>{props.repo}</span>
        </div>
      </div>
    </>
  )
}
