const MOTES = [0, 1, 2, 3, 4, 5]

/** One fixed ground behind everything, drifting slowly, so the site reads as one place. */
export default function Environment() {
  return (
    <>
      <div className="env" aria-hidden="true" />
      <div className="dust" aria-hidden="true">
        {MOTES.map((i) => (
          <i key={i} />
        ))}
      </div>
    </>
  )
}
