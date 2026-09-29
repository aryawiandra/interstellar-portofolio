import { chapterById } from '../../content/chapters'
import { origin, profile } from '../../content/profile'
import { SpecTable } from '../SpecTable'
import { Frame, rv } from './Frame'

export function Origin() {
  return (
    <Frame id="origin" eyebrow={`Origin · ${profile.location}`} title={origin.title} hud={chapterById('origin').hud}>
      <p className="lead rv" style={rv(2)}>
        {origin.body}
      </p>
      <div className="rv" style={rv(3)}>
        <SpecTable rows={origin.specs} />
      </div>
    </Frame>
  )
}
