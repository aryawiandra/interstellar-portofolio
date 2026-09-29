import { chapterById } from '../../content/chapters'
import type { Mission as MissionData } from '../../content/types'
import { useChapter } from '../ChapterSection'
import { DetectionBox, type DetectionSlot } from '../hud/DetectionBox'
import { SpecTable } from '../SpecTable'
import { StatCounter } from '../StatCounter'
import { Frame, rv } from './Frame'

/** Where detection boxes sit on screen: over the planet, which is framed on the right. */
const DETECTION_SLOTS: readonly DetectionSlot[] = [
  { left: 66, top: 22, size: 10 },
  { left: 81, top: 45, size: 7 },
  { left: 71, top: 64, size: 5.5 },
]

export function Mission({ mission }: { readonly mission: MissionData }) {
  const { visible } = useChapter()
  const chapter = chapterById(mission.chapterId)

  const overlay = mission.detections.map((label, i) => (
    <DetectionBox key={label} label={label} slot={DETECTION_SLOTS[i % DETECTION_SLOTS.length]!} index={i} />
  ))

  return (
    <Frame
      id={mission.chapterId}
      eyebrow={`${mission.code} · ${mission.period}`}
      title={mission.title}
      hud={chapter.hud}
      overlay={overlay}
    >
      <p className="meta rv" style={rv(2)}>
        <span className="meta__org">{mission.company}</span>
        <span className="meta__role">{mission.role}</span>
      </p>
      <p className="lead rv" style={rv(3)}>
        {mission.body}
      </p>
      {mission.points.length > 0 && (
        <ul className="points rv" style={rv(4)}>
          {mission.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      {mission.stats.length > 0 && (
        <div className="stats rv" style={rv(4)}>
          {mission.stats.map((s) => (
            <StatCounter key={s.label} value={s.value} label={s.label} active={visible} />
          ))}
        </div>
      )}
      {mission.specs.length > 0 && (
        <div className="rv" style={rv(5)}>
          <SpecTable rows={mission.specs} />
        </div>
      )}
    </Frame>
  )
}
