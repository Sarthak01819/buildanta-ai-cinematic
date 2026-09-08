/**
 * Splits a headline into word spans for the scrub bands.
 *
 * Pure: the same text and seed give the same output on the server and in the
 * browser, so the pre-rendered HTML hydrates without a mismatch. It returns a
 * visually hidden copy of the full text for assistive tech, then an
 * aria-hidden run of `.w` spans, each carrying its own threshold `--th` so the
 * words arrive one after another as the band's `--k` climbs. Whitespace is
 * kept as plain text between the spans, exactly as the original splitter did.
 */

/* Seeded randomness (an LCG), so the split is identical on every load. */
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** The seed for the nth band (0-based, counting every band), as on the original page. */
export function seedFor(bandIndex) {
  return 9301 + bandIndex * 7919
}

export default function splitWords(text, seed, em) {
  const words = text.split(/(\s+)/)
  const rand = rng(seed)
  let total = 0
  for (const w of words) if (w.trim()) total += 1
  let real = 0
  const visual = words.map((w, i) => {
    if (!w.trim()) return w
    const th = ((real / Math.max(1, total - 1)) * 0.5 + rand() * 0.06).toFixed(3)
    real += 1
    return (
      <span key={i} className={em && w === em ? 'w em' : 'w'} style={{ '--th': th }}>
        {w}
      </span>
    )
  })
  return (
    <>
      <span className="vh">{text}</span>
      <span aria-hidden="true">{visual}</span>
    </>
  )
}
