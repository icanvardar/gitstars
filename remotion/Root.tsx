import { Composition, Folder } from 'remotion'
import { compositionFor } from '../src/video/composition'
import { sampleHistoryProps, sampleProps, TIER_SAMPLE_STARS, tierSampleProps } from '../src/video/fixtures'
import { FORMAT_IDS } from '../src/video/formats'
import { starsVideoSchema, type StarsVideoProps, type StyleId } from '../src/video/schema'

const STYLES: { style: StyleId; name: string }[] = [
  { style: 'minimal', name: 'Minimal' },
  { style: 'reveal', name: 'Reveal' },
]

const variants = [
  { name: 'Milestone', props: sampleProps },
  { name: 'History', props: sampleHistoryProps },
]

function Comp({ id, style, format, props }: { id: string; style: StyleId; format: (typeof FORMAT_IDS)[number]; props: StarsVideoProps }) {
  const { id: _, ...composition } = compositionFor(format, style)
  return <Composition id={id} {...composition} schema={starsVideoSchema} defaultProps={{ ...props, style }} />
}

export function Root() {
  return (
    <>
      {STYLES.map(({ style, name }) => (
        <Folder key={style} name={name}>
          {variants.map((variant) =>
            FORMAT_IDS.map((format) => (
              <Comp key={`${variant.name}-${format}`} id={`${name}-${variant.name}-${format}`} style={style} format={format} props={variant.props} />
            )),
          )}
          <Folder name={`${name}-Tiers`}>
            {TIER_SAMPLE_STARS.map((stars) => (
              <Comp key={stars} id={`${name}-Tier-${stars}`} style={style} format="square" props={tierSampleProps(stars)} />
            ))}
          </Folder>
        </Folder>
      ))}
    </>
  )
}
