import { chapters } from '../content/chapters'
import { useJourney } from '../store/useJourney'

function dashState(i: number, current: number): 'past' | 'current' | 'future' {
  if (i < current) return 'past'
  return i === current ? 'current' : 'future'
}

export function ChapterIndicator() {
  const index = useJourney((s) => s.chapterIndex)
  const label = chapters[index]?.label ?? ''

  return (
    <div className="indicator">
      <ol className="indicator__dashes" aria-hidden="true">
        {chapters.map((c, i) => (
          <li key={c.id} data-dash data-state={dashState(i, index)} />
        ))}
      </ol>
      <span className="indicator__label" aria-live="polite">
        {label}
      </span>
    </div>
  )
}
