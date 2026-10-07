import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { parseRepoInput } from '../github/client'
import { sampleProps } from '../video/fixtures'
import { FORMATS, type FormatId } from '../video/formats'
import type { StarsVideoProps, StyleId, ThemeId } from '../video/schema'
import { Controls } from './components/Controls'
import { ExportButton } from './components/ExportButton'
import { GitHubMark } from './components/GitHubMark'
import { Logo } from './components/Logo'
import { Preview } from './components/Preview'
import { RepoInput } from './components/RepoInput'
import { ShareButton } from './components/ShareButton'
import { readUrlState, writeUrlState } from './urlState'
import { useRepoVideo } from './useRepoVideo'

const SOURCE_URL = 'https://github.com/icanvardar/gitstars'
const AUTHOR_URL = 'https://x.com/icanvardar'

/** Widest the column gets per format. */
const MAX_WIDTH: Record<FormatId, number> = { landscape: 1280, square: 760, portrait: 640 }
/** Narrowest it gets on wider screens, so the controls stay on one row. Phones use the full width. */
const MIN_WIDTH = 388
/** Vertical space taken by everything except the video, so the page fits one screen. */
const CHROME_HEIGHT = 332

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 10, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
})

export function App() {
  const initial = useMemo(readUrlState, [])
  const [theme, setTheme] = useState<ThemeId>(initial.theme)
  const [format, setFormat] = useState<FormatId>(initial.format)
  const [style, setStyle] = useState<StyleId>(initial.style)
  const [exported, setExported] = useState(false)
  const { state, content, load } = useRepoVideo()

  useEffect(() => {
    const ref = initial.repo ? parseRepoInput(initial.repo) : null
    if (ref) void load(ref)
  }, [initial, load])

  const repoParam = content ? `${content.owner}/${content.repo}` : initial.repo
  useEffect(() => {
    writeUrlState({ repo: repoParam, theme, format, style })
  }, [repoParam, theme, format, style])

  const videoProps = useMemo<StarsVideoProps>(
    () => ({ ...(content ?? sampleProps), theme, style }),
    [content, theme, style],
  )
  useEffect(() => setExported(false), [videoProps, format])

  const busy = state.status === 'loading' ? state.message : null
  const { width, height } = FORMATS[format]
  // The video's frame adds 12px around it (p-1.5 on each side).
  const fit = `calc((100dvh - ${CHROME_HEIGHT}px) * ${width / height} + 12px)`
  const columnWidth = `min(calc(100vw - 32px), max(${MIN_WIDTH}px, min(${MAX_WIDTH[format]}px, ${fit})))`

  return (
    <div className="flex min-h-dvh flex-col items-center px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div
        className="flex min-h-dvh w-full flex-col transition-[max-width] duration-500 ease-out-expo"
        style={{ maxWidth: columnWidth }}
      >
        <header className="flex h-13 shrink-0 items-center justify-between pt-2 sm:h-14 sm:pt-3">
          <a href="/" aria-label="GitStars home">
            <Logo />
          </a>
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex h-8 items-center gap-2 rounded-full border border-line px-3 text-[13px] font-medium text-muted transition-colors hover:text-ink"
          >
            <GitHubMark className="size-[15px] fill-current" />
            View source
          </a>
        </header>

        <main className="flex flex-1 flex-col justify-center py-2 sm:py-4">
          <motion.h1
            {...rise(0)}
            className="text-center text-[24px] leading-tight font-semibold tracking-[-0.03em] text-balance sm:text-[30px]"
          >
            Turn your stars into a video
          </motion.h1>

          <motion.div {...rise(0.06)} className="mt-3.5 sm:mt-4">
            <RepoInput initialValue={initial.repo ?? ''} state={state} onSubmit={(ref) => void load(ref)} />
          </motion.div>

          <motion.section {...rise(0.12)} className="@container mt-5 sm:mt-6">
            <Preview props={videoProps} format={format} busy={busy} />
            <div className="mt-3 flex flex-col gap-2.5 sm:mt-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-1.5">
              <Controls
                style={style}
                theme={theme}
                format={format}
                onStyleChange={setStyle}
                onThemeChange={setTheme}
                onFormatChange={setFormat}
              />
              <div className="flex items-center gap-2">
                {content ? (
                  <ShareButton owner={content.owner} repo={content.repo} stars={content.stars} highlight={exported} />
                ) : null}
                <ExportButton props={videoProps} format={format} onExported={() => setExported(true)} />
              </div>
            </div>
          </motion.section>
        </main>

        <footer className="flex h-10 shrink-0 sm:h-11 items-center justify-between text-[12px] text-muted">
          <span>© {new Date().getFullYear()} GitStars</span>
          <a href={AUTHOR_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">
            Built by @icanvardar
          </a>
        </footer>
      </div>
    </div>
  )
}
