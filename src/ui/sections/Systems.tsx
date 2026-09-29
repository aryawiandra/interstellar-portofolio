import { chapterById } from '../../content/chapters'
import { projects, systems, toolkit } from '../../content/systems'
import type { Project } from '../../content/types'
import { Frame, rv } from './Frame'

function ProjectCard({ project, index }: { readonly project: Project; readonly index: number }) {
  const code = `OBJ-${String(index + 1).padStart(2, '0')}`
  const name = project.href ? (
    <a href={project.href} target="_blank" rel="noopener noreferrer" className="obj__link">
      {project.name} <span aria-hidden="true">↗</span>
    </a>
  ) : (
    project.name
  )
  return (
    <li className="obj rv" style={rv(3 + index * 0.4)} data-live={Boolean(project.href)}>
      <span className="obj__code">
        {code}
        {project.href && <span className="obj__live">LIVE</span>}
      </span>
      <h3 className="obj__name">{name}</h3>
      <p className="obj__kind">{project.kind}</p>
      <p className="obj__stack">{project.stack}</p>
    </li>
  )
}

export function Systems() {
  return (
    <Frame
      id="systems"
      variant="split"
      eyebrow="Technical projects"
      title={systems.title}
      hud={chapterById('systems').hud}
      aside={
        <ul className="objs" aria-label="Projects">
          {projects.map((p, i) => (
            <ProjectCard key={p.name} project={p} index={i} />
          ))}
        </ul>
      }
    >
      <p className="lead rv" style={rv(2)}>
        {systems.body}
      </p>
      <ul className="chips chips--mono rv" style={rv(3)} aria-label="Toolkit">
        {toolkit.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </Frame>
  )
}
