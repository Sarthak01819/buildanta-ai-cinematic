/**
 * Optional form endpoint (Formspree, Web3Forms, Basin, or your own function).
 * Set VITE_FORM_ENDPOINT in a `.env` file. When it is unset the form hands the
 * application to WhatsApp instead, so nothing is ever silently lost.
 */
export const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || null

/** Optional access key some providers want in the body (Web3Forms does). */
export const FORM_ACCESS_KEY = import.meta.env.VITE_FORM_ACCESS_KEY || null
