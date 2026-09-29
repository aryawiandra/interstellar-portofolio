import { chapterById } from '../../content/chapters'
import { profile } from '../../content/profile'
import { Frame, rv } from './Frame'

export function Hero() {
  return (
    <Frame id="gargantua" titleLevel={1} eyebrow={profile.name} title={profile.headline} hud={chapterById('gargantua').hud}>
      <p className="lead rv" style={rv(2)}>
        {profile.summary}
      </p>
      <ul className="chips rv" style={rv(3)} aria-label="Trajectory">
        {profile.trajectory.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <a href="#origin" className="pill pill--scroll rv" style={rv(4)}>
        Scroll to launch <span aria-hidden="true">↓</span>
      </a>
    </Frame>
  )
}
