import Section from '../ui/Section.jsx'
import { faq } from '../../content/programme.js'
import { useAccordion } from './useAccordion.js'

/**
 * h. Questions people actually ask. Still native details and summary, so it
 * opens and closes with no script; useAccordion only adds the animation the
 * element cannot do for itself.
 */
export default function Faq() {
  const ref = useAccordion()
  return (
    <Section id="faq" kicker="Questions people actually ask" title="The ones that decide it." tint>
      <div ref={ref} className="faq rise">
        {faq.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <div className="answer">
              <p>{item.a}</p>
            </div>
          </details>
        ))}
      </div>
    </Section>
  )
}
