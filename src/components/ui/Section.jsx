import { useReveal } from '../../hooks/useReveal.js'
import BlockRule from './BlockRule.jsx'

/**
 * A standard page section: kicker, heading, block rule, then whatever the
 * section holds. Entrances play once when it scrolls into view.
 *
 * Pass `title={null}` and build the heading yourself for irregular layouts.
 */
export default function Section({
  id,
  kicker,
  title,
  tint = false,
  className = '',
  headingClassName = '',
  children,
}) {
  const ref = useReveal()
  const headingId = `${id}-heading`
  const cls = ['section', tint ? 'tint' : '', className].filter(Boolean).join(' ')
  return (
    <section ref={ref} id={id} className={cls} aria-labelledby={title ? headingId : undefined}>
      <div className="container">
        {kicker ? <p className="kicker rise">{kicker}</p> : null}
        {title ? (
          <h2 id={headingId} className={`rise ${headingClassName}`.trim()}>
            {title}
          </h2>
        ) : null}
        {title ? <BlockRule /> : null}
        {children}
      </div>
    </section>
  )
}

/** The intro block of every inner page: h1, lede, rule. */
export function PageIntro({ id = 'intro', kicker, title, lede, children }) {
  const ref = useReveal()
  return (
    <section ref={ref} id={id} className="section page-intro" aria-labelledby={`${id}-heading`}>
      <div className="container">
        {kicker ? <p className="kicker rise">{kicker}</p> : null}
        <h1 id={`${id}-heading`} className="rise">
          {title}
        </h1>
        {lede ? <p className="lede rise">{lede}</p> : null}
        {children}
        <BlockRule />
      </div>
    </section>
  )
}
