import Section from '../ui/Section.jsx'
import { LinkButton } from '../ui/Button.jsx'

const SLOTS = ['Live URL', 'Public repository', 'Demo video']

/** g. Proof, honestly. Kept deliberately empty until Batch 1 finishes; the full page is /proof. */
export default function ProofPreview() {
  return (
    <Section id="proof" kicker="Proof" title="We do not have graduates yet, and we are not going to pretend otherwise.">
      <p className="body rise">
        Batch 1 has not started. That means no testimonials on this page, no placement percentages and no success
        stories.
      </p>
      <p className="body rise">
        When students finish, their work goes here: live URLs you can click, repos you can read, videos you can watch.
        Until then, judge the method. It is written out above.
      </p>
      <div className="empty rise">
        <p className="label">Reserved for Batch 1</p>
        <div className="slots">
          {SLOTS.map((s) => (
            <div key={s} className="slot">
              {s}
            </div>
          ))}
        </div>
      </div>
      <div className="btn-row rise" style={{ marginTop: '2rem' }}>
        <LinkButton to="/proof" variant="ghost">
          See the student work page
        </LinkButton>
      </div>
    </Section>
  )
}
