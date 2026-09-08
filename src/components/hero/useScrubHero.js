import { useEffect } from 'react'

/* The media behind the scrub hero. Paths are absolute so every route resolves them. */
export const VIDEO_URL = '/assets/hero-scrub.mp4'
export const VIDEO_BYTES = 10391770 /* the real size, used when Content-Length is missing */
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

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'
const CHAPTERS = ['Outside', 'The window', 'The desk']
const RING_LENGTH = 126
const LERP_K = 0.16
const LOAD_RAMP_MS = 900
const POSTER_WAIT_MS = 4000
const WATCHDOG_MS = 20000
const CHEVRON =
  '<svg class="chev" viewBox="0 0 22 34" aria-hidden="true">' +
  '<path d="M4 12l7 7 7-7" fill="none" stroke="currentColor" stroke-width="3"/>' +
  '<path d="M4 22l7 7 7-7" fill="none" stroke="currentColor" stroke-width="3" opacity=".5"/></svg>'

function smoothstep(p, e0, e1) {
  const t = Math.min(1, Math.max(0, (p - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}

function chapterFor(p) {
  if (p < 0.33) return CHAPTERS[0]
  return p < 0.66 ? CHAPTERS[1] : CHAPTERS[2]
}

/* Old Safari only had addListener on a MediaQueryList. Returns the undo. */
function listen(mql, fn) {
  if (mql.addEventListener) mql.addEventListener('change', fn)
  else if (mql.addListener) mql.addListener(fn)
  return () => {
    if (mql.removeEventListener) mql.removeEventListener('change', fn)
    else if (mql.removeListener) mql.removeListener(fn)
  }
}

/**
 * The drive behind the scrub hero, ported from the original page as one
 * effect. It owns: scroll progress into a time-based lerp on rAF, gated seeks
 * on the video, band opacity and `--k` writes, the chapter chip, the load ramp
 * that lets band 1 fall in before any scrolling, the streamed blob fetch
 * behind the progress ring (with its watchdog and the chevron on failure), the
 * five gates that switch the scrub on and off live, and the reduced-motion
 * change that re-applies the mode.
 *
 * Every DOM node arrives through a ref and is only touched inside the effect,
 * so the component renders the same on the server and in the browser. The
 * cleanup undoes everything, including the DOM writes, so StrictMode's second
 * run in development starts from the markup React rendered.
 *
 * @param {object} refs  hero, stage, video, poster, bands, chip, loader, ring
 */
export function useScrubHero(refs) {
  useEffect(() => {
    const hero = refs.hero.current
    const stage = refs.stage.current
    const video = refs.video.current
    const poster = refs.poster.current
    const loader = refs.loader.current
    const ring = refs.ring.current
    const chip = refs.chip.current
    const bandsEl = refs.bands.current
    if (!hero || !stage || !video || !bandsEl) return undefined

    const bands = Array.from(bandsEl.querySelectorAll('.band'), (el) => ({
      el,
      a: parseFloat(el.dataset.a),
      b: parseFloat(el.dataset.b),
      ramp: parseFloat(el.dataset.ramp) || 0,
      op: -1,
      k: -1,
    }))
    /* The ring React rendered, kept so the chevron can be swapped back out. */
    const ringSvg = loader ? loader.firstElementChild : null

    let disposed = false

    /* ---------- the drive ---------- */
    let target = 0
    let shown = 0
    let rafId = null
    let lastTick = 0
    let heroOnScreen = true
    let scrubOn = false
    let loadK = 0
    let loadStart = 0
    let loadRamping = false
    let lastChapter = ''

    /* ---------- gated seeks ---------- */
    let seekBusy = false
    let pendingTime = null

    /* ---------- the load ---------- */
    let heroInit = false
    let fetchStarted = false
    let failed = false
    let posterImg = null
    let posterTimer = null
    let ctrl = null
    let watchdog = null
    let blobUrl = null

    function heroProgress() {
      const range = hero.offsetHeight - window.innerHeight
      if (range <= 0) return 0
      const p = -hero.getBoundingClientRect().top / range
      return Math.min(1, Math.max(0, p))
    }

    function updateChapter(p) {
      const name = chapterFor(p)
      if (name === lastChapter || !chip) return
      lastChapter = name
      chip.textContent = name
    }

    function updateCaptions(p) {
      for (let i = 0; i < bands.length; i += 1) {
        const b = bands[i]
        const f = Math.min(0.02, (b.b - b.a) / 3)
        const inRamp = i === 0 ? 1 : smoothstep(p, b.a, b.a + f)
        const outRamp = i === bands.length - 1 ? 1 : 1 - smoothstep(p, b.b - f, b.b)
        const op = inRamp * outRamp
        let k = clamp((p - b.a) / (b.ramp || Math.min(0.025, (b.b - b.a) * 0.35)), 0, 1)
        if (i === 0) k = Math.max(k, loadK)
        if (Math.abs(op - b.op) > 0.004) {
          b.op = op
          b.el.style.opacity = op.toFixed(3)
        }
        if (Math.abs(k - b.k) > 0.008) {
          b.k = k
          b.el.style.setProperty('--k', k.toFixed(3))
        }
      }
      updateChapter(p)
    }

    function requestSeek(t) {
      if (!video.duration || Number.isNaN(video.duration)) return
      if (seekBusy) {
        pendingTime = t
        return
      }
      /* A seek to where the video already is does not come back as `seeked`
         in every browser, and a stuck busy flag would freeze the scrub. */
      if (Math.abs(video.currentTime - t) < 0.0001) return
      seekBusy = true
      try {
        video.currentTime = t
      } catch {
        seekBusy = false
      }
    }

    function onSeeked() {
      seekBusy = false
      if (pendingTime !== null) {
        const t = pendingTime
        pendingTime = null
        requestSeek(t)
      }
    }

    function onVideoError() {
      seekBusy = false
      pendingTime = null
      failVideo()
    }

    /* Time based, not per frame, so the settle feels the same at 60Hz and 120Hz. */
    function tick(now) {
      if (disposed) return
      const dt = Math.min(100, now - (lastTick || now))
      lastTick = now
      shown += (target - shown) * (1 - Math.pow(1 - LERP_K, dt / 16.667))

      if (loadRamping) {
        loadK = Math.min(1, (now - loadStart) / LOAD_RAMP_MS)
        if (loadK >= 1) loadRamping = false
      }

      const settled = Math.abs(target - shown) < 0.0005
      if (settled && !loadRamping) {
        shown = target
        rafId = null
        lastTick = 0
      } else {
        rafId = window.requestAnimationFrame(tick)
      }
      requestSeek(shown * (video.duration || 0))
      updateCaptions(shown)
    }

    function onScroll() {
      target = heroProgress()
      if (rafId === null && heroOnScreen) {
        lastTick = 0
        rafId = window.requestAnimationFrame(tick)
      }
    }

    /* ---------- the streamed blob behind an honest ring ---------- */
    function failVideo() {
      if (disposed || failed) return
      failed = true
      if (loader) {
        loader.classList.add('on')
        loader.innerHTML = CHEVRON
      }
      stage.classList.add('video-failed')
    }

    function armWatchdog() {
      window.clearTimeout(watchdog)
      watchdog = window.setTimeout(() => {
        if (ctrl) ctrl.abort()
      }, WATCHDOG_MS)
    }

    async function loadHeroBlob() {
      if (!window.fetch || !window.AbortController) throw new Error('no fetch')
      ctrl = new AbortController()
      const chunks = []
      let got = 0
      let lastRing = 0
      armWatchdog()
      try {
        const res = await fetch(VIDEO_URL, { signal: ctrl.signal, priority: 'low' })
        if (!res.ok || !res.body) throw new Error('bad response')
        const total = Number(res.headers.get('Content-Length')) || VIDEO_BYTES
        const reader = res.body.getReader()
        for (;;) {
          const r = await reader.read()
          if (r.done || disposed) break
          armWatchdog()
          chunks.push(r.value)
          got += r.value.length
          const frac = Math.min(1, got / total)
          const now = performance.now()
          if (now - lastRing > 100 || frac === 1) {
            lastRing = now
            if (ring) ring.style.setProperty('--ld', String(Math.round(RING_LENGTH * (1 - frac))))
          }
        }
      } finally {
        window.clearTimeout(watchdog)
        watchdog = null
      }
      if (disposed) return
      if (ring) ring.style.setProperty('--ld', '0')
      if (loader) loader.classList.remove('on')
      blobUrl = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }))
      video.addEventListener('canplay', onCanPlay, { once: true })
      video.src = blobUrl
      video.load()
    }

    function onCanPlay() {
      if (disposed) return
      requestSeek(heroProgress() * video.duration)
      stage.classList.add('video-ready')
    }

    function startBlobFetch() {
      if (disposed || fetchStarted) return
      fetchStarted = true
      if (loader) loader.classList.add('on')
      loadHeroBlob().catch(failVideo)
    }

    /* The poster goes first and the footage waits for it, or for four seconds. */
    function initHeroOnce() {
      if (heroInit) return
      heroInit = true
      if (poster) poster.style.backgroundImage = `url('${POSTER_URL}')`
      loadStart = performance.now()
      loadRamping = true
      posterImg = new Image()
      posterImg.onload = startBlobFetch
      posterImg.onerror = startBlobFetch
      posterImg.src = POSTER_URL
      posterTimer = window.setTimeout(startBlobFetch, POSTER_WAIT_MS)
    }

    /* ---------- the five gates, live in both directions ---------- */
    function enableScrub() {
      if (scrubOn) return
      scrubOn = true
      initHeroOnce()
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
      for (const b of bands) {
        b.op = -1
        b.k = -1
      }
      updateCaptions(heroProgress())
      onScroll()
    }

    function disableScrub() {
      if (!scrubOn) return
      scrubOn = false
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    const mqls = GATES.map((q) => window.matchMedia(q))
    function applyHeroMode() {
      if (disposed) return
      const off = mqls.some((m) => m.matches)
      if (off) disableScrub()
      else enableScrub()
    }

    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onVideoError)

    let io = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          heroOnScreen = entries[entries.length - 1].isIntersecting
          if (heroOnScreen && scrubOn && rafId === null) {
            lastTick = 0
            rafId = window.requestAnimationFrame(tick)
          }
        },
        { rootMargin: '100px' },
      )
      io.observe(hero)
    }

    const unlisten = mqls.map((m) => listen(m, applyHeroMode))
    /* Reduced motion is one of the gates already; this mirrors the original's
       own handler so a change re-applies the mode in both directions even if
       the gate list changes. */
    unlisten.push(listen(window.matchMedia(REDUCE_QUERY), applyHeroMode))
    applyHeroMode()

    return () => {
      disposed = true
      disableScrub()
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
        rafId = null
      }
      for (const off of unlisten) off()
      if (io) io.disconnect()
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onVideoError)
      video.removeEventListener('canplay', onCanPlay)
      if (posterImg) {
        posterImg.onload = null
        posterImg.onerror = null
        posterImg = null
      }
      window.clearTimeout(posterTimer)
      window.clearTimeout(watchdog)
      if (ctrl) ctrl.abort()
      if (blobUrl) {
        video.removeAttribute('src')
        video.load()
        URL.revokeObjectURL(blobUrl)
        blobUrl = null
      }
      /* Put the DOM back the way React rendered it. */
      stage.classList.remove('video-ready', 'video-failed')
      if (loader) {
        loader.classList.remove('on')
        if (failed && ringSvg) loader.replaceChildren(ringSvg)
      }
      if (ring) ring.style.removeProperty('--ld')
      if (poster) poster.style.removeProperty('background-image')
      for (const b of bands) {
        b.el.style.removeProperty('opacity')
        b.el.style.removeProperty('--k')
      }
      if (chip) chip.textContent = CHAPTERS[0]
    }
  }, [])
}
