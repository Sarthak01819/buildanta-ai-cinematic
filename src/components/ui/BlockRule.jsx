const CUBES = [0, 1, 2, 3, 4, 5, 6, 7]

/** The signature rule: eight cubes that assemble left to right when a section enters. */
export default function BlockRule({ className = '' }) {
  return (
    <div className={`blockrule ${className}`.trim()} aria-hidden="true">
      {CUBES.map((i) => (
        <i key={i} style={{ '--d': `${i * 55}ms` }} />
      ))}
    </div>
  )
}
