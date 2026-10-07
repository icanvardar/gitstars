import { formatInteger } from '../../video/math'

type Props = {
  owner: string
  repo: string
  stars: number
  highlight: boolean
}

export function shareUrl(owner: string, repo: string, stars: number): string {
  const text = `${owner}/${repo} just reached ${formatInteger(stars)} stars on GitHub.`
  const params = new URLSearchParams({ text, url: `https://github.com/${owner}/${repo}` })
  return `https://x.com/intent/post?${params.toString()}`
}

export function ShareButton({ owner, repo, stars, highlight }: Props) {
  return (
    <a
      href={shareUrl(owner, repo, stars)}
      target="_blank"
      rel="noreferrer"
      title="Post on X"
      aria-label="Post on X"
      className={`grid size-11 shrink-0 place-items-center sm:size-9 rounded-full border transition-[background-color,border-color,transform] duration-200 active:scale-[0.97] ${
        highlight ? 'border-accent/50 bg-accent/10 text-ink' : 'border-line bg-surface text-ink hover:border-[color-mix(in_srgb,var(--ink)_18%,transparent)]'
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </a>
  )
}
