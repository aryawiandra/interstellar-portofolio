import { useEffect, useMemo, useState } from 'react'
import { typewriterDuration, typewriterFrame } from '../../lib/typewriter'
import { useJourney } from '../../store/useJourney'
import { useChapter } from '../ChapterSection'

const TYPE_OPTIONS = { charMs: 16, lineGapMs: 140 }
const TICK_MS = 32
/** Two spaces separate a telemetry key from its value. */
const KEY_SEPARATOR = '  '

function TelemetryLine({ typed, full, typing }: { typed: string; full: string; typing: boolean }) {
  const split = full.indexOf(KEY_SEPARATOR)
  const keyLength = split === -1 ? 0 : split
  const key = typed.slice(0, keyLength)
  const value = typed.slice(keyLength + KEY_SEPARATOR.length)
  return (
    <li className="telemetry__line" data-typing={typing}>
      {key && <span className="telemetry__key">{key}</span>}
      <span className="telemetry__value">{split === -1 ? typed : value}</span>
    </li>
  )
}

export function Telemetry({ lines }: { readonly lines: readonly string[] }) {
  const { visible } = useChapter()
  const reduced = useJourney((s) => s.reducedMotion)
  const [elapsed, setElapsed] = useState(0)
  const duration = useMemo(() => typewriterDuration(lines, TYPE_OPTIONS), [lines])

  useEffect(() => {
    setElapsed(0)
    if (!visible || reduced) return
    const start = Date.now()
    const id = setInterval(() => {
      const e = Date.now() - start
      setElapsed(e)
      if (e > duration) clearInterval(id)
    }, TICK_MS)
    return () => clearInterval(id)
  }, [visible, reduced, duration])

  const typed = typewriterFrame(lines, elapsed, { ...TYPE_OPTIONS, instant: reduced })
  const typingIndex = typed.findIndex((t, i) => t.length < (lines[i]?.length ?? 0))
  const spoken = lines.map((l) => l.replace(/\s{2,}/g, ' ')).join('. ')

  return (
    <div className="telemetry">
      <p className="sr-only">{spoken}</p>
      <ul className="telemetry__lines" aria-hidden="true">
        {lines.map((full, i) => (
          <TelemetryLine key={full} full={full} typed={typed[i] ?? ''} typing={visible && i === typingIndex} />
        ))}
      </ul>
    </div>
  )
}
