import Section from '../ui/Section.jsx'
import GapStudy from './GapStudy.jsx'
import { stats, STATS_DISCLAIMER } from '../../content/stats.js'

/**
 * a. The gap. The four cleared statistics, each with its source on the page.
 *
 * On a wide screen the facts hold the left half and the glyph study the right.
 * The study is decorative and marked so: it carries no information the figures
 * do not already state, so a screen reader is not asked to sit through it.
 */
export default function GapStats() {
  return (
    <Section id="gap" kicker="The gap" title="What is taught here and what is hired for have come apart.">
      <div className="gap-split">
        <div className="gap-facts">
          <div className="stats four">
            {stats.map((s) => (
              <div key={s.id} className="stat rise">
                <span className="figure">{s.figure}</span>
                <p>{s.text}</p>
                <p className="source">
                  Source:{' '}
                  <a href={s.href} rel="noopener nofollow">
                    {s.source}
                  </a>
                </p>
              </div>
            ))}
          </div>
          <p className="source stats-note rise">{STATS_DISCLAIMER}</p>
          <p className="body rise" style={{ marginTop: '2.5rem' }}>
            Those four facts describe one problem.
          </p>
        </div>
        <div className="gap-study rise" aria-hidden="true">
          <GapStudy />
        </div>
      </div>
    </Section>
  )
}
