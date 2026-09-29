import { chapterById } from '../../content/chapters'
import { transit } from '../../content/profile'
import { Frame, rv } from './Frame'

export function Transit() {
  return (
    <Frame id="transit" eyebrow="Transit · Saturn" title={transit.title} hud={chapterById('transit').hud}>
      <p className="lead rv" style={rv(2)}>
        {transit.body}
      </p>
    </Frame>
  )
}
