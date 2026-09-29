import { chapterById } from '../../content/chapters'
import { achievements, certifications, signals } from '../../content/signals'
import { Frame, rv } from './Frame'

function Certifications() {
  return (
    <div className="certs rv" style={rv(4)}>
      <h3 className="certs__title">Certifications</h3>
      <dl className="spec">
        {certifications.map((g) => (
          <div className="spec__row" key={g.issuer}>
            <dt>{g.issuer}</dt>
            <dd>{g.items.join(' · ')}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function Signals() {
  return (
    <Frame
      id="signals"
      variant="split"
      eyebrow="Achievements & certifications"
      title={signals.title}
      hud={chapterById('signals').hud}
      aside={<Certifications />}
    >
      <p className="lead rv" style={rv(2)}>
        {signals.body}
      </p>
      <ol className="signals rv" style={rv(3)}>
        {achievements.map((a) => (
          <li key={a.event} className="signals__item">
            <span className="signals__rank">{a.rank}</span>
            <span className="signals__event">{a.event}</span>
          </li>
        ))}
      </ol>
    </Frame>
  )
}
