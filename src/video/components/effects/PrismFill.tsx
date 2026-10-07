import { PRISM } from '../../tiers'

/** Multicolor foil gradient for SVG fills; it slowly turns with the frame. */
export function PrismFill({ id, frame }: { id: string; frame: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1" gradientTransform={`rotate(${frame * 0.6} 0.5 0.5)`}>
      {PRISM.map((color, i) => (
        <stop key={color} offset={i / (PRISM.length - 1)} stopColor={color} />
      ))}
    </linearGradient>
  )
}
