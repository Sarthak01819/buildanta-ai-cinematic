import { useEffect, useRef } from 'react'

/* Time based, not per frame, for the same reason the scrub lerp is: a per frame
   step fills twice as fast on a 120Hz screen and the hold feels like a
   different interaction on different hardware. */
const HOLD_MS = 1150
const RELEASE_MS = 700
const DONE_LABEL = 'Shipped'

/**
 * The one interactive moment: hold to ship. Press and hold the button and the
 * cards light up in turn, one per equal share of the hold, however many there
 * are. Let go early and it drains back. Once it is shipped it stays shipped.
 *
 * Everything happens on the DOM through refs, inside one effect, so the server
 * render is plain markup and hydration has nothing to disagree with. Reduced
 * motion pins the finished state, as the original page did. The cleanup puts
 * the markup back exactly as React rendered it, so StrictMode's double mount
 * and a later remount both start clean.
 */
export function useHoldToShip() {
  const holdRef = useRef(null)
  const ownsRef = useRef(null)

  useEffect(() => {
    const hold = holdRef.current
    const grid = ownsRef.current
    if (!hold || !grid) return undefined

    const label = hold.querySelector('span')
    const initialLabel = label ? label.textContent : ''
    const blocks = Array.from(hold.querySelectorAll('.blocks i'))
    const owns = Array.from(grid.querySelectorAll('.own'))
    const total = owns.length

    let hp = 0
    let holding = false
    let done = false
    let raf = null
    let last = 0
    let lastLit = -1

    function litCount(p) {
      return Math.min(total, Math.floor(p * total + 0.0001))
    }

    function paint() {
      hold.style.setProperty('--hp', hp.toFixed(3))
      const n = litCount(hp)
      if (n === lastLit) return
      lastLit = n
      owns.forEach((el, i) => el.classList.toggle('lit', i < n))
      blocks.forEach((el, i) => el.classList.toggle('lit', i < n))
    }

    /* Once it is shipped it stays shipped. They are earned, so they do not
       fade back out when the visitor lets go. */
    function finish() {
      done = true
      holding = false
      hp = 1
      paint()
      hold.setAttribute('data-done', 'true')
      if (label) label.textContent = DONE_LABEL
    }

    function tick(now) {
      raf = null
      const dt = Math.min(120, now - (last || now))
      last = now
      if (done) {
        hp = 1
        paint()
        return
      }
      if (holding) hp = Math.min(1, hp + dt / HOLD_MS)
      else hp = Math.max(0, hp - dt / RELEASE_MS)
      paint()
      if (hp >= 1) {
        finish()
        return
      }
      if ((holding && hp < 1) || (!holding && hp > 0)) raf = requestAnimationFrame(tick)
    }

    function start(e) {
      if (e.type === 'keydown') {
        if (e.key !== ' ' && e.key !== 'Enter') return
        e.preventDefault()
        /* A held key auto-repeats. Restarting the clock on every repeat would halve the fill rate. */
        if (e.repeat) return
      } else {
        e.preventDefault()
      }
      if (done) return
      holding = true
      last = 0
      if (raf === null) raf = requestAnimationFrame(tick)
    }

    function end() {
      if (done) return
      holding = false
      last = 0
      if (raf === null && hp > 0) raf = requestAnimationFrame(tick)
    }

    function pin() {
      if (raf !== null) {
        cancelAnimationFrame(raf)
        raf = null
      }
      finish()
    }

    hold.addEventListener('pointerdown', start)
    hold.addEventListener('pointerup', end)
    hold.addEventListener('pointerleave', end)
    hold.addEventListener('pointercancel', end)
    hold.addEventListener('keydown', start)
    hold.addEventListener('keyup', end)
    hold.addEventListener('blur', end)

    /* Reduced motion pins the final state, and keeps doing so if it is switched on later. */
    const rmq = window.matchMedia('(prefers-reduced-motion: reduce)')
    function onReducedMotion(e) {
      if (e.matches) pin()
    }
    if (rmq.matches) pin()
    if (rmq.addEventListener) rmq.addEventListener('change', onReducedMotion)
    else if (rmq.addListener) rmq.addListener(onReducedMotion)

    return () => {
      if (rmq.removeEventListener) rmq.removeEventListener('change', onReducedMotion)
      else if (rmq.removeListener) rmq.removeListener(onReducedMotion)
      hold.removeEventListener('pointerdown', start)
      hold.removeEventListener('pointerup', end)
      hold.removeEventListener('pointerleave', end)
      hold.removeEventListener('pointercancel', end)
      hold.removeEventListener('keydown', start)
      hold.removeEventListener('keyup', end)
      hold.removeEventListener('blur', end)
      if (raf !== null) cancelAnimationFrame(raf)
      raf = null
      hold.style.removeProperty('--hp')
      hold.removeAttribute('data-done')
      if (label) label.textContent = initialLabel
      owns.forEach((el) => el.classList.remove('lit'))
      blocks.forEach((el) => el.classList.remove('lit'))
    }
  }, [])

  return { holdRef, ownsRef }
}
