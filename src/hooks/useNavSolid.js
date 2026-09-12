import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { GATES } from '../components/hero/heroMedia.js'

/**
 * The glass navbar arrives when the scrub reaches its final frame. Static
 * heroes switch as they pass the header; inner pages use the glass state.
 */
export function useNavSolid() {
  const { pathname } = useLocation()
  const [solid, setSolid] = useState(pathname !== '/')

  useEffect(() => {
    let frame = null
    const heroes = Array.from(document.querySelectorAll('[data-hero]'))
    function sync() {
      frame = null
      const hero = heroes.find((el) => el.offsetHeight > 0)
      // The sticky film ends one viewport before its section leaves the page.
      const boundary = hero?.classList.contains('hero') ? window.innerHeight : 80
      setSolid(!hero || hero.getBoundingClientRect().bottom <= boundary + 1)
    }
    function schedule() {
      if (frame === null) frame = window.requestAnimationFrame(sync)
    }
    sync()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('pageshow', schedule)
    const queries = GATES.map((query) => window.matchMedia(query))
    for (const query of queries) {
      if (query.addEventListener) query.addEventListener('change', schedule)
      else query.addListener(schedule)
    }
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null
    heroes.forEach((hero) => observer?.observe(hero))
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('pageshow', schedule)
      for (const query of queries) {
        if (query.removeEventListener) query.removeEventListener('change', schedule)
        else query.removeListener(schedule)
      }
      observer?.disconnect()
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [pathname])

  return solid
}
