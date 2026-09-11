/**
 * The two social marks, drawn as inline SVG so they take `currentColor` and
 * need no network request. Both are the platforms' own glyphs in a single
 * colour, which is what Meta's and Instagram's brand rules ask for when the
 * logo sits on a coloured ground: the shape unaltered, no added effects.
 *
 * They carry no accessible name of their own. The link around them does, so a
 * screen reader hears "Instagram" once instead of twice.
 */

export function InstagramIcon({ size = 22, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.3" fill="currentColor" />
    </svg>
  )
}

export function FacebookIcon({ size = 22, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      <path
        fill="currentColor"
        d="M10.2 20.5V13.1H7.5V9.9h2.7V7.6C10.2 5 11.8 3.5 14.4 3.5h2.2v2.8h-1.3c-1.2 0-1.7.5-1.7 1.7v1.9h2.5v3.2h-2.5v7.4z"
      />
    </svg>
  )
}
