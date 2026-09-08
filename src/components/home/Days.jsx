import Section from '../ui/Section.jsx'
import { phases } from '../../content/programme.js'

/** c. The twenty-eight days. A rail of four phases. */
export default function Days() {
  return (
    <Section id="days" kicker="The shape of it" title="The twenty-eight days">
      <div className="rail">
        {phases.map((p) => (
          <div key={p.name} className="phase rise">
            <p className="days">{p.days}</p>
            <h3>{p.name}</h3>
            <p>{p.text}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
