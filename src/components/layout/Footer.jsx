import { Link } from 'react-router'
import { site } from '../../config/site.js'
import { cityLine, formatPhone, formatRupees, mailtoHref, telHref, whatsappHref, hasWhatsapp } from '../../lib/contact.js'
import Pending from '../ui/Pending.jsx'

/** Footer per spec 3.2. The address is what makes an offline institute real to a parent. */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h2>{site.name}</h2>
            <address className="body footer-address">
              <Pending value={site.address.street} label="Street address">
                {(street) => street}
              </Pending>
              <br />
              <span>{cityLine()}</span>
              {site.address.pin ? null : (
                <>
                  {' '}
                  <Pending value={null} label="PIN" />
                </>
              )}
            </address>
            <p className="body footer-contact">
              <Pending value={site.phone} label="Phone">
                {(phone) => (
                  <>
                    Phone: <a href={telHref()}>{formatPhone(phone)}</a>
                  </>
                )}
              </Pending>
              <br />
              <Pending value={site.whatsapp} label="WhatsApp">
                {(number) => (
                  <>
                    WhatsApp:{' '}
                    <a href={whatsappHref()} target="_blank" rel="noopener">
                      {formatPhone(`+${number}`)}
                    </a>
                  </>
                )}
              </Pending>
              <br />
              <Pending value={site.email} label="Email">
                {(email) => (
                  <>
                    Email: <a href={mailtoHref()}>{email}</a>
                  </>
                )}
              </Pending>
            </p>
            <p className="body footer-social">
              <Pending value={site.social.instagram} label="Instagram">
                {(url) => (
                  <a href={url} target="_blank" rel="noopener">
                    Instagram
                  </a>
                )}
              </Pending>
              {' · '}
              <Pending value={site.social.youtube} label="YouTube">
                {(url) => (
                  <a href={url} target="_blank" rel="noopener">
                    YouTube
                  </a>
                )}
              </Pending>
            </p>
          </div>
          <div>
            <h2>The full site</h2>
            <nav aria-label="Site">
              <Link to="/#programme">The programme</Link>
              <Link to="/for-parents">For parents</Link>
              <Link to="/proof">Student work</Link>
              <Link to="/why">Why we exist</Link>
              <Link to="/what-is-claude-code">What is Claude Code?</Link>
              <Link to="/apply">Apply for Batch 1</Link>
              {hasWhatsapp() ? (
                <a href={whatsappHref()} target="_blank" rel="noopener">
                  Message us on WhatsApp
                </a>
              ) : null}
            </nav>
          </div>
          <div>
            <h2>Legal</h2>
            <nav aria-label="Legal">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms &amp; Conditions</Link>
              <Link to="/refund">Refund &amp; Cancellation</Link>
            </nav>
            <p className="body">We do not teach a course. We ship one project per student, in public.</p>
          </div>
        </div>
        <div className="footer-base">
          <p>
            {site.company} ·{' '}
            <Pending value={site.gstin} label="GSTIN">
              {(gstin) => `GSTIN ${gstin}`}
            </Pending>
          </p>
          <p>
            {formatRupees(site.pricing.total)} total, including GST. {formatRupees(site.pricing.seat)} books a seat.
            Payment collection is not enabled on this site.
          </p>
          {/* The heading face is CC BY-SA 4.0 and its .woff2 is served from this
              site, which is redistribution, so the credit is a licence condition
              rather than a courtesy. Kept to one line: the required mention, a
              link to the licence, and the statement that nothing was changed. */}
          <p>
            Headings:{' '}
            <a href="https://yukipixels.itch.io/boldpixels" rel="noopener">
              BoldPixels by YukiPixels
            </a>
            ,{' '}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="noopener">
              CC BY-SA 4.0
            </a>
            , unmodified.
          </p>
        </div>
      </div>
    </footer>
  )
}
