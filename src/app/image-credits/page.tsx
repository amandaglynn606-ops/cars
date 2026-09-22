import credits from '../../../public/emirates/sources.json'
import destinationCredits from '../../../public/destinations/sources.json'
import reviewedCredits from '../../../public/verified-places/sources.json'
import { T } from '@/components/RegionalProvider'
import { occasionPages } from '@/lib/occasion-pages'
export const metadata = { title: 'Photo credits', alternates: { canonical: '/image-credits' } }
export default function Page() {
  const illustrations = [
    ...new Map(
      occasionPages
        .filter((page) => page.image.generated)
        .map((page) => [page.image.src, page.image]),
    ).values(),
  ]
  return (
    <div className="container-lux z-section">
      <h1 className="font-display display-md">
        <T>Photo credits</T>
      </h1>
      {[
        ...new Map(
          [...credits, ...destinationCredits, ...reviewedCredits].map((item) => [
            item.original,
            item,
          ]),
        ).values(),
      ].map((item) => (
        <article
          key={item.original}
          style={{ paddingBlock: 28, borderBottom: '1px solid var(--z-line)' }}
        >
          <h2 style={{ fontSize: 22, marginBottom: 12 }}>{item.title}</h2>
          <p>
            {item.author} ·{' '}
            <a className="z-text-link" href={item.licenseUrl} rel="noreferrer">
              {item.license}
            </a>
          </p>
          <p className="z-note" style={{ marginBlock: 12 }}>
            {item.changes}
          </p>
          <a className="z-text-link" href={item.source} rel="noreferrer">
            Original photograph and attribution
          </a>
        </article>
      ))}
      <section style={{ marginTop: 48 }} aria-labelledby="illustration-credits">
        <h2 id="illustration-credits" className="font-display display-md">
          Occasion illustrations
        </h2>
        <p className="z-note" style={{ marginBlock: 20 }}>
          These images were generated with OpenAI image generation for Zavi's occasion-planning
          pages. They are Dubai-inspired illustrations, not photographs of actual venues, customer
          events or vehicles available to rent. The skyline and property arrangements are
          illustrative. No pictured flowers, gifts, equipment or venue service is included in a
          vehicle rate.
        </p>
        {illustrations.map((item) => (
          <article
            key={item.src}
            style={{ paddingBlock: 18, borderBottom: '1px solid var(--z-line)' }}
          >
            <h3 style={{ fontSize: 18 }}>{item.caption}</h3>
            <p className="z-note">
              AI-generated illustration; resized and converted to WebP for this website.
            </p>
          </article>
        ))}
      </section>
    </div>
  )
}
