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
          <p>Fourteen days in the classroom in Kanpur, then fourteen days building your own idea remotely.</p>
          <p>A written scope, live check-ins on days 21 and 28, and help between them.</p>
          <p>Three seats, and the whole team on them.</p>
          <span className="figure" aria-hidden="true">
            28
          </span>
          <p className="hold-note" style={{ marginTop: '.4rem' }}>
            days, start to finish
          </p>
        </aside>
      </div>
      <div
        className="plate certificate-preview rise"
        role="img"
        aria-label="Sample BUILDANTA AI INSTITUTE certificate of completion for the AI CareerNext programme, with placeholders for the student name, certificate number and issue date."
        draggable={false}
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
      />
    </Section>
  )
}
