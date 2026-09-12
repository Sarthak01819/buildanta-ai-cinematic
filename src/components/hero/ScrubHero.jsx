import { useRef } from 'react'
import { ApplyButton } from '../ui/Button.jsx'
import WhatsAppButton from '../ui/WhatsAppButton.jsx'
import splitWords, { seedFor } from './splitWords.jsx'
import { useScrubHero } from './useScrubHero.js'

const HEADING =
  'We tried to hire people who knew these tools. In all of Kanpur, we found nobody. So we built the room where they get made.'

/**
 * The scroll-scrubbed video hero. Desktop and laptop only: the five gates in
 * motion.css hide it everywhere else and show the static hero instead.
 *
 * The markup is static and deterministic. Every moving part (band opacity,
 * `--k`, the chapter chip, the ring, the video seeks) is written to the DOM
 * by useScrubHero through the refs below, never through React state.
 */
export default function ScrubHero() {
  const hero = useRef(null)
  const stage = useRef(null)
  const video = useRef(null)
  const poster = useRef(null)
  const bands = useRef(null)
  const chip = useRef(null)
  const loader = useRef(null)
  const ring = useRef(null)
  useScrubHero({ hero, stage, video, poster, bands, chip, loader, ring })

  return (
    <section ref={hero} className="hero" data-hero aria-labelledby="hero-heading">
      <h1 id="hero-heading" className="vh">
        {HEADING}
      </h1>
      <div ref={stage} className="stage" id="stage">
        <div className="stage-media" aria-hidden="true" inert>
          <div ref={poster} className="poster" id="poster" />
          <video ref={video} id="hero-video" preload="none" muted playsInline aria-hidden="true" tabIndex={-1} />
        </div>
        <div className="scrim" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />

        <div ref={bands} className="bands" id="bands">
          <div className="band b1" data-a="0" data-b="0.16" aria-hidden="true">
            <div className="band-inner">
              <p className="h" data-split="word">
                {splitWords('We tried to hire people who knew these tools.', seedFor(0))}
              </p>
            </div>
          </div>
          <div className="band b2" data-a="0.19" data-b="0.31" aria-hidden="true">
            <div className="band-inner">
              <p className="h" data-split="word" data-em="nobody.">
                {splitWords('In all of Kanpur, we found nobody.', seedFor(1), 'nobody.')}
              </p>
            </div>
          </div>
          <div className="band b3" data-a="0.36" data-b="0.56" data-ramp="0.036" aria-hidden="true">
            <div className="band-inner">
              <p className="h">So we built the room where they get made.</p>
            </div>
          </div>
          {/* The last band waits until the camera has eased back from the full-frame logo to the desk. */}
          <div className="band b4 is-live" data-a="0.84" data-b="1" aria-hidden="true">
            <div className="band-inner">
              <p className="h" data-split="word">
                {splitWords('Twenty-eight days. Work you can show.', seedFor(3))}
              </p>
              <p className="lede">
                Three guided projects. Then your own idea, shipped.
              </p>
              <div className="btn-row">
                <ApplyButton />
                <WhatsAppButton />
              </div>
            </div>
          </div>
        </div>

        <div className="hud" aria-hidden="true">
          <span ref={chip} className="chip" id="chapter">
            Outside
          </span>
        </div>
        <div ref={loader} className="loader" id="loader" aria-hidden="true">
          <svg className="ring" viewBox="0 0 48 48">
            <circle
              ref={ring}
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="126"
              style={{ strokeDashoffset: 'var(--ld,126)' }}
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
