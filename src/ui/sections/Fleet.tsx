import { chapterById } from '../../content/chapters'
import { fleet, fleetRows, fleetStats } from '../../content/fleet'
import { useChapter } from '../ChapterSection'
import { StatCounter } from '../StatCounter'
import { Frame, rv } from './Frame'

function CrewTable() {
  return (
    <table className="crew">
      <caption className="sr-only">Leadership and organizations</caption>
      <thead>
        <tr>
          <th scope="col">Post</th>
          <th scope="col">Role</th>
          <th scope="col">Period</th>
        </tr>
      </thead>
      <tbody>
        {fleetRows.map((r, i) => (
          <tr key={`${r.org}-${r.role}`} className="rv" style={rv(3 + i * 0.35)}>
            <th scope="row">
              <span className="crew__org">{r.org}</span>
              <span className="crew__detail">{r.detail}</span>
            </th>
            <td>{r.role}</td>
            <td className="crew__period">{r.period}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function Fleet() {
  const { visible } = useChapter()
  return (
    <Frame
      id="fleet"
      variant="split"
      eyebrow="Leadership & organizations"
      title={fleet.title}
      hud={chapterById('fleet').hud}
      aside={<CrewTable />}
    >
      <p className="lead rv" style={rv(2)}>
        {fleet.body}
      </p>
      <div className="stats stats--grid rv" style={rv(3)}>
        {fleetStats.map((s) => (
          <StatCounter key={s.label} value={s.value} label={s.label} active={visible} />
        ))}
      </div>
    </Frame>
  )
}
