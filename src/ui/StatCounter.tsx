import { useEffect, useMemo, useState } from 'react'
import { easeOutCubic } from '../lib/easing'
import { formatStat, parseStat } from '../lib/format'
import { useJourney } from '../store/useJourney'

const COUNT_MS = 1400
const TICK_MS = 32

interface StatCounterProps {
  readonly value: string
  readonly label: string
  /** Counting starts when this becomes true. */
  readonly active: boolean
}

export function StatCounter({ value, label, active }: StatCounterProps) {
  const reduced = useJourney((s) => s.reducedMotion)
  const parsed = useMemo(() => parseStat(value), [value])
  const [progress, setProgress] = useState(reduced ? 1 : 0)

  useEffect(() => {
    if (reduced) {
      setProgress(1)
      return
    }
    if (!active) return
    const start = Date.now()
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / COUNT_MS)
      setProgress(t)
      if (t >= 1) clearInterval(id)
    }, TICK_MS)
    return () => clearInterval(id)
  }, [active, reduced])

  const shown = progress >= 1 ? value : formatStat(parsed, parsed.value * easeOutCubic(progress))

  return (
    <div className="stat">
      <span className="stat__value" aria-hidden="true">
        {shown}
      </span>
      <span className="stat__label" aria-hidden="true">
        {label}
      </span>
      <span className="sr-only">{`${value} ${label}`}</span>
    </div>
  )
}
