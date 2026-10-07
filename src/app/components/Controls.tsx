import { FORMAT_IDS, FORMATS, type FormatId } from '../../video/formats'
import type { StyleId, ThemeId } from '../../video/schema'
import { Segmented } from './Segmented'

type Props = {
  style: StyleId
  theme: ThemeId
  format: FormatId
  onStyleChange: (style: StyleId) => void
  onThemeChange: (theme: ThemeId) => void
  onFormatChange: (format: FormatId) => void
}

export function Controls({ style, theme, format, onStyleChange, onThemeChange, onFormatChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-1 sm:justify-start">
      <Segmented
        label="Video style"
        value={style}
        onChange={onStyleChange}
        options={[
          { value: 'minimal', label: 'Minimal' },
          { value: 'reveal', label: 'Reveal' },
        ]}
      />
      <Segmented
        label="Video theme"
        value={theme}
        onChange={onThemeChange}
        options={[
          { value: 'dark', label: <MoonIcon />, title: 'Dark video' },
          { value: 'light', label: <SunIcon />, title: 'Light video' },
        ]}
      />
      <Segmented
        label="Video format"
        value={format}
        onChange={onFormatChange}
        options={FORMAT_IDS.map((id) => ({ value: id, label: FORMATS[id].label }))}
      />
    </div>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1Z" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <circle cx="8" cy="8" r="2.8" />
      <path
        d="M8 1.5v1.3M8 13.2v1.3M1.5 8h1.3M13.2 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9"
        strokeLinecap="round"
      />
    </svg>
  )
}
