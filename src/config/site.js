/**
 * The one file to fill before launch.
 *
 * Every value marked `null` is a placeholder from section 6 of the build spec
 * (2026-09-08). The site renders a visible "to be added" state for each one,
 * and `npm run check` lists whatever is still missing.
 *
 * Do not put a made-up number anywhere in here. A wrong phone number on a
 * live site costs more than an honest blank.
 */

export const site = {
  name: 'BUILDANTA AI INSTITUTE',
  company: 'BUILDANTA SOLUTION',
  programme: 'AI CareerNext',
  city: 'Kanpur',
  state: 'Uttar Pradesh',
  country: 'IN',

  /**
   * Canonical origin, no trailing slash. Every canonical tag, og:url, the
   * sitemap and robots.txt derive from this, so it must name the domain this
   * build actually answers on. Swap it for the custom domain the day that goes
   * live, or search engines will keep crediting this address.
   */
  url: 'https://buildanta-ai-cinematic.vercel.app',

  /** Street address and PIN. Both null until the owner supplies them. */
  address: {
    /** Everything above the city line. `cityLine()` adds 'Kanpur, Uttar Pradesh 208015' after it. */
    street: 'Awas Vikas No. 3, Panki, Avas Vikas III, Kalyanpur',
    pin: '208015',
  },

  /** E.164 with the plus sign, e.g. '+919876543210'. Used for tel: links. */
  phone: '+919196027117',

  /** Digits only, international format, no plus, e.g. '919876543210'. Used for wa.me links. */
  whatsapp: '919196027117',

  /** A real inbox a human reads. */
  email: 'buildantapvtltd@gmail.com',

  /** 15-character GSTIN. Shown in the footer and on the Terms page. */
  gstin: null,

  social: {
    instagram: null, // full URL
    youtube: null, // full URL
  },

  /** Required by the IT Act rules. The Privacy Policy is incomplete without it. */
  grievanceOfficer: {
    name: null,
    designation: null,
    email: null,
  },

  /** Commitments quoted on the Apply page and in the policies. */
  commitments: {
    replyWithinHours: null, // e.g. 24
    acknowledgeComplaintWithinHours: null, // e.g. 48
    resolveComplaintWithinDays: null, // e.g. 30
    refundWithinWorkingDays: null, // e.g. 7
    enquiryRetentionMonths: null, // e.g. 12
  },

  /** Which analytics tools are actually installed. Empty means none, and the policy says so. */
  analytics: [],

  /** Dates shown on the legal pages. */
  legal: {
    lastUpdated: '2026-09-08',
  },

  pricing: {
    total: 35400,
    seat: 5900,
    balance: 29500,
  },

  batch: {
    number: 1,
    seats: 3,
    days: 28,
  },
}

/** Dotted paths of everything still null. Used by `npm run check`. */
export function missingPlaceholders(config = site) {
  const missing = []
  if (!config.address.street) missing.push('address.street')
  if (!config.address.pin) missing.push('address.pin')
  if (!config.phone) missing.push('phone')
  if (!config.whatsapp) missing.push('whatsapp')
  if (!config.email) missing.push('email')
  if (!config.gstin) missing.push('gstin')
  if (!config.social.instagram) missing.push('social.instagram')
  if (!config.social.youtube) missing.push('social.youtube')
  if (!config.grievanceOfficer.name) missing.push('grievanceOfficer.name')
  if (!config.grievanceOfficer.designation) missing.push('grievanceOfficer.designation')
  if (!config.grievanceOfficer.email) missing.push('grievanceOfficer.email')
  for (const [key, value] of Object.entries(config.commitments)) {
    if (value == null) missing.push(`commitments.${key}`)
  }
  return missing
}
