import { site } from '../../config/site.js'
import ProjectCard from './ProjectCard.jsx'

/**
 * The archive grid. Real cards once src/content/projects.js has entries;
 * until then one reserved slot per seat in the batch, so the layout exists
 * before the work does and Batch 1 goes up the day it ships.
 */
export default function ProjectGrid({ projects = [], className = '' }) {
  const cls = ['projects', className].filter(Boolean).join(' ')
  if (projects.length) {
    return (
      <div className={cls}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    )
  }
  const slots = Array.from({ length: site.batch.seats }, (_, i) => i + 1)
  return (
    <div className={cls}>
      {slots.map((n) => (
        <ProjectCard key={n} n={n} />
      ))}
    </div>
  )
}
