import type { WebRendererVideoCodec } from '@remotion/web-renderer'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { compositionFor } from '../../video/composition'
import { FORMATS, type FormatId } from '../../video/formats'
import type { StarsVideoProps } from '../../video/schema'

type ExportState =
  | { kind: 'checking' }
  | { kind: 'unsupported'; reason: string }
  | { kind: 'idle'; codec: WebRendererVideoCodec | null }
  | { kind: 'rendering'; progress: number }
  | { kind: 'done'; url: string; filename: string }
  | { kind: 'error'; message: string }

type Props = {
  props: StarsVideoProps
  format: FormatId
  onExported?: () => void
}

const loadRenderer = () => import('@remotion/web-renderer')

/** Remotion's Free License covers individuals and companies of up to 3 people. */
const REMOTION_LICENSE_KEY = import.meta.env.VITE_REMOTION_LICENSE_KEY ?? 'free-license'

function download(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
}

export function ExportButton({ props, format, onExported }: Props) {
  const [state, setState] = useState<ExportState>({ kind: 'checking' })
  const codec = useRef<WebRendererVideoCodec | null>(null)
  const abort = useRef<AbortController | null>(null)
  const objectUrl = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    abort.current?.abort()
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = null
    setState({ kind: 'checking' })

    const { width, height } = FORMATS[format]
    loadRenderer()
      .then(({ canRenderMediaOnWeb }) => canRenderMediaOnWeb({ width, height, container: 'mp4', muted: true }))
      .then((result) => {
        if (cancelled) return
        if (!result.canRender) {
          const issue = result.issues.find((i) => i.severity === 'error')
          setState({ kind: 'unsupported', reason: issue?.message ?? 'This browser cannot encode video.' })
          return
        }
        codec.current = result.resolvedVideoCodec
        setState({ kind: 'idle', codec: result.resolvedVideoCodec })
      })
      .catch(() => !cancelled && setState({ kind: 'unsupported', reason: 'This browser cannot encode video.' }))

    return () => {
      cancelled = true
    }
  }, [props, format])

  const start = async () => {
    const controller = new AbortController()
    abort.current = controller
    setState({ kind: 'rendering', progress: 0 })
    try {
      const { renderMediaOnWeb } = await loadRenderer()
      const { getBlob } = await renderMediaOnWeb({
        composition: { ...compositionFor(format, props.style), defaultProps: props },
        inputProps: props,
        container: 'mp4',
        videoCodec: codec.current,
        videoBitrate: 'very-high',
        muted: true,
        licenseKey: REMOTION_LICENSE_KEY,
        signal: controller.signal,
        onProgress: ({ progress }) => {
          if (!controller.signal.aborted) setState({ kind: 'rendering', progress })
        },
      })
      const blob = await getBlob()
      if (controller.signal.aborted) return
      const url = URL.createObjectURL(blob)
      objectUrl.current = url
      const filename = `${props.repo}-stars-${FORMATS[format].label.replace(':', 'x')}.mp4`
      download(url, filename)
      setState({ kind: 'done', url, filename })
      onExported?.()
    } catch (error) {
      if (controller.signal.aborted) {
        setState({ kind: 'idle', codec: codec.current })
        return
      }
      console.error(error)
      setState({ kind: 'error', message: 'Rendering failed. Please try again.' })
    }
  }

  const onClick = () => {
    if (state.kind === 'rendering') abort.current?.abort()
    else if (state.kind === 'done') download(state.url, state.filename)
    else if (state.kind === 'idle' || state.kind === 'error') void start()
  }

  const disabled = state.kind === 'checking' || state.kind === 'unsupported'
  const label =
    state.kind === 'rendering'
      ? `${Math.round(state.progress * 100)}%`
      : state.kind === 'done'
        ? 'Download'
        : state.kind === 'error'
          ? 'Try again'
          : 'Export'

  return (
    <div className="relative flex flex-1 flex-col sm:flex-none sm:items-end">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={state.kind === 'unsupported' ? state.reason : state.kind === 'rendering' ? 'Cancel' : label}
        aria-label={label}
        className="group relative flex h-11 w-full min-w-[104px] shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-ink px-4 text-[14px] sm:h-9 sm:w-auto sm:text-[13px] sm:@max-[456px]:w-9 sm:@max-[456px]:min-w-0 sm:@max-[456px]:px-0 font-medium text-canvas transition-[transform,opacity] duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {state.kind === 'rendering' ? (
          <motion.span
            className="absolute inset-y-0 left-0 bg-accent/25"
            initial={false}
            animate={{ width: `${state.progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 24 }}
          />
        ) : null}
        <span className="relative flex items-center gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={state.kind === 'rendering' ? 'ring' : state.kind}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              {state.kind === 'rendering' ? (
                <ProgressRing progress={state.progress} />
              ) : state.kind === 'done' ? (
                <CheckIcon />
              ) : (
                <DownloadIcon />
              )}
            </motion.span>
          </AnimatePresence>
          <span className="tabular-nums sm:@max-[456px]:hidden">{label}</span>
        </span>
      </button>
      {state.kind === 'unsupported' ? (
        <p className="mt-1.5 text-center text-[12px] text-muted sm:absolute sm:top-full sm:right-0 sm:w-[260px] sm:text-right">
          Exporting needs Chrome 94+, Firefox 130+ or Safari 26+.
        </p>
      ) : null}
    </div>
  )
}

function ProgressRing({ progress }: { progress: number }) {
  const r = 6.5
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 16 16" className="size-4 -rotate-90" aria-hidden>
      <circle cx="8" cy="8" r={r} fill="none" stroke="currentColor" strokeOpacity={0.25} strokeWidth={1.75} />
      <circle
        cx="8"
        cy="8"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - progress)}
        style={{ transition: 'stroke-dashoffset 200ms ease-out' }}
      />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <path d="M8 2.5v8m0 0 3-3m-3 3-3-3M3 13.5h10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
