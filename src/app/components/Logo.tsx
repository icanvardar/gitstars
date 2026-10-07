/** A star set in a rounded tile, next to a lowercase wordmark. */
export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <rect width="24" height="24" rx="7" className="fill-ink" />
        <path
          d="M12 5.4l1.93 3.96 4.36.62-3.15 3.06.75 4.34L12 15.33l-3.89 2.05.75-4.34L5.71 9.98l4.36-.62z"
          className="fill-accent"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[15px] font-semibold tracking-[-0.03em]">gitstars</span>
    </span>
  )
}
