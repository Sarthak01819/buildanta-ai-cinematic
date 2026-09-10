import { VIDEO_URL, VIDEO_BYTES } from './heroMedia.js'

/**
 * One streamed download of the hero footage per page load, shared by the
 * preloader and the scrub hero, so the 9 MB never travels twice. Whoever asks
 * first starts it; everyone gets the same Blob promise and their own progress
 * callback. A stall of WATCHDOG_MS with no bytes aborts and rejects, and the
 * next caller starts over.
 */
const WATCHDOG_MS = 20000

const state = {
  promise: null,
  got: 0,
  total: VIDEO_BYTES,
  listeners: new Set(),
}

function notify() {
  const frac = state.total ? Math.min(1, state.got / state.total) : 0
  for (const fn of state.listeners) fn(frac, state.got, state.total)
}

async function download() {
  if (typeof fetch !== 'function' || typeof AbortController !== 'function') throw new Error('no fetch')
  const ctrl = new AbortController()
  let watchdog = null
  const arm = () => {
    clearTimeout(watchdog)
    watchdog = setTimeout(() => ctrl.abort(), WATCHDOG_MS)
  }
  const chunks = []
  arm()
  try {
    const res = await fetch(VIDEO_URL, { signal: ctrl.signal, priority: 'low' })
    if (!res.ok || !res.body) throw new Error('bad response')
    state.total = Number(res.headers.get('Content-Length')) || VIDEO_BYTES
    const reader = res.body.getReader()
    let lastTick = 0
    for (;;) {
      const r = await reader.read()
      if (r.done) break
      arm()
      chunks.push(r.value)
      state.got += r.value.length
      const now = performance.now()
      if (now - lastTick > 80) {
        lastTick = now
        notify()
      }
    }
  } finally {
    clearTimeout(watchdog)
  }
  state.got = state.total
  notify()
  return new Blob(chunks, { type: 'video/mp4' })
}

/**
 * Starts (or joins) the download. `onProgress(frac, got, total)` fires as bytes
 * arrive and once at the end. Returns the Blob promise and an unsubscribe.
 */
export function heroBlob(onProgress) {
  if (onProgress) {
    state.listeners.add(onProgress)
    if (state.got) onProgress(Math.min(1, state.got / state.total), state.got, state.total)
  }
  if (!state.promise) {
    state.got = 0
    state.promise = download().catch((err) => {
      state.promise = null
      state.got = 0
      throw err
    })
  }
  const promise = state.promise
  return {
    promise,
    unsubscribe() {
      if (onProgress) state.listeners.delete(onProgress)
    },
  }
}

/** True once the footage is in memory, so callers can skip their own progress UI. */
export function heroBlobReady() {
  return Boolean(state.promise) && state.got >= state.total && state.total > 0
}
