import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { site } from '../../config/site.js'
import { FORM_ENDPOINT, FORM_ACCESS_KEY } from '../../lib/form.js'
import { hasWhatsapp, whatsappHref } from '../../lib/contact.js'

const SENT = 'Got it. A real person will read this and reply on WhatsApp.'
const HANDED_OVER = 'Got it. We will message you on WhatsApp shortly.'
const STUCK = 'We could not send this automatically yet. Message us on WhatsApp instead.'

/** Spaces and hyphens are dropped, so '+91 98765 43210' and '98765-43210' both read cleanly. */
function normalisePhone(raw) {
  return String(raw || '').replace(/[\s-]/g, '')
}

/** Ten digits, or +91 followed by ten digits. */
function isValidPhone(phone) {
  return /^(\+91)?[0-9]{10}$/.test(phone)
}

/** One status line listing what is missing, or null when the application is complete. */
function validate({ name, phone, consent }) {
  const missing = []
  if (!name) missing.push('your name')
  if (!isValidPhone(phone)) missing.push('a phone number we can reach (10 digits, or +91 and 10 digits)')
  if (!missing.length) return consent ? null : 'Please tick the box to agree to the Terms and the Refund Policy.'
  return `Please add ${missing.join(' and ')}${consent ? '.' : ', and tick the box.'}`
}

/** The WhatsApp hand-over text, the same one the original page composed. */
function composeMessage({ name, phone, who, note }) {
  const lines = [
    `Hi, I would like to apply for Batch ${site.batch.number} of ${site.programme}.`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `I am a: ${who}`,
  ]
  if (note) lines.push(`Note: ${note}`)
  return lines.join('\n')
}

/**
 * Where an application goes, in order:
 *   1. a filled honeypot is a bot: pretend it worked and send nothing;
 *   2. the configured endpoint (VITE_FORM_ENDPOINT), when there is one;
 *   3. WhatsApp, with the application pre-filled, when the number exists;
 *   4. otherwise an honest status, with the WhatsApp button underneath.
 * Nothing here touches the DOM during render, so the page pre-renders as plain markup.
 */
export function useApplySubmit() {
  const { pathname } = useLocation()
  const alive = useRef(false)
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)
  const [fallback, setFallback] = useState(null)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  async function submit(raw) {
    const values = {
      name: String(raw.name || '').trim(),
      phone: normalisePhone(raw.phone),
      who: String(raw.who || '').trim(),
      note: String(raw.note || '').trim(),
      consent: Boolean(raw.consent),
      company: String(raw.company || '').trim(),
    }
    setFallback(null)

    const problem = validate(values)
    if (problem) {
      setStatus(problem)
      return
    }

    if (values.company) {
      setStatus(SENT)
      return
    }

    setStatus('')
    setSending(true)

    let awaited = false
    if (FORM_ENDPOINT) {
      awaited = true
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: values.name,
            phone: values.phone,
            who: values.who,
            note: values.note,
            source: 'website',
            page: pathname,
            ...(FORM_ACCESS_KEY ? { access_key: FORM_ACCESS_KEY } : {}),
          }),
        })
        if (!alive.current) return
        if (res.ok) {
          setSending(false)
          setStatus(SENT)
          return
        }
      } catch {
        /* Network trouble or a bad endpoint: fall through to WhatsApp. */
      }
      if (!alive.current) return
    }

    const message = composeMessage(values)
    if (hasWhatsapp()) {
      window.open(whatsappHref(message), '_blank', 'noopener')
      setSending(false)
      setStatus(HANDED_OVER)
      /* After a network round trip the new tab can be blocked as a pop-up, so leave a link too. */
      if (awaited) setFallback({ message, label: 'Open WhatsApp' })
      return
    }

    setSending(false)
    setStatus(STUCK)
    setFallback({})
  }

  return { status, sending, fallback, submit }
}
