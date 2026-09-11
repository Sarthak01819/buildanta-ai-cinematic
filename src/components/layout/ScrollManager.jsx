import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

/**
 * Declarative routing does not restore scroll for us, so: new page starts at
 * the top with focus on <main>; a hash scrolls to its target. Same-page hash
 * links glide, cross-page ones jump, because gliding through a 945vh hero
 * from another page would take a while.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()
  const previous = useRef(pathname)

  useEffect(() => {
    const samePage = previous.current === pathname
    previous.current = pathname

    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) {
        const behavior = samePage ? 'smooth' : 'instant'
        window.requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior }))
        return
      }
    }
    if (samePage) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname, hash])

  return null
}
