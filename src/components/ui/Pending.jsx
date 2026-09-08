/**
 * The honest state for a value only the owner can supply. Renders the real
 * thing when it exists, and a clearly marked "to be added" otherwise, so a
 * missing phone number is visible in review instead of silently blank.
 *
 * Usage: <Pending value={site.phone} label="Phone">{(v) => <a href=...>{v}</a>}</Pending>
 */
export default function Pending({ value, label, children }) {
  if (value) return typeof children === 'function' ? children(value) : children
  return (
    <span className="pending" title={`${label} has not been added yet. Fill it in src/config/site.js.`}>
      {label}: to be added
    </span>
  )
}
