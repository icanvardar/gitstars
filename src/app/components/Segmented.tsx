import { motion } from 'motion/react'
import { useId, type ReactNode } from 'react'

type Option<T extends string> = { value: T; label: ReactNode; title?: string }

type Props<T extends string> = {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}

export function Segmented<T extends string>({ label, value, options, onChange }: Props<T>) {
  const id = useId()
  return (
    <div role="radiogroup" aria-label={label} className="flex shrink-0 rounded-full border border-line bg-surface p-[3px]">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            title={option.title}
            aria-label={option.title}
            className={`relative flex h-7 items-center rounded-full px-2.5 text-[12.5px] font-medium transition-colors duration-200 ${
              active ? 'text-canvas' : 'text-muted hover:text-ink'
            }`}
          >
            {active ? (
              <motion.span
                layoutId={`${id}-pill`}
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            ) : null}
            <span className="relative flex">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
