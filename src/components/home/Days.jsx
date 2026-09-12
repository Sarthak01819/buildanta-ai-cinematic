import Section from '../ui/Section.jsx'
import { curriculum, dailyRhythm, phases } from '../../content/programme.js'
import { useAccordion } from './useAccordion.js'

function DayRows({ sessions }) {
  return (
    <dl className="curriculum-rows">
      {sessions.map((session) => (
        <div className="curriculum-row" key={session.days}>
          <dt>{session.days}</dt>
          <dd><strong>{session.title}</strong><p>{session.text}</p></dd>
        </div>
      ))}
    </dl>
  )
}

/** c. The twenty-eight days. A rail of four phases. */
export default function Days() {
  const planRef = useAccordion()
  return (
    <Section id="days" kicker="The shape of it" title="The twenty-eight days">
      <p className="lede days-lede rise">Fourteen days we decide. Fourteen days you decide.</p>
      <p className="body rise">First, learn in the classroom in Kanpur with three guided builds. Then choose your own idea and finish it remotely, with our support.</p>
      <div className="rail">
        {phases.map((p) => (
          <div key={p.name} className="phase rise">
            <p className="days">{p.days}</p>
            <h3>{p.name}</h3>
            <p>{p.text}</p>
            <p className="phase-format">{p.format}</p>
          </div>
        ))}
      </div>
      <div ref={planRef} className="curriculum rise">
        <details>
          <summary>See the full 28-day plan</summary>
          <div className="answer">
            <div className="curriculum-content">
              <p className="body">Everyone builds the same three guided projects. Each is a full cycle: build, break, fix, ship and explain. In the final fourteen days, the idea is yours.</p>
              {curriculum.map((group) => (
                <section className="curriculum-group" key={group.id} aria-labelledby={`plan-${group.id}`}>
                  <p className="curriculum-days">{group.days}</p>
                  <h3 id={`plan-${group.id}`}>{group.title}</h3>
                  <p className="body">{group.intro}</p>
                  <DayRows sessions={group.sessions} />
                </section>
              ))}
              <section className="curriculum-group" aria-labelledby="plan-rhythm">
                <h3 id="plan-rhythm">What a classroom day looks like</h3>
                <DayRows sessions={dailyRhythm} />
              </section>
            </div>
          </div>
        </details>
      </div>
    </Section>
  )
}
