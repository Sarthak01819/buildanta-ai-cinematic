import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { getPage } from '../../seo/pages.js'
import { headFor } from '../../seo/head.js'

function upsert(selector, create, apply) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  apply(el)
}

function setMeta(attr, key, content) {
  const selector = `meta[${attr}="${key}"]`
  if (content == null) {
    document.head.querySelector(selector)?.remove()
    return
  }
  upsert(
    selector,
    () => {
      const m = document.createElement('meta')
      m.setAttribute(attr, key)
      return m
    },
    (m) => m.setAttribute('content', content),
  )
}

/**
 * Keeps the document head in step with the route after client-side navigation.
 * The first paint of every page is pre-rendered with the same values, so this
 * only ever has to update, never create, on a normal visit.
 */
export default function Seo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const head = headFor(getPage(pathname))
    document.title = head.title
    setMeta('name', 'description', head.description)
    setMeta('property', 'og:title', head.title)
    setMeta('property', 'og:description', head.description)
    setMeta('property', 'og:url', head.canonical)
    setMeta('name', 'robots', head.noindex ? 'noindex,nofollow' : null)
    if (head.canonical) {
      upsert(
        'link[rel="canonical"]',
        () => {
          const l = document.createElement('link')
          l.rel = 'canonical'
          return l
        },
        (l) => (l.href = head.canonical),
      )
    } else {
      document.head.querySelector('link[rel="canonical"]')?.remove()
    }
  }, [pathname])
  return null
}
