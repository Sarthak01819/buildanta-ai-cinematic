import { useEffect, useRef } from 'react'

/**
 * Section entrances. Adds `in` when the element scrolls into view and `done`
 * once the stagger has played, exactly as the original `[data-anim]` observer
 * did. Reduced motion, or no IntersectionObserver, pins the final state.
 */
export function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) {
      el.classList.add('in', 'done')
      return undefined
    }
    let timer = null
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          el.classList.add('in')
          io.disconnect()
          timer = window.setTimeout(() => el.classList.add('done'), 1400)
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.06 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (timer) window.clearTimeout(timer)
    }
  }, [])
  return ref
}
