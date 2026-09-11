import { useEffect, useRef } from 'react'

/**
 * Smooth open and close for the FAQ.
 *
 * The markup is a plain `<details>`, which works with no script at all: that is
 * why it was chosen, and this hook does not take that away. What it adds is the
 * one thing `<details>` cannot do on its own, which is animate. The browser
 * shows and hides the panel outright, so there is nothing to transition between
 * either way, and a close is worse than an open because the content is gone the
 * instant the attribute is.
 *
 * So a click is taken over: opening sets the attribute first and animates the
 * panel down from nothing, closing animates it up and only then drops the
 * attribute, which is what keeps the content on screen long enough to be seen
 * leaving. The icon is driven separately, off `data-state`, so it flips the
 * moment the pointer goes down rather than waiting for the panel to finish.
 *
 * Nothing here runs on the server, and nothing changes the markup React
 * rendered, so hydration has nothing to disagree with. Where the visitor asked
 * for reduced motion the listener stands aside entirely and the element goes
 * back to being the plain, instant `<details>` it already was.
 */
const OPEN_MS = 420
const CLOSE_MS = 320
/* Out fast then settle, which is what reads as "smooth" rather than "slow". */
const EASE_OPEN = 'cubic-bezier(.22,1,.36,1)'
const EASE_CLOSE = 'cubic-bezier(.4,0,.2,1)'

export function useAccordion() {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root || typeof root.animate !== 'function') return undefined

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    /* One running animation per panel, so a fast second click cancels the
       first rather than racing it and stranding an inline height. */
    const running = new Map()
    let disposed = false

    function settle(details, panel) {
      running.delete(details)
      panel.style.removeProperty('height')
      panel.style.removeProperty('opacity')
    }

    function onClick(event) {
      if (reduce.matches) return
      const summary = event.target.closest('summary')
      if (!summary || !root.contains(summary)) return
      const details = summary.parentElement
      const panel = details && details.querySelector('.answer')
      if (!details || !panel) return

      event.preventDefault()
      const previous = running.get(details)
      if (previous) previous.cancel()

      if (!details.open) {
        /* Open the element first: its height cannot be measured while hidden. */
        details.open = true
        details.dataset.state = 'open'
        const height = panel.scrollHeight
        const animation = panel.animate(
          [
            { height: '0px', opacity: 0 },
            { height: `${height}px`, opacity: 1 },
          ],
          { duration: OPEN_MS, easing: EASE_OPEN },
        )
        running.set(details, animation)
        animation.onfinish = () => {
          if (disposed) return
          settle(details, panel)
        }
      } else {
        /* Closing runs the other way and drops the attribute at the end, so the
           panel is still there to watch on the way out. */
        details.dataset.state = 'closing'
        const height = panel.scrollHeight
        const animation = panel.animate(
          [
            { height: `${height}px`, opacity: 1 },
            { height: '0px', opacity: 0 },
          ],
          { duration: CLOSE_MS, easing: EASE_CLOSE },
        )
        running.set(details, animation)
        animation.onfinish = () => {
          if (disposed) return
          details.open = false
          delete details.dataset.state
          settle(details, panel)
        }
      }
    }

    root.addEventListener('click', onClick)
    return () => {
      disposed = true
      root.removeEventListener('click', onClick)
      /* Put every panel back the way React rendered it, including any caught
         mid-animation, so StrictMode's second pass starts from clean markup. */
      for (const [details, animation] of running) {
        animation.cancel()
        const panel = details.querySelector('.answer')
        if (panel) {
          panel.style.removeProperty('height')
          panel.style.removeProperty('opacity')
        }
        delete details.dataset.state
      }
      running.clear()
    }
  }, [])

  return ref
}
