import { Link } from 'react-router'
import { site } from '../../config/site.js'
import { cityLine, formatPhone, formatRupees, mailtoHref, telHref, whatsappHref, hasWhatsapp } from '../../lib/contact.js'
import Pending from '../ui/Pending.jsx'
import { FacebookIcon, InstagramIcon } from '../ui/SocialIcons.jsx'

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
                  <a href={url} target="_blank" rel="noopener" aria-label="BUILDANTA on Instagram">
                    <InstagramIcon />
                  </a>
                )}
              </Pending>
              <Pending value={site.social.facebook} label="Facebook">
                {(url) => (
                  <a href={url} target="_blank" rel="noopener" aria-label="BUILDANTA on Facebook">
                    <FacebookIcon />
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
            <p className="body">Three guided projects. Then your own idea, shipped in public. Work you can show and explain.</p>
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
          {/* The visible BoldPixels credit was removed at the owner's request.
              CC BY-SA 4.0 still requires it while this site serves the .woff2,
              so it now lives as a comment in index.html beside the font preload,
              next to the licence file at /assets/fonts/boldpixels-LICENSE.txt.
              Changing the heading face to an OFL one would end the obligation. */}
        </div>
      </div>
    </footer>
  )
}
