import Section from '../ui/Section.jsx'
import { site } from '../../config/site.js'
import { formatRupees } from '../../lib/contact.js'

/** f. What it costs. The number is on the page, from the one config file. */
export default function Price() {
  const { total, seat, balance } = site.pricing
  return (
    <Section id="cost" kicker="What it costs" title="The number is on the page." tint>
      <div className="price rise">
        <div>
          <span className="figure">{formatRupees(total)}</span>
          <p className="note">Total, including GST.</p>
        </div>
        <div className="price-lines">
          <p className="price-line">
            <span>Books your seat</span>
            <span>{formatRupees(seat)}</span>
          </p>
          <p className="price-line">
            <span>Balance, before the batch starts</span>
            <span>{formatRupees(balance)}</span>
          </p>
          <p className="price-line">
            <span>Registration fee</span>
            <span>None</span>
          </p>
          <p className="price-line">
            <span>Material charges</span>
            <span>None</span>
          </p>
        </div>
      </div>
      <p className="body rise" style={{ marginTop: '2rem' }}>
        Contact us for pricing usually means the price depends on who is asking. Ours does not.
      </p>
    </Section>
  )
}
