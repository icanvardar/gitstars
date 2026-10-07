import { useLayoutEffect, useRef } from 'react'
import { AbsoluteFill } from 'remotion'
import { mulberry32 } from '../math'
import type { VideoTheme } from '../theme'
import { useSvgId } from './svgId'

const TILE = 160

function GrainCanvas({ width, height, opacity }: { width: number; height: number; opacity: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const tile = document.createElement('canvas')
    tile.width = TILE
    tile.height = TILE
    const tileCtx = tile.getContext('2d')
    if (!tileCtx) return
    const image = tileCtx.createImageData(TILE, TILE)
    const random = mulberry32(1337)
    for (let i = 0; i < image.data.length; i += 4) {
      const v = random() * 255
      image.data[i] = v
      image.data[i + 1] = v
      image.data[i + 2] = v
      image.data[i + 3] = 255
    }
    tileCtx.putImageData(image, 0, 0)

    const pattern = ctx.createPattern(tile, 'repeat')
    if (!pattern) return
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [width, height])

  return (
    <canvas
      ref={ref}
      width={Math.ceil(width / 2)}
      height={Math.ceil(height / 2)}
      style={{ position: 'absolute', inset: 0, width, height, opacity }}
    />
  )
}

/** Background color, soft ambient light, vignette and film grain. */
export function Backdrop({ theme, width, height }: { theme: VideoTheme; width: number; height: number }) {
  const vignette = useSvgId('vignette')
  const ambient = useSvgId('ambient')

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={ambient} cx="20%" cy="-10%" r="80%">
            <stop offset="0" stopColor={theme.accent} stopOpacity={theme.ambientOpacity} />
            <stop offset="1" stopColor={theme.accent} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={vignette} cx="50%" cy="46%" r="75%">
            <stop offset="0.55" stopColor={theme.vignette} stopOpacity={0} />
            <stop offset="1" stopColor={theme.vignette} stopOpacity={theme.vignetteOpacity} />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill={`url(#${ambient})`} />
        <rect width={width} height={height} fill={`url(#${vignette})`} />
      </svg>
      <GrainCanvas width={width} height={height} opacity={theme.grainOpacity} />
    </AbsoluteFill>
  )
}
