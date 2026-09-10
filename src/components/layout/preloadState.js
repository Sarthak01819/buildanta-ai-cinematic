/**
 * The one bit of shared state between the preloader and the page: has the
 * curtain gone up yet. Anything that starts an entrance (the hero's load ramp,
 * for one) waits on `onRevealed` so it plays when the page is actually seen.
 */
const EVENT = 'bd:reveal'
const CLASS = 'preloading'

export function isPreloading() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains(CLASS)
}

/** Runs `fn` now if the page is already showing, otherwise once the preloader reveals it. Returns the undo. */
export function onRevealed(fn) {
  if (!isPreloading()) {
    fn()
    return () => {}
  }
  const handler = () => fn()
  window.addEventListener(EVENT, handler, { once: true })
  return () => window.removeEventListener(EVENT, handler)
}

/** Called by the preloader exactly once per page load, when the overlay starts to leave. */
export function reveal() {
  document.documentElement.classList.remove(CLASS)
  window.dispatchEvent(new Event(EVENT))
}
