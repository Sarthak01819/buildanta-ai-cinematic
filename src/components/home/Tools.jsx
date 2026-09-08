import Section from '../ui/Section.jsx'
import { tools, TOOLS_STRIP } from '../../content/programme.js'

/** b. What you work with. The strip fixed in spec 4.1, then the four tools as a stacked list, not cards. */
export default function Tools() {
  return (
    <Section id="programme" kicker="What you work with" title="Four tools, used properly, for twenty-eight days." tint>
      <p className="tools-strip rise">{TOOLS_STRIP}</p>
      <div className="tools">
        {tools.map((t) => (
          <div key={t.name} className="tool rise">
            <h3>{t.name}</h3>
            <p>{t.text}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
