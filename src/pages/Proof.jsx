import { PageIntro } from '../components/ui/Section.jsx'
import { ApplyButton, LinkButton } from '../components/ui/Button.jsx'
import ProjectGrid from '../components/proof/ProjectGrid.jsx'
import { useReveal } from '../hooks/useReveal.js'
import { site } from '../config/site.js'
import { projects } from '../content/projects.js'

/**
 * Spec 4.4. The empty state is deliberate and the page says so. The two lines
 * that are only true while the archive is empty go away once it is not.
 */
export default function Proof() {
  const ref = useReveal()
  const empty = projects.length === 0
  const batch = `Batch ${site.batch.number}`
  return (
    <>
      <PageIntro
        id="proof"
        kicker="Proof"
        title="Student work"
        lede={empty ? <strong>Nothing here yet — {batch} has not started.</strong> : null}
      />
      <section ref={ref} className="section page-body">
        <div className="container">
          <div className="prose rise">
            <p>
              When it finishes, every student's work is published on this page: the live URL, the public repository,
              and their demo video. Not a description of it. The actual thing, that you can open and check.
            </p>
            <p>
              That is what "we ship in public" means — if we say a student built something, you should be able to
              click it.
            </p>
          </div>
          <ProjectGrid projects={projects} className="rise" />
          <div className="prose rise">
            {empty ? <p>Come back after {batch}.</p> : null}
            <div className="btn-row">
              <LinkButton to="/#programme" variant="ghost">
                The programme
              </LinkButton>
              <ApplyButton />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
