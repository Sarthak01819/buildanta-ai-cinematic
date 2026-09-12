import { PageIntro } from '../components/ui/Section.jsx'
import { LinkButton } from '../components/ui/Button.jsx'
import WhatsAppButton from '../components/ui/WhatsAppButton.jsx'
import Pending from '../components/ui/Pending.jsx'
import { useReveal } from '../hooks/useReveal.js'
import { site } from '../config/site.js'
import { cityLine, formatPhone, formatRupees, telHref } from '../lib/contact.js'

/** Spec 4.3. The person paying has different questions. */
export default function ForParents() {
  const ref = useReveal()
  const total = formatRupees(site.pricing.total)
  const seat = formatRupees(site.pricing.seat)
  const batch = `Batch ${site.batch.number}`
  return (
    <>
      <PageIntro
        id="for-parents"
        kicker="Before you decide"
        title="For parents"
        lede={`Your child is asking you to spend ${total} on a ${site.batch.days}-day programme at an institute you have not heard of. Here is what you should know before you decide.`}
      />
      <section ref={ref} className="section page-body">
        <div className="container">
          <div className="prose rise">
            <p>
              <strong>What this is.</strong> An offline institute in {site.city} teaching four current AI tools — Claude
              Code, AI agents, AI video generation and AI Web/App development. Twenty-eight days: fourteen in the
              classroom, followed by fourteen working remotely on a project your child chooses.
            </p>
            <p>
              <strong>The first fourteen days.</strong> Days 1 to 3 build tool fluency and end with a live URL your
              child can show you. Days 4 to 12 cover three guided projects: a web application, an agent and a media
              piece, three days each. Days 13 and 14 are for improving that work and sitting a mock interview about it.
              Everyone builds the same three projects before choosing their own idea.
            </p>
            <p>
              <strong>What remote support means.</strong> On days 15 and 16 we agree the scope of your child's own
              project in writing, so everyone knows what finished means. There are two scheduled live check-ins,
              on day 21 and day 28, with asynchronous help in between. The final check-in is an explain-back of the
              shipped, documented project.
            </p>
            <p>
              <strong>What a classroom day looks like.</strong> The first hour sets up the day's work. The middle is
              spent building with a mentor nearby. In the last thirty minutes, each student explains what they built
              and why, and the others ask questions. The mock interview uses their own work, so the discussion is
              about decisions they actually made.
            </p>
            <p>
              <strong>What your child leaves with.</strong> A live web application, a working agent, a media piece
              about their work and their own finished project, with public links and clean repositories. They also
              have a mock interview with written feedback, practice explaining their decisions, and a certificate
              that states exactly what they did.
            </p>
            <p>
              <strong>What we do not promise.</strong> We do not guarantee a job. We do not quote salary figures. Any
              institute that does is making a promise it cannot keep, and you should be careful with them.
            </p>
            <p>
              <strong>The cost.</strong> {total} in total, including GST. {seat} books a seat, the balance before the
              batch starts. There are no registration or material charges.
            </p>
            <p>
              <strong>Why the batch is three students.</strong> The programme depends on daily individual attention.
              Your child cannot sit at the back of this room.
            </p>
            <p>
              <strong>We are new, and we will say so.</strong> {batch} has not started. We have no graduates and
              therefore no testimonials, and we have chosen not to invent any. What we can show you is exactly how the{' '}
              {site.batch.days} days are structured. Once students finish, we will show their actual work with their
              written permission, with links you can open yourself.
            </p>
            <p>
              <strong>Come and see.</strong> The institute is a real place in {site.city} with a real address. If you
              would like to visit before deciding, we would prefer that.
            </p>
            <div className="btn-row">
              <LinkButton to="/#days" variant="ghost">See the 28-day plan</LinkButton>
              <WhatsAppButton label="Talk to us on WhatsApp" />
              {site.phone ? (
                <LinkButton href={telHref()} variant="ghost">
                  Call
                </LinkButton>
              ) : (
                <Pending value={null} label="Phone number" />
              )}
            </div>
            <div className="contact-card">
              <h2>{site.name}</h2>
              <address>
                <Pending value={site.address.street} label="Street address">
                  {(street) => street}
                </Pending>
                <br />
                {cityLine()}
                {site.address.pin ? null : (
                  <>
                    {' '}
                    <Pending value={null} label="PIN" />
                  </>
                )}
              </address>
              <p>
                <Pending value={site.phone} label="Phone">
                  {(phone) => (
                    <>
                      Phone: <a href={telHref()}>{formatPhone(phone)}</a>
                    </>
                  )}
                </Pending>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
