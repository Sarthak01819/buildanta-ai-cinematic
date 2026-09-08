import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

/**
 * The header bar rides dark footage at the top of the home page and beige page
 * everywhere else. It goes solid once the visible hero has scrolled past.
 */
export function useNavSolid() {
  const { pathname } = useLocation()
  const [solid, setSolid] = useState(pathname !== '/')

  useEffect(() => {
    function sync() {
      const heroes = document.querySelectorAll('[data-hero]')
      let hero = null
      for (const el of heroes) {
        if (el.offsetHeight > 0) {
          hero = el
          break
        }
      }
      setSolid(!hero || hero.getBoundingClientRect().bottom <= 80)
    }
    sync()
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [pathname])

  return solid
}
