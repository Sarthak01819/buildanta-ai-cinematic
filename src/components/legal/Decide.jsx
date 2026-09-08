/**
 * A commercial decision only the owner can make: the [DECIDE: …] marks in
 * spec 4.7–4.9. Shows the draft text or options exactly as written and never
 * picks one, so the unresolved state is visible in review instead of hidden.
 *
 * Usage: <Decide><p>…</p></Decide> or <Decide><ul><li>…</li></ul></Decide>
 */
export default function Decide({ children }) {
  return (
    <div className="decide">
      <span className="label">To be decided before launch</span>
      {children}
    </div>
  )
}
