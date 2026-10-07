import { Avatar } from '../components/Avatar'
import { PrismFill } from '../components/effects/PrismFill'
import { STAR } from '../components/StarMark'
import { useSvgId } from '../components/svgId'
import { MONO, SANS } from '../fonts'
import type { CSSProperties } from 'react'
import { formatAge, formatCompactFloor, formatInteger } from '../math'
import type { StarsVideoProps } from '../schema'
import type { VideoTheme } from '../theme'
import type { Tier } from '../tiers'

/** Card width as a fraction of its height. */
export const CARD_ASPECT = 0.7

/** A shield silhouette in a W x H box: notched top corners, pointed base. */
function shieldPath(w: number, h: number): string {
  return [
    `M 0 ${h * 0.09}`,
    `Q ${w * 0.13} ${h * 0.09} ${w * 0.17} 0`,
    `L ${w * 0.83} 0`,
    `Q ${w * 0.87} ${h * 0.09} ${w} ${h * 0.09}`,
    `L ${w} ${h * 0.8}`,
    `C ${w} ${h * 0.9} ${w * 0.64} ${h * 0.92} ${w * 0.5} ${h}`,
    `C ${w * 0.36} ${h * 0.92} 0 ${h * 0.9} 0 ${h * 0.8}`,
    'Z',
  ].join(' ')
}

type Props = {
  props: StarsVideoProps
  tier: Tier
  theme: VideoTheme
  width: number
  height: number
  /** 0..1 progress of the diagonal shine across the face. */
  shine: number
  /** Show the plain back of the card (mid-spin). */
  back: boolean
  /** 0..1 darkening while the card is turned away from the light. */
  shade: number
  frame: number
}

export function Card({ props, tier, theme, width: w, height: h, shine, back, shade, frame }: Props) {
  const materialId = useSvgId('card-material')
  const clipId = useSvgId('card-clip')
  const shineId = useSvgId('card-shine')
  const foilId = useSvgId('card-foil')
  const depthId = useSvgId('card-depth')
  const { palette } = tier
  const legendary = tier.id === 'legendary'
  const shape = shieldPath(w, h)
  const inset = 0.035
  const inner = `translate(${w * inset} ${h * inset}) scale(${1 - inset * 2})`
  const ink = palette.ink

  const name = props.repo
  const nameSize = Math.min(w * 0.1, (w * 0.78) / Math.max(1, name.length * 0.6))
  const avatarSize = w * 0.44
  const caption: CSSProperties = {
    position: 'absolute',
    fontFamily: MONO,
    fontWeight: 500,
    fontSize: w * 0.032,
    lineHeight: 1,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    color: ink,
  }
  const stats = props.stats
    ? [
        { label: 'Forks', value: formatCompactFloor(props.stats.forks) },
        { label: 'Watchers', value: formatCompactFloor(props.stats.watchers) },
        formatAge(props.asOf - props.stats.createdAt),
      ]
    : null

  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <linearGradient id={materialId} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset={0} stopColor={palette.material[0]} />
            <stop offset={0.5} stopColor={palette.material[1]} />
            <stop offset={1} stopColor={palette.material[2]} />
          </linearGradient>
          <clipPath id={clipId}>
            <path d={shape} />
          </clipPath>
          <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="0">
            <stop offset={0} stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset={0.5} stopColor="#FFFFFF" stopOpacity={0.55} />
            <stop offset={1} stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
          {/* Soft top light and a darker base give the flat material some depth. */}
          <linearGradient id={depthId} x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor="#FFFFFF" stopOpacity={legendary ? 0.08 : 0.2} />
            <stop offset={0.4} stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset={0.65} stopColor="#000000" stopOpacity={0} />
            <stop offset={1} stopColor="#000000" stopOpacity={0.14} />
          </linearGradient>
          {legendary && <PrismFill id={foilId} frame={frame} />}
        </defs>
        <path d={shape} fill={`url(#${materialId})`} />
        <g clipPath={`url(#${clipId})`}>
          <rect x={0} y={0} width={w} height={h} fill={`url(#${depthId})`} />
          {shine > 0 && shine < 1 && (
            <rect
              x={-w * 0.6 + shine * w * 2.2}
              y={-h * 0.2}
              width={w * 0.32}
              height={h * 1.4}
              fill={`url(#${shineId})`}
              transform={`rotate(18 ${-w * 0.44 + shine * w * 2.2} ${h / 2})`}
            />
          )}
        </g>
        <path
          d={shape}
          transform={inner}
          fill="none"
          stroke={legendary ? `url(#${foilId})` : palette.edge}
          strokeWidth={(legendary ? 4 : 2.5) / (1 - inset * 2)}
        />
        {back && (
          <g transform={`translate(${w * 0.25} ${h * 0.5 - w * 0.25}) scale(${(w * 0.5) / 24})`}>
            <path d={STAR} fill={legendary ? `url(#${foilId})` : ink} opacity={legendary ? 0.9 : 0.22} />
          </g>
        )}
        {!back && (
          <>
            <g transform={`translate(${w * 0.115} ${h * 0.255}) scale(${(w * 0.1) / 24})`}>
              <path d={STAR} fill={legendary ? `url(#${foilId})` : ink} />
            </g>
            <line x1={w * 0.16} x2={w * 0.84} y1={h * 0.615} y2={h * 0.615} stroke={ink} strokeOpacity={0.22} strokeWidth={2} />
            {stats &&
              [1, 2].map((i) => (
                <line
                  key={i}
                  x1={w * (0.27 + (i - 0.5) * 0.23)}
                  x2={w * (0.27 + (i - 0.5) * 0.23)}
                  y1={h * 0.645}
                  y2={h * 0.735}
                  stroke={ink}
                  strokeOpacity={0.18}
                  strokeWidth={2}
                />
              ))}
            <line x1={w * 0.38} x2={w * 0.62} y1={h * 0.775} y2={h * 0.775} stroke={ink} strokeOpacity={0.22} strokeWidth={2} />
          </>
        )}
      </svg>
      {!back && (
        <>
          <div
            style={{
              position: 'absolute',
              left: w * 0.11,
              top: h * 0.115,
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: w * 0.135,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: ink,
            }}
          >
            {formatCompactFloor(props.stars)}
          </div>
          <div style={{ ...caption, left: w * 0.115, top: h * 0.355, letterSpacing: '0.16em' }}>{tier.name}</div>
          <div
            style={{
              position: 'absolute',
              left: w * 0.5,
              top: h * 0.11,
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize,
              padding: w * 0.012,
              boxSizing: 'border-box',
              backgroundColor: palette.edge,
            }}
          >
            <Avatar
              src={props.ownerAvatar}
              name={props.owner}
              size={avatarSize - w * 0.024}
              radius={avatarSize}
              theme={theme}
              fontFamily={SANS}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: w,
              top: h * 0.47,
              textAlign: 'center',
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: nameSize,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              color: ink,
            }}
          >
            {name}
          </div>
          <div style={{ ...caption, left: 0, width: w, top: h * 0.47 + nameSize * 1.1 + h * 0.018, textAlign: 'center', opacity: 0.6 }}>
            @{props.owner}
          </div>
          {stats?.map((stat, i) => (
            <div key={stat.label} style={{ position: 'absolute', left: w * (0.155 + i * 0.23), width: w * 0.23, top: h * 0.645, textAlign: 'center', color: ink }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: w * 0.07, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {stat.value}
              </div>
              <div style={{ ...caption, position: 'static', marginTop: w * 0.022, opacity: 0.7 }}>{stat.label}</div>
            </div>
          ))}
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: w,
              top: h * 0.8,
              textAlign: 'center',
              fontFamily: MONO,
              fontWeight: 500,
              fontSize: w * 0.045,
              lineHeight: 1,
              letterSpacing: '0.2em',
              color: ink,
              opacity: 0.8,
            }}
          >
            {formatInteger(props.stars)} STARS
          </div>
        </>
      )}
      {shade > 0.01 && (
        <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
          <path d={shape} fill="#000000" opacity={shade} />
        </svg>
      )}
    </div>
  )
}
