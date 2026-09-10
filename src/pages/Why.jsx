import { PageIntro } from '../components/ui/Section.jsx'
import { ApplyButton } from '../components/ui/Button.jsx'
import WhatsAppButton from '../components/ui/WhatsAppButton.jsx'
import { useReveal } from '../hooks/useReveal.js'
import { site } from '../config/site.js'

/** Spec 4.5. The origin story, at length. */
export default function Why() {
  const ref = useReveal()
  return (
    <>
      <PageIntro
        id="why"
        kicker="Why we exist"
        title="We started this because we could not hire anyone."
        lede={`${site.company} needed people who could work with Claude Code, build AI agents, and produce video with generative tools. Ordinary requirements for the work we do.`}
      />
      <section ref={ref} className="section page-body">
        <div className="container">
          <div className="prose rise">
            <p>We looked in {site.city}. We did not find them.</p>
            <p>
              Not because the people here are not capable — because nobody is teaching this. Every institute in the
              city runs a version of the same full-stack syllabus, and the gap between that syllabus and what the market
              is actually hiring for keeps widening.
            </p>
            <p>So instead of waiting for the talent to appear, we decided to train it.</p>
            <h2>What that means for how we teach</h2>
            <p>
              We are not an education company that added an AI course. We are a company that needed these skills, could
              not buy them, and now teaches them the way we would want a new hire to learn: by shipping something real,
              explaining it out loud every day, and sitting an interview about their own work before they leave.
            </p>
            <p>
              That is why every student ships one project in public. It is the only version of "we taught you
              something" that anyone else can check.
            </p>
          </div>
          <div className="plate rise">
            <img
              src="/assets/hero-threshold.jpg"
              alt="The moment the camera passes through the institute's window, glass scattering into a sunlit hall."
              width="1536"
              height="864"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="btn-row rise">
            <ApplyButton />
            <WhatsAppButton />
          </div>
        </div>
      </section>
    </>
  )
}
