import { useEffect, useState } from 'react'
import { useJourney } from '../store/useJourney'

const MIN_VISIBLE_MS = 1400
const MODULES = 12

/** Wireframe of the Endurance: a ring of modules around a hub. */
function EnduranceWireframe() {
  return (
    <svg className="loader__ship" viewBox="-60 -60 120 120" aria-hidden="true">
      <circle r="44" />
      <circle r="6" />
      {Array.from({ length: MODULES }, (_, i) => {
        const a = (i / MODULES) * Math.PI * 2
        const x = Math.cos(a) * 44
        const y = Math.sin(a) * 44
        return (
          <g key={i}>
            <line x1={Math.cos(a) * 6} y1={Math.sin(a) * 6} x2={x} y2={y} />
            <rect x={x - 5} y={y - 3.5} width="10" height="7" transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`} />
          </g>
        )
      })}
    </svg>
  )
}

export function Loader() {
  const loaded = useJourney((s) => s.loaded)
  const progress = useJourney((s) => s.progress)
  const [minElapsed, setMinElapsed] = useState(false)
  const [gone, setGone] = useState(false)
  const done = loaded && minElapsed

  useEffect(() => {
    const id = window.setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!done) return
    const id = window.setTimeout(() => setGone(true), 900)
    return () => window.clearTimeout(id)
  }, [done])

  if (gone) return null

  const shown = done ? 100 : Math.round(progress)
  return (
    <div className="loader" data-done={done} role="status" aria-live="polite">
      <EnduranceWireframe />
      <div className="loader__bar">
        <span style={{ transform: `scaleX(${shown / 100})` }} />
      </div>
      <p className="loader__text">
        Initializing trajectory <span className="loader__pct">{String(shown).padStart(3, '0')}</span>
      </p>
    </div>
  )
}
