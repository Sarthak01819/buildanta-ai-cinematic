import { useRef } from 'react'
import BrandMark from '../ui/BrandMark.jsx'
import { usePreloader } from './usePreloader.js'

/**
 * The curtain over the first load. Pre-rendered with the page, so it is on
 * screen before any script runs; usePreloader then fetches every first-screen
 * asset behind it, builds the mark up from the ground as the bytes arrive, and
 * lifts it. Same markup on the server and the client; every moving part is a
 * DOM write from the hook, never React state, until the node is removed.
 */
export default function Preloader() {
  const ref = useRef(null)
  const gone = usePreloader(ref)
  if (gone) return null
  return (
    <div ref={ref} className="preload" id="preload" role="status" aria-live="polite" aria-label="Loading the site">
      <div className="preload-inner">
        <div className="preload-mark" aria-hidden="true">
          <BrandMark className="ghost" />
          <BrandMark className="fill" />
        </div>
        <p className="preload-word" translate="no">
          <b>BUILDANTA</b>
          <span>AI Institute</span>
        </p>
        <div className="preload-bar" aria-hidden="true">
          <i />
        </div>
        <p className="preload-status">
          <span className="preload-label">Loading</span>
          <span className="preload-pct">0%</span>
        </p>
      </div>
    </div>
  )
}
