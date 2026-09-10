import { useEffect, useState } from 'react'
import { MANIFEST, videoWanted } from './preloadManifest.js'
import { heroBlob } from '../hero/heroCache.js'
import { isPreloading, reveal } from './preloadState.js'

const MIN_MS = 1500 /* from navigation start, so the mark gets to build once even from cache */
const MAX_MS = 12000 /* past this the page shows whatever state the assets are in */
const EXIT_MS = 820 /* the curtain's own transition, then the node goes */
const STORAGE_KEY = 'bd-preloaded'

function loadFont(spec) {
  if (!document.fonts || !document.fonts.load) return Promise.resolve()
  return document.fonts.load(spec)
}

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      if (img.decode) img.decode().then(resolve, resolve)
      else resolve()
    }
    img.onerror = resolve
    img.src = url
  })
}

/**
 * Drives the curtain: fetches every asset in the manifest, paints the count
 * into the DOM as it goes, then lifts the curtain and reports `gone` so the
 * component can unmount. Repeat loads in the same session skip straight to
 * gone; the inline script in index.html has already hidden the overlay.
 */
export function usePreloader(ref) {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !isPreloading()) {
      setGone(true)
      return undefined
    }
    let disposed = false
    let exitTimer = null
    let minTimer = null
    let capTimer = null
    const pct = el.querySelector('.preload-pct')
    const label = el.querySelector('.preload-label')
    const items = MANIFEST.filter((it) => it.kind !== 'video' || videoWanted())
    const total = items.reduce((sum, it) => sum + it.bytes, 0)
    const done = new Map()
    let shown = -1
    let subscription = null

    el.classList.add('is-live')

    function paint() {
      const got = items.reduce((sum, it) => sum + it.bytes * (done.get(it) || 0), 0)
      const p = Math.max(shown, Math.min(100, Math.floor((total ? got / total : 1) * 100)))
      if (p === shown) return
      shown = p
      el.style.setProperty('--p', (p / 100).toFixed(3))
      if (pct) pct.textContent = `${p}%`
    }

    function mark(it, frac, what) {
      if (disposed) return
      done.set(it, Math.min(1, Math.max(done.get(it) || 0, frac)))
      if (what && label && label.textContent !== what) label.textContent = what
      paint()
    }

    function load(it) {
      if (it.kind === 'font') return loadFont(it.spec).then(() => mark(it, 1, it.label))
      if (it.kind === 'image') return loadImage(it.url).then(() => mark(it, 1, it.label))
      subscription = heroBlob((frac) => mark(it, frac, it.label))
      return subscription.promise.then(() => mark(it, 1, it.label))
    }

    function finish() {
      if (disposed) return
      disposed = true
      try {
        sessionStorage.setItem(STORAGE_KEY, '1')
      } catch {
        /* private mode: the curtain simply shows again next time */
      }
      if (label) label.textContent = 'Ready'
      el.classList.add('is-done')
      reveal()
      exitTimer = window.setTimeout(() => setGone(true), EXIT_MS)
    }

    paint()
    const loads = Promise.all(items.map((it) => load(it).catch(() => mark(it, 1))))
    const minWait = new Promise((resolve) => {
      minTimer = window.setTimeout(resolve, Math.max(0, MIN_MS - performance.now()))
    })
    const cap = new Promise((resolve) => {
      capTimer = window.setTimeout(resolve, MAX_MS)
    })
    Promise.race([Promise.all([loads, minWait]), cap]).then(finish)

    return () => {
      /* StrictMode's rehearsal run, or navigation away mid-load: leave the shared
         download running for whoever asks next, just stop painting into this node. */
      disposed = true
      window.clearTimeout(exitTimer)
      window.clearTimeout(minTimer)
      window.clearTimeout(capTimer)
      if (subscription) subscription.unsubscribe()
      el.classList.remove('is-live')
      el.style.removeProperty('--p')
    }
  }, [])
  return gone
}
