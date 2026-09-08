/*
 * From the build spec (4.7–4.9), for the owner, not the site:
 * "I am not a lawyer and this is not legal advice. These drafts are built
 * from published guidance on Indian requirements — the DPDP Act 2023, IT Act
 * 2000, IT Rules 2011, the Indian Contract Act 1872 and the Consumer
 * Protection (E-Commerce) Rules 2020. They give you a complete structure and
 * sensible default language. Have a professional review all three before you
 * accept any payment. You are taking money for a service that has not yet
 * been delivered, by a business with no delivery track record. That is
 * exactly the situation where weak terms become expensive. Anything marked
 * [DECIDE: …] is a commercial choice only you can make. Do not launch with
 * those unresolved."
 */
import LegalPage from '../components/legal/LegalPage.jsx'
import Pending from '../components/ui/Pending.jsx'
import { site } from '../config/site.js'
import { cityLine } from '../lib/contact.js'

const DOMAIN = new URL(site.url).host

const hours = (n) => `${n} ${n === 1 ? 'hour' : 'hours'}`
const days = (n) => `${n} ${n === 1 ? 'day' : 'days'}`
const months = (n) => `${n} ${n === 1 ? 'month' : 'months'}`

/** ['Google Analytics 4', 'Meta Pixel'] reads as "Google Analytics 4 and Meta Pixel". */
function listNames(names) {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/** Spec 4.7. Issued under the DPDP Act 2023 and the IT Act 2000. */
export default function Privacy() {
  const c = site.commitments
  const officer = site.grievanceOfficer
  const analytics = site.analytics.length
    ? `We use ${listNames(site.analytics)} for this.`
    : 'We do not currently run third-party analytics or advertising pixels on this site. If that changes, this policy will list them.'
  return (
    <LegalPage
      id="privacy"
      title="Privacy Policy"
      lede={
        <>
          This policy explains what personal data {site.company} ("we", "us") collects through {DOMAIN}, why we
          collect it, and what rights you have. It is issued in line with the Digital Personal Data Protection Act,
          2023 and the Information Technology Act, 2000 and rules made under it.
        </>
      }
    >
      <h2>What we collect</h2>
      <p>
        <strong>When you submit an enquiry or application:</strong> your name, phone number, email address if you
        provide one, whether you are a student or a working professional, and anything you write in the message
        field.
      </p>
      <p>
        <strong>When you contact us on WhatsApp or by phone:</strong> your phone number and the contents of that
        conversation.
      </p>
      <p>
        <strong>Automatically when you visit:</strong> standard technical information such as device type, browser,
        approximate location derived from IP address, pages viewed and time on page. {analytics}
      </p>
      <p>We do not collect payment card details on this website.</p>

      <h2>Why we collect it</h2>
      <ul>
        <li>To respond to your enquiry and tell you whether the programme fits</li>
        <li>To administer enrolment and the programme itself</li>
        <li>To meet legal, tax and accounting obligations</li>
        <li>To understand which pages and campaigns bring people to the site</li>
      </ul>
      <p>We do not sell your personal data. We do not share it for anyone else's marketing.</p>

      <h2>Who we share it with</h2>
      <p>
        Only where necessary: our hosting and analytics providers, communication tools we use to reply to you, our
        payment provider once payment is enabled, and our accountant or auditor for statutory purposes. Where required
        by law, we may disclose data to a competent authority.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Enquiries that do not become enrolments:{' '}
        <Pending value={c.enquiryRetentionMonths} label="Retention period">
          {months}
        </Pending>
        . Enrolment and payment records: as long as tax and accounting law requires. You can ask us to delete your data
        sooner.
      </p>

      <h2>How we protect it</h2>
      <p>
        We use reasonable technical and organisational measures appropriate to the sensitivity of the data. No system
        is perfectly secure, and we do not claim otherwise.
      </p>

      <h2>Your rights</h2>
      <p>
        You may ask us to give you a copy of the personal data we hold about you, correct anything inaccurate, delete
        it, or withdraw consent for future processing. Write to the Grievance Officer below and we will respond within{' '}
        <Pending value={c.resolveComplaintWithinDays} label="Response time">
          {days}
        </Pending>
        .
      </p>

      <h2>Cookies</h2>
      <p>
        The site uses cookies for basic functionality and, where enabled, analytics and advertising measurement. You
        can block cookies in your browser; some parts of the site may then not work as intended.
      </p>

      <h2>Children</h2>
      <p>
        This programme is intended for adults and for students applying with the knowledge of a parent or guardian.
        We do not knowingly collect data from children without that involvement.
      </p>

      <h2>Grievance Officer</h2>
      <p>In accordance with the Information Technology Act, 2000 and the rules made under it:</p>
      <div className="callout">
        <p>
          <strong>Name:</strong>{' '}
          <Pending value={officer.name} label="Grievance Officer name">
            {(name) => name}
          </Pending>
        </p>
        <p>
          <strong>Designation:</strong>{' '}
          <Pending value={officer.designation} label="Grievance Officer designation">
            {(designation) => designation}
          </Pending>
        </p>
        <p>
          <strong>Address:</strong>{' '}
          <Pending value={site.address.street} label="Street address">
            {(street) => street}
          </Pending>
          , {cityLine()}
          {site.address.pin ? null : (
            <>
              {' '}
              <Pending value={null} label="PIN" />
            </>
          )}
        </p>
        <p>
          <strong>Email:</strong>{' '}
          <Pending value={officer.email} label="Grievance Officer email">
            {(email) => <a href={`mailto:${email}`}>{email}</a>}
          </Pending>
        </p>
      </div>
      <p>
        We acknowledge complaints within{' '}
        <Pending value={c.acknowledgeComplaintWithinHours} label="Acknowledgement time">
          {hours}
        </Pending>{' '}
        and aim to resolve them within{' '}
        <Pending value={c.resolveComplaintWithinDays} label="Resolution time">
          {days}
        </Pending>
        .
      </p>

      <h2>Changes</h2>
      <p>We may update this policy. The date at the top shows when it last changed.</p>
    </LegalPage>
  )
}
