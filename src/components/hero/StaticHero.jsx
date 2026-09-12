import { ApplyButton } from '../ui/Button.jsx'
import WhatsAppButton from '../ui/WhatsAppButton.jsx'
import { POSTER_URL } from './useScrubHero.js'

/**
 * The composed static hero for phones, portrait tablets and reduced motion.
 * A designed layout, not a fallback. It always paints its own image, set
 * inline so the pre-rendered HTML carries it without waiting for JS.
 */
export default function StaticHero() {
  return (
    <section className="static-hero" data-hero aria-labelledby="sh-heading">
      <div className="sh-media" id="sh-media" aria-hidden="true" style={{ backgroundImage: `url('${POSTER_URL}')` }} />
      <div className="sh-scrim" aria-hidden="true" />
      <div className="container">
        <h1 id="sh-heading">We tried to hire people who knew these tools. In all of Kanpur, we found nobody.</h1>
        <p className="lede">
          So we built the room where they get made. Twenty-eight days. Three guided projects, then your own idea, shipped.
        </p>
        <div className="btn-row">
          <ApplyButton />
          <WhatsAppButton />
        </div>
      </div>
    </section>
  )
}
