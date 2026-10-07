import { loadFont } from '@remotion/fonts'
import { useEffect, useRef, useState } from 'react'
import { cancelRender, continueRender, delayRender, staticFile } from 'remotion'

export const SANS = 'GitStars Geist'
export const MONO = 'GitStars Geist Mono'

let fontsReady: Promise<void> | null = null

export function ensureFonts(): Promise<void> {
  fontsReady ??= Promise.all([
    loadFont({ family: SANS, url: staticFile('fonts/Geist-Variable.woff2'), weight: '100 900', format: 'woff2' }),
    loadFont({ family: MONO, url: staticFile('fonts/GeistMono-Variable.woff2'), weight: '100 900', format: 'woff2' }),
  ]).then(() => undefined)
  return fontsReady
}

/** Holds the render until both typefaces are ready so no frame uses a fallback font. */
export function useVideoFonts() {
  const [handle] = useState(() => delayRender('Loading Geist'))
  const continued = useRef(false)
  useEffect(() => {
    ensureFonts()
      .then(() => {
        if (continued.current) return
        continued.current = true
        continueRender(handle)
      })
      .catch((error: unknown) => cancelRender(error))
  }, [handle])
}
