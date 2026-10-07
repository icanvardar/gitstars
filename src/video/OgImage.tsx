import { AbsoluteFill } from 'remotion'
import { useSvgId } from './components/svgId'
import { STAR } from './components/StarMark'
import { SANS, useVideoFonts } from './fonts'
import { THEMES } from './theme'

export const OG_SIZE = { width: 1200, height: 630 }

const HALO_STOPS = [
  [0, 0.34],
  [0.25, 0.18],
  [0.5, 0.06],
  [0.75, 0.015],
  [1, 0],
] as const

/** Social preview: the wordmark, one line of what it does, and the star. */
export function OgImage() {
  useVideoFonts()
  const theme = THEMES.light
  const halo = useSvgId('og-halo')

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background, fontFamily: SANS, color: theme.text }}>
      <div style={{ position: 'absolute', left: 88, top: 80, display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width={44} height={44} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="7" fill={theme.text} />
          <path d="M12 5.4l1.93 3.96 4.36.62-3.15 3.06.75 4.34L12 15.33l-3.89 2.05.75-4.34L5.71 9.98l4.36-.62z" fill={theme.accent} />
        </svg>
        <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em' }}>gitstars</span>
      </div>

      <div style={{ position: 'absolute', left: 88, bottom: 92, width: 640 }}>
        <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.02, letterSpacing: '-0.045em' }}>
          Turn your GitHub stars into a video.
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            letterSpacing: '-0.01em',
            color: theme.muted,
          }}
        >
          Paste a repo, get a video for X.
        </div>
      </div>

      <svg width={520} height={520} style={{ position: 'absolute', right: -10, top: 55 }}>
        <defs>
          <radialGradient id={halo}>
            {HALO_STOPS.map(([offset, opacity]) => (
              <stop key={offset} offset={offset} stopColor={theme.accent} stopOpacity={opacity} />
            ))}
          </radialGradient>
        </defs>
        <circle cx={260} cy={260} r={260} fill={`url(#${halo})`} />
        <g transform="translate(130 125) scale(10.8)">
          <path d={STAR} fill={theme.accent} stroke={theme.accent} strokeWidth={1.4} strokeLinejoin="round" />
        </g>
      </svg>
    </AbsoluteFill>
  )
}
