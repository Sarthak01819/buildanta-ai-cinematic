import { POSTER_URL, VIDEO_URL, VIDEO_BYTES, scrubGated } from '../hero/heroMedia.js'

/**
 * Everything the first screen needs, with byte weights so the count on the
 * curtain is honest: the footage is most of it, the type and the stills are
 * the rest. The mark is what the header paints; the stills are the hero
 * poster and the content previews further down the site.
 */
export const MANIFEST = [
  { kind: 'font', spec: '800 1em "BoldPixels"', bytes: 4040, label: 'Type' },
  { kind: 'font', spec: '400 1em "Archivo"', bytes: 34928, label: 'Type' },
  { kind: 'font', spec: '400 1em "JetBrains Mono"', bytes: 40404, label: 'Type' },
  { kind: 'font', spec: '400 1em "Pixelify"', bytes: 12016, label: 'Type' },
  { kind: 'image', url: '/brand/buildanta-mark.svg', bytes: 7761, label: 'Stills' },
  { kind: 'image', url: POSTER_URL, bytes: 237994, label: 'Stills' },
  { kind: 'image', url: '/assets/hero-threshold.jpg', bytes: 66874, label: 'Stills' },
  { kind: 'image', url: '/assets/certificate-preview.webp', bytes: 85684, label: 'Stills' },
  { kind: 'video', url: VIDEO_URL, bytes: VIDEO_BYTES, label: 'Flythrough' },
]

/** The footage only where the scrub hero will actually play; phones get the static hero. */
export function videoWanted() {
  return !scrubGated()
}
