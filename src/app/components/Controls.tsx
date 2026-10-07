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
    <div className="flex flex-wrap items-center gap-2">
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
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
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
