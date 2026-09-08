import { useReveal } from '../../hooks/useReveal.js'
import BlockRule from '../ui/BlockRule.jsx'

/** e. Three students. An irregular layout: the big figure beside the text, with the heading inside. */
export default function Cohort() {
  const ref = useReveal()
  return (
    <section ref={ref} id="cohort" className="section" aria-labelledby="cohort-heading">
      <div className="container">
        <div className="cohort">
          <p className="figure rise" aria-hidden="true">
            3
          </p>
          <div>
            <h2 id="cohort-heading" className="rise">
              Three students. The whole team.
            </h2>
            <BlockRule />
            <p className="body rise">
              Batch 1 is three people. Not because it is exclusive, but because a project you actually ship needs
              attention a hall of forty cannot get.
            </p>
            <p className="body rise">
              Three students, with the whole team on them. If you are stuck, someone notices the same day.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
