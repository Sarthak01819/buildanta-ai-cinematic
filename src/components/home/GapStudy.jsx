import { useEffect, useState } from 'react'

/**
 * The morphing glyph cloud that sits beside the gap figures.
 *
 * It is `TextPathStudies` from @designcodeio/threeui (MIT), used exactly as the
 * component's own configuration specifies: the `morphing-glyph-cloud` variant in
 * dark mode at neutral scale, opacity and colour. The component renders a
 * sandboxed iframe whose srcDoc is its canonical HTML study, so the artwork,
 * its motion and its pointer interaction all come from the package rather than
 * from anything reimplemented here.
 *
 * Three things decide whether it loads at all, and all three are deliberate.
 *
 * It is decorative, so it never blocks the page: the component and its
 * stylesheet are fetched only after mount, which keeps a 63 KB inlined document
 * out of the pre-rendered HTML and off the first bundle.
 *
 * It animates continuously, so it does not load for a viewer who asked for
 * reduced motion. The animation runs inside an iframe, where the page's own
 * reduced-motion rules cannot reach it, so the only honest way to honour that
 * preference is not to start it.
 *
 * It only has a column to live in on a wide screen, and a canvas loop is a poor
 * trade on a phone battery, so below the split it does not load either. The
 * media query matches the one in home.css that lays the section out.
 */
/* Wide enough for two columns, and driven by a mouse. The pointer half of that
   is not about taste: the study's own document sets `touch-action: none` over
   its whole plate, which this page cannot reach into and cannot override from
   outside. On a touch device a swipe that starts on the study is swallowed and
   the page does not move, which was measured on an iPad Pro in landscape at
   1366px: 0px scrolled over the study against 225px over the text beside it.
   Tablets clear a width gate easily, so the width gate alone was not enough. */
const WIDE = '(min-width: 1000px) and (hover: hover) and (pointer: fine)'
const REDUCED = '(prefers-reduced-motion: reduce)'

export default function GapStudy() {
  const [Study, setStudy] = useState(null)

  useEffect(() => {
    if (!window.matchMedia) return undefined
    const wide = window.matchMedia(WIDE)
    const reduced = window.matchMedia(REDUCED)
    let alive = true

    function load() {
      if (!alive || !wide.matches || reduced.matches) return
      /* The package's own per-component entry, not its index. Both resolve to
         the same TextPathStudies and render identically, but the index is a
         barrel over every component in the library: importing it built a 7.2 MB
         chunk (3.2 MB gzipped) to draw one decorative cloud. This entry is the
         one the package publishes for exactly this, under its "./components/*"
         export, and it costs about 80 KB. */
      Promise.all([
        import('@designcodeio/threeui/components/TextPathStudies'),
        import('@designcodeio/threeui/style.css'),
      ])
        .then(([mod]) => {
          /* The setter form, or React would call the component as an updater. */
          if (alive) setStudy(() => mod.TextPathStudies)
        })
        .catch(() => {
          /* A decorative study that fails to arrive leaves the column empty,
             which is the correct outcome. Nothing else on the page depends on it. */
        })
    }

    load()
    /* Someone who widens a window, or turns motion back on, gets it then. */
    const onChange = () => load()
    wide.addEventListener('change', onChange)
    reduced.addEventListener('change', onChange)
    return () => {
      alive = false
      wide.removeEventListener('change', onChange)
      reduced.removeEventListener('change', onChange)
    }
  }, [])

  if (!Study) return null
  return (
    <div className="shader-frame">
      {/* scale is the component's own magnifier, clamped by it to 1.5. The
          cloud occupies about three fifths of its plate, so at 1.5 it very
          nearly fills the frame, which is what puts it across half the page. */}
      <Study variant="morphing-glyph-cloud" mode="dark" scale={1.5} opacity={1.0} hue={0} saturation={1.0} brightness={1.0} />
    </div>
  )
}
