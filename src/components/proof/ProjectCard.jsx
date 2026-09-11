import { site } from '../../config/site.js'

const LINKS = [
  ['liveUrl', 'Live URL'],
  ['repoUrl', 'Repository'],
]

/**
 * One entry in the Proof archive. With a `project` it shows the real thing,
 * and every link opens something a stranger can check. Without one it is a
 * reserved slot (`n`) that shows the shape of what Batch 1 will fill.
 */
export default function ProjectCard({ project, n }) {
  if (!project) {
    return (
      <article className="project slot">
        <div className="shot">
          <span className="label">Reserved for Batch {site.batch.number}</span>
        </div>
        <div className="project-body">
          <h3>Project {n}</h3>
          <p className="line">
            Screenshot, project name, live URL, repository and one line from the student.
          </p>
          <p className="project-links">
            {LINKS.map(([key, label]) => (
              <span key={key}>{label}</span>
            ))}
          </p>
        </div>
      </article>
    )
  }
  return (
    <article className="project">
      <div className="shot">
        {project.screenshot ? (
          <img src={project.screenshot} alt={`Screenshot of ${project.name}.`} loading="lazy" decoding="async" />
        ) : (
          <span className="label">Screenshot to follow</span>
        )}
      </div>
      <div className="project-body">
        <p className="n">Batch {project.batch}</p>
        <h3>{project.name}</h3>
        <p className="line">
          "{project.line}" — {project.student}
        </p>
        <p className="project-links">
          {LINKS.map(([key, label]) => (
            <a key={key} href={project[key]} target="_blank" rel="noopener">
              {label}
            </a>
          ))}
        </p>
      </div>
    </article>
  )
}
