import { Link } from 'react-router'
import WhatsAppButton from '../ui/WhatsAppButton.jsx'
import { useApplySubmit } from './useApplySubmit.js'

/**
 * The four questions from spec 4.2, the consent tick, and one honest status
 * line. The fields are uncontrolled, so the server render is plain markup and
 * the submit handler reads the form once, on send.
 */
export default function ApplyForm() {
  const { status, sending, fallback, submit } = useApplySubmit()

  function onSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    submit({
      name: data.get('name'),
      phone: data.get('phone'),
      who: data.get('who'),
      note: data.get('note'),
      consent: data.get('consent') === 'on',
      company: data.get('company'),
    })
  }

  return (
    <form className="form rise" id="apply-form" noValidate onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="f-name">Your name</label>
        <input id="f-name" name="name" type="text" autoComplete="name" required />
      </div>
      <div className="field">
        <label htmlFor="f-phone">Phone number</label>
        <input
          id="f-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          aria-describedby="f-phone-hint"
          required
        />
        <p className="form-note" id="f-phone-hint">
          We'll reach you on WhatsApp.
        </p>
      </div>
      <div className="field">
        <label htmlFor="f-who">Are you a student or a working professional?</label>
        <select id="f-who" name="who" required>
          <option value="Student">Student</option>
          <option value="Working professional">Working professional</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-note">Anything you'd like us to know (optional)</label>
        <textarea id="f-note" name="note" rows={3} />
      </div>
      {/* The honeypot. People never see it; bots fill everything, and a filled field sends nothing. */}
      <div className="vh" aria-hidden="true">
        <label htmlFor="f-company">Company</label>
        <input id="f-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="consent">
        <input id="f-consent" name="consent" type="checkbox" required />
        <span>
          I have read and agree to the{' '}
          <Link to="/terms" target="_blank" rel="noopener">
            Terms &amp; Conditions
          </Link>{' '}
          and the{' '}
          <Link to="/refund" target="_blank" rel="noopener">
            Refund Policy
          </Link>
          .
        </span>
      </label>
      <div className="btn-row">
        <button className="btn btn-primary" type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Send application'}
        </button>
      </div>
      <p className="form-note">Four questions. It takes a minute, and a real person reads every one.</p>
      <p className={status ? 'form-status on' : 'form-status'} id="form-status" role="status" aria-live="polite">
        {status}
      </p>
      {fallback ? (
        <div className="btn-row">
          <WhatsAppButton message={fallback.message} label={fallback.label} />
        </div>
      ) : null}
    </form>
  )
}
