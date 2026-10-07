import { useState, type CSSProperties } from 'react'
import { Img } from 'remotion'
import type { VideoTheme } from '../theme'

type Props = {
  src: string | null
  name: string
  size: number
  radius: number
  theme: VideoTheme
  fontFamily: string
  style?: CSSProperties
}

export function Avatar({ src, name, size, radius, theme, fontFamily, style }: Props) {
  const [failed, setFailed] = useState(false)
  const box: CSSProperties = { width: size, height: size, borderRadius: radius, flexShrink: 0, ...style }

  if (src && !failed) {
    return (
      <Img
        src={src}
        onError={() => setFailed(true)}
        style={{ ...box, objectFit: 'cover', display: 'block', backgroundColor: theme.monogram[1] }}
      />
    )
  }

  return (
    <div
      style={{
        ...box,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `linear-gradient(135deg, ${theme.monogram[0]}, ${theme.monogram[1]})`,
        color: theme.muted,
        fontFamily,
        fontWeight: 500,
        fontSize: size * 0.42,
        lineHeight: 1,
      }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  )
}
