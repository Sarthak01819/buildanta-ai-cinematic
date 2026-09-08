import Section from '../ui/Section.jsx'
import { faq } from '../../content/programme.js'

/** h. Questions people actually ask. Native details and summary, no script. */
export default function Faq() {
  return (
    <Section id="faq" kicker="Questions people actually ask" title="The ones that decide it." tint>
      <div className="faq rise">
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
