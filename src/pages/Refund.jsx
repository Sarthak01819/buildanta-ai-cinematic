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
import Decide from '../components/legal/Decide.jsx'
import Pending from '../components/ui/Pending.jsx'
import { site } from '../config/site.js'
import { formatPhone, formatRupees, mailtoHref, telHref } from '../lib/contact.js'

const hours = (n) => `${n} ${n === 1 ? 'hour' : 'hours'}`
const workingDays = (n) => `${n} working ${n === 1 ? 'day' : 'days'}`

/** Spec 4.9. The cancellation terms are the owner's call and stay inside <Decide> until made. */
export default function Refund() {
  const c = site.commitments
  const seat = formatRupees(site.pricing.seat)
  const email = (
    <Pending value={site.email} label="Email">
      {(address) => <a href={mailtoHref()}>{address}</a>}
    </Pending>
  )
  return (
    <LegalPage
      id="refund"
      title="Refund & Cancellation Policy"
      lede="This policy is issued in line with the Consumer Protection (E-Commerce) Rules, 2020."
    >
      <h2>If you cancel before the batch starts</h2>
      <Decide>
        <p>Choose one and delete the others. This is the single most important commercial decision on the site.</p>
        <ul>
          <li>
            <em>Option A:</em> The {seat} booking amount is non-refundable. Any balance already paid is refunded in
            full.
          </li>
          <li>
            <em>Option B:</em> Cancel more than [7] days before the start date and the booking amount is refunded in
            full. Cancel within [7] days and it is retained.
          </li>
          <li>
            <em>Option C:</em> The booking amount is refundable in full up until the batch start date.
          </li>
        </ul>
      </Decide>

      <h2>If you cancel after the batch has started</h2>
      <Decide>
        <p>For example: no refund after day 1; or pro-rata up to day 3; or a fixed partial.</p>
      </Decide>
      <p>
        Because the batch is three students, a seat you leave cannot be filled. Please tell us as early as you can.
      </p>

      <h2>If we cancel or postpone</h2>
      <p>
        If we cancel a batch, you receive a <strong>full refund of everything you have paid</strong>, including the
        booking amount.
      </p>
      <p>If we postpone, you may either move to the new dates or take a full refund.</p>

      <h2>How to request a refund</h2>
      <p>
        Write to {email} from the address or phone number used at enrolment, with your name and the batch you booked.
        We acknowledge within{' '}
        <Pending value={c.acknowledgeComplaintWithinHours} label="Acknowledgement time">
          {hours}
        </Pending>
        .
      </p>

      <h2>How refunds are paid</h2>
      <p>
        To the original payment method, within{' '}
        <strong>
          <Pending value={c.refundWithinWorkingDays} label="Refund time">
            {workingDays}
          </Pending>
        </strong>{' '}
        of approval. Bank processing time may add a few days.
      </p>

      <h2>Questions</h2>
      <p>
        {email} ·{' '}
        <Pending value={site.phone} label="Phone">
          {(phone) => <a href={telHref()}>{formatPhone(phone)}</a>}
        </Pending>{' '}
        ·{' '}
        <Pending value={site.address.street} label="Street address">
          {(street) => street}
        </Pending>
        , {site.city}
      </p>
    </LegalPage>
  )
}
