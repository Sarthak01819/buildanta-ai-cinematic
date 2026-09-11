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
              Code, AI agents, AI video generation and AI Web/App development. Twenty-eight days: two weeks in the room, two
              weeks of remote follow-through.
            </p>
            <p>
              <strong>What your child leaves with.</strong> A working project live on the internet, the code behind it
              in a public repository, a mock interview with written feedback, and a certificate that states exactly
              what they did.
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
              {site.batch.days} days are structured — and once students finish, their actual work, published where you
              can open it yourself.
            </p>
            <p>
              <strong>Come and see.</strong> The institute is a real place in {site.city} with a real address. If you
              would like to visit before deciding, we would prefer that.
            </p>
            <div className="btn-row">
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
