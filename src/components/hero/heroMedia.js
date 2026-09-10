/* The media behind the scrub hero. Paths are absolute so every route resolves them. */
export const VIDEO_URL = '/assets/hero-scrub.mp4'
export const VIDEO_BYTES = 9035316 /* the real size, used when Content-Length is missing */
export const POSTER_URL = '/assets/hero-poster.jpg'

/* The five static gates. The same list as the media query block in motion.css,
   which hides the scrub hero and shows the static one wherever any of these match. */
export const GATES = [
  '(max-width: 720px)',
  '(orientation: portrait) and (max-width: 1024px)',
  '(orientation: portrait) and (pointer: coarse)',
  '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
  '(prefers-reduced-motion: reduce)',
]

/** True where the scrub hero is off and the static hero shows instead. */
export function scrubGated() {
  if (typeof window === 'undefined' || !window.matchMedia) return true
  return GATES.some((q) => window.matchMedia(q).matches)
}
