import { PageIntro } from '../ui/Section.jsx'
import { useReveal } from '../../hooks/useReveal.js'
import { site } from '../../config/site.js'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** '2026-09-08' becomes '8 September 2026'. String arithmetic only, so server and client agree in every time zone. */
function formatDate(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return `${day} ${MONTHS[month - 1]} ${year}`
}

/**
 * The frame shared by the three policies: the intro with its "Last updated"
 * line, then the long-form body. `lede` is the opening paragraph under the
 * rule; everything else is passed as children.
 */
export default function LegalPage({ id, title, lede, children, updated = site.legal.lastUpdated }) {
  const ref = useReveal()
  return (
    <>
      <PageIntro id={id} kicker="Legal" title={title}>
        <p className="legal-meta rise">
          Last updated: <time dateTime={updated}>{formatDate(updated)}</time>
        </p>
      </PageIntro>
      <section ref={ref} className="section page-body">
        <div className="container">
          <div className="prose rise">
            {lede ? <p className="lede">{lede}</p> : null}
            {children}
          </div>
        </div>
      </section>
    </>
  )
}
