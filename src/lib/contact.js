import { site } from '../config/site.js'

/** The pre-filled message from section 3.3 of the spec. Most people do not message because they do not know what to say. */
export const WHATSAPP_MESSAGE =
  'Hi, I saw the BUILDANTA site. I am a student / working professional and I want to know more.'

/** Click-to-WhatsApp link. Falls back to the Apply page until the number exists, so the button is never dead. */
export function whatsappHref(message = WHATSAPP_MESSAGE) {
  if (!site.whatsapp) return '/apply'
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`
}

export function hasWhatsapp() {
  return Boolean(site.whatsapp)
}

export function telHref() {
  return site.phone ? `tel:${site.phone.replace(/\s+/g, '')}` : null
}

export function mailtoHref() {
  return site.email ? `mailto:${site.email}` : null
}

/** '+919876543210' becomes '+91 98765 43210' for display. Leaves anything unexpected alone. */
export function formatPhone(phone) {
  if (!phone) return null
  const m = /^\+91(\d{5})(\d{5})$/.exec(phone.replace(/\s+/g, ''))
  return m ? `+91 ${m[1]} ${m[2]}` : phone
}

/** City line for the footer and schema: 'Kanpur, Uttar Pradesh 208001' once the PIN exists. */
export function cityLine() {
  return site.address.pin ? `${site.city}, ${site.state} ${site.address.pin}` : `${site.city}, ${site.state}`
}

export function formatRupees(n) {
  return `₹${n.toLocaleString('en-IN')}`
}
