import Section from '../ui/Section.jsx'
import { ApplyButton } from '../ui/Button.jsx'
import WhatsAppButton from '../ui/WhatsAppButton.jsx'

/** i. Apply. The form now lives on /apply (spec 4.1, change 2); this section hands over to it. */
export default function Closer() {
  return (
    <Section id="apply" kicker="Apply" title="Tell us where you are starting from.">
      <div className="closer">
        <div className="rise">
          <p className="body">Four questions. It takes a minute, and a real person reads every one.</p>
          <div className="btn-row">
            <ApplyButton />
            <WhatsAppButton />
          </div>
        </div>
        <aside className="aside-card rise" aria-labelledby="aside-h">
          <h3 id="aside-h">Batch 1 is forming</h3>
          <p>The first two weeks run offline in Kanpur, then two weeks of remote follow-through.</p>
          <p>Three seats, and the whole team on them.</p>
          <span className="figure" aria-hidden="true">
            28
          </span>
          <p className="hold-note" style={{ marginTop: '.4rem' }}>
            days, start to finish
          </p>
        </aside>
      </div>
      <div className="plate rise">
        <img
          src="/assets/hero-ending.jpg"
          alt="A rendered workstation: a wooden desk against a stone wall, a lamp, a plant, and a monitor showing the BUILDANTA logo."
          width="1536"
          height="864"
          loading="lazy"
          decoding="async"
        />
      </div>
    </Section>
  )
}
