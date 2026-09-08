import Section from '../ui/Section.jsx'
import { owns } from '../../content/programme.js'
import { useHoldToShip } from './useHoldToShip.js'

const BLOCKS = [0, 1, 2, 3, 4, 5]

/** d. Six things you own, behind the hold. Nothing here arrives without the work. */
export default function Owns() {
  const { holdRef, ownsRef } = useHoldToShip()
  return (
    <Section id="own" kicker="What you leave with" title="Six things you own" tint>
      <div className="hold-wrap rise">
        <button ref={holdRef} className="hold" id="hold" type="button" aria-describedby="hold-note">
          <span>Hold to ship it</span>
          <span className="blocks" aria-hidden="true">
            {BLOCKS.map((i) => (
              <i key={i} />
            ))}
          </span>
        </button>
        <p className="hold-note" id="hold-note">
          Press and hold. Nothing here arrives without the work.
        </p>
      </div>
      <div ref={ownsRef} className="owns" id="owns">
        {owns.map((o) => (
          <div key={o.n} className="own">
            <p className="n">{o.n}</p>
            <h3>{o.name}</h3>
            <p>{o.text}</p>
          </div>
        ))}
      </div>
      <p className="body rise" style={{ marginTop: '2rem' }}>
        Every one of these is something you can send to a stranger. That is the point.
      </p>
    </Section>
  )
}
