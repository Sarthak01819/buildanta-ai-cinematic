import { PageIntro } from '../components/ui/Section.jsx'
import ApplyForm from '../components/forms/ApplyForm.jsx'
import WhatsAppButton from '../components/ui/WhatsAppButton.jsx'
import Pending from '../components/ui/Pending.jsx'
import { useReveal } from '../hooks/useReveal.js'
import { site } from '../config/site.js'
import { cityLine, formatPhone, mailtoHref, telHref } from '../lib/contact.js'

/** Spec 4.2. The four questions on the left; the talk-instead card and the institute's details on the right. */
export default function Apply() {
  const ref = useReveal()
  const hours = site.commitments.replyWithinHours
  return (
    <>
      <PageIntro
        id="apply-intro"
        kicker="Apply"
        title="Apply for Batch 1"
        lede="Four questions. A real person reads every one, and we'll tell you honestly whether this fits."
      />
      <section ref={ref} className="section" aria-label="Application">
        <div className="container">
          <div className="apply-grid">
            <ApplyForm />
            <div>
              <aside className="aside-card rise" aria-labelledby="talk-heading">
                <h3 id="talk-heading">Would rather just talk?</h3>
                <div className="btn-row">
                  <WhatsAppButton label="Message us on WhatsApp" />
                </div>
              </aside>
              <div className="contact-card rise">
                <h3>{site.name}</h3>
                <address>
                  <Pending value={site.address.street} label="Street address">
                    {(street) => street}
                  </Pending>
                  <br />
                  {cityLine()}
                </address>
                <p>
                  <Pending value={site.phone} label="Phone">
                    {(phone) => <a href={telHref()}>{formatPhone(phone)}</a>}
                  </Pending>
                  {' · '}
                  <Pending value={site.email} label="Email">
                    {(email) => <a href={mailtoHref()}>{email}</a>}
                  </Pending>
                </p>
                <p>{hours ? `We reply within ${hours} hours.` : <Pending value={null} label="Reply-time commitment" />}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
