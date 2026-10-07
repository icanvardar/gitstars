import { motion } from 'motion/react'
import { useId } from 'react'

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}

export function Segmented<T extends string>({ label, value, options, onChange }: Props<T>) {
  const id = useId()
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full border border-line bg-surface p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`relative h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-200 ${
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
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
