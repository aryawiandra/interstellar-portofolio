import { chapterById } from '../../content/chapters'
import { horizon, profile } from '../../content/profile'
import { Frame, rv } from './Frame'

const external = { target: '_blank', rel: 'noopener noreferrer' } as const

export function Horizon() {
  const { email, linkedin, github } = profile.contact
  return (
    <Frame id="horizon" eyebrow="Event horizon · Contact" title={horizon.title} hud={chapterById('horizon').hud}>
      <p className="lead rv" style={rv(2)}>
        {horizon.body}
      </p>
      <nav className="contact rv" style={rv(3)} aria-label="Contact">
        <a className="pill pill--solid" href={`mailto:${email}`}>
          {email}
        </a>
        <a className="pill" href={linkedin} {...external}>
          LinkedIn <span aria-hidden="true">↗</span>
        </a>
        <a className="pill" href={github} {...external}>
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </nav>
      <footer className="footer rv" style={rv(4)}>
        <span>© 2026 {profile.name}</span>
        <span>{horizon.credit}</span>
      </footer>
    </Frame>
  )
}
