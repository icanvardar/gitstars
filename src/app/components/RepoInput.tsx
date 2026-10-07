import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { parseRepoInput, type RepoRef } from '../../github/client'
import type { LoadState } from '../useRepoVideo'
import { GitHubMark } from './GitHubMark'

type Props = {
  initialValue: string
  state: LoadState
  onSubmit: (ref: RepoRef) => void
}

export function RepoInput({ initialValue, state, onSubmit }: Props) {
  const [value, setValue] = useState(initialValue)
  const [invalid, setInvalid] = useState(false)
  const loading = state.status === 'loading'

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const ref = parseRepoInput(value)
    if (!ref) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    onSubmit(ref)
  }

  const message = invalid
    ? { tone: 'error', text: 'Use owner/repo or a GitHub URL.' }
    : state.status === 'error'
      ? { tone: 'error', text: state.message }
      : state.status === 'loading'
        ? { tone: 'muted', text: `${state.message}...` }
        : null

  return (
    <div className="relative w-full">
      <form
        onSubmit={submit}
        className="group flex h-13 items-center gap-3 rounded-2xl border border-line bg-surface pl-4 pr-2 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-[border-color,box-shadow] duration-300 focus-within:border-[color-mix(in_srgb,var(--ink)_22%,transparent)] focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--ink)_5%,transparent)]"
      >
        <GitHubMark className="size-5 shrink-0 fill-muted" />
        <input
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            if (invalid) setInvalid(false)
          }}
          placeholder="owner/repo"
          aria-label="GitHub repository"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-[14px] font-medium text-canvas transition-[transform,opacity] duration-200 active:scale-[0.97] disabled:opacity-60"
        >
          {loading ? <Spinner /> : null}
          <span className="sm:hidden">Create</span>
          <span className="hidden sm:inline">Create video</span>
        </button>
      </form>
      <div className="absolute inset-x-0 top-full pt-1.5 pl-1">
        <AnimatePresence mode="wait">
          {message ? (
            <motion.p
              key={message.text}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className={`text-[13px] ${message.tone === 'error' ? 'text-[#d9534f]' : 'text-muted'}`}
            >
              {message.text}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function Spinner() {
  return <span className="size-3.5 animate-spin rounded-full border-[1.5px] border-current border-r-transparent" aria-hidden />
}
