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
import { Link } from 'react-router'
import LegalPage from '../components/legal/LegalPage.jsx'
import Decide from '../components/legal/Decide.jsx'
import Pending from '../components/ui/Pending.jsx'
import { site } from '../config/site.js'
import { cityLine, formatPhone, formatRupees, mailtoHref, telHref } from '../lib/contact.js'

const DOMAIN = new URL(site.url).host

/** Spec 4.8. The fees in clause 3 come from site.pricing so the number has one source. */
export default function Terms() {
  const { total, seat, balance } = site.pricing
  return (
    <LegalPage
      id="terms"
      title="Terms & Conditions"
      lede={
        <>
          These terms govern your use of {DOMAIN} and your enrolment in the {site.programme} programme offered by{' '}
          {site.company}, operating as {site.name},{' '}
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
          .{' '}
          <Pending value={site.gstin} label="GSTIN">
            {(gstin) => `GSTIN ${gstin}`}
          </Pending>
          .
        </>
      }
    >
      <p>By submitting an application or making a payment you agree to these terms.</p>

      <h2>1. What the programme is</h2>
      <p>
        {site.programme} is a {site.batch.days}-day programme: two weeks conducted in person at our {site.city}{' '}
        premises, and two weeks of remote follow-through. It covers Claude Code, AI agents, AI video generation and AI
        development. Each student builds and publishes one project.
      </p>
      <p>
        On completion a student receives a live project URL, a public code repository, a demo video, a mock interview
        with written feedback, a LinkedIn case study, and a certificate of completion stating what they did.
      </p>

      <h2>2. Enrolment</h2>
      <p>
        Applying does not guarantee a place. Places are limited and we may decline an application where we judge the
        programme is not a fit. A place is confirmed only when the booking amount is received and we confirm it in
        writing.
      </p>

      <h2>3. Fees</h2>
      <p>
        The total fee is <strong>{formatRupees(total)}, inclusive of GST</strong>. A booking amount of{' '}
        <strong>{formatRupees(seat)}</strong> confirms a seat and the balance of <strong>{formatRupees(balance)}</strong>{' '}
        is payable before the batch begins. There are no registration or material charges.
      </p>
      <p>Fees are quoted in Indian Rupees. A GST-compliant receipt is issued for every payment.</p>

      <h2>4. What we do not promise</h2>
      <p>
        <strong>We do not guarantee employment, placement, an interview, or any particular income.</strong> No
        statement on our website, in our advertising, or by any of our staff should be read as such a guarantee. Any
        market statistics we publish are cited context about the wider job market and are not a prediction about any
        individual student's outcome.
      </p>
      <p>What we commit to is the delivery of the programme as described in clause 1.</p>

      <h2>5. Your responsibilities</h2>
      <p>
        The programme depends on daily participation and a daily explain-back. Sustained absence will materially affect
        what you get from it. Please tell us in advance if you will miss a session.
      </p>
      <p>
        You agree not to disrupt other students' learning, and to use any accounts or tools we provide only for
        programme work.
      </p>

      <h2>6. Course material and your work</h2>
      <p>
        Teaching material we provide remains our intellectual property and is for your personal learning use. You may
        not redistribute or resell it.
      </p>
      <p>
        <strong>The project you build is yours.</strong> Because the programme is built around publishing work in
        public, we may link to, display, or reference your published project, repository and demo video in our own
        materials.
      </p>
      <Decide>
        <p>State whether a student may opt out of this, and how.</p>
      </Decide>

      <h2>7. Changes and cancellation by us</h2>
      <p>
        We may reschedule a batch or change the delivery format where circumstances require it. If we cancel a batch
        outright, the <Link to="/refund">Refund &amp; Cancellation Policy</Link> applies.
      </p>
      <p>We may end a student's participation for conduct that seriously disrupts the programme.</p>
      <Decide>
        <p>Whether any refund applies in that case.</p>
      </Decide>

      <h2>8. Liability</h2>
      <p>
        To the extent permitted by law, our total liability in connection with the programme is limited to the fees
        you have paid us. We are not liable for indirect or consequential loss, including loss of employment
        opportunity or earnings.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These terms are governed by the laws of India. The courts at {site.city}, {site.state} have exclusive
        jurisdiction over any dispute.
      </p>

      <h2>10. Changes to these terms</h2>
      <p>We may update these terms. The version in force is the one published on the date you enrol.</p>

      <h2>Contact</h2>
      <p>
        {site.company} ·{' '}
        <Pending value={site.address.street} label="Street address">
          {(street) => street}
        </Pending>
        , {site.city} ·{' '}
        <Pending value={site.email} label="Email">
          {(email) => <a href={mailtoHref()}>{email}</a>}
        </Pending>{' '}
        ·{' '}
        <Pending value={site.phone} label="Phone">
          {(phone) => <a href={telHref()}>{formatPhone(phone)}</a>}
        </Pending>
      </p>
    </LegalPage>
  )
}
