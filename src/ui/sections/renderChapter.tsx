import type { ReactNode } from 'react'
import { missions } from '../../content/missions'
import type { ChapterId } from '../../content/types'
import { Fleet } from './Fleet'
import { Hero } from './Hero'
import { Horizon } from './Horizon'
import { Mission } from './Mission'
import { Origin } from './Origin'
import { Signals } from './Signals'
import { Systems } from './Systems'
import { Transit } from './Transit'
import './sections.css'

export function renderMission(id: ChapterId): ReactNode {
  const mission = missions.find((m) => m.chapterId === id)
  if (!mission) throw new Error(`No mission for chapter ${id}`)
  return <Mission mission={mission} />
}

export function renderChapter(id: ChapterId): ReactNode {
  switch (id) {
    case 'gargantua':
      return <Hero />
    case 'origin':
      return <Origin />
    case 'transit':
      return <Transit />
    case 'mission-adaro':
    case 'mission-pertamina':
    case 'mission-mckinsey':
    case 'mission-eth':
      return renderMission(id)
    case 'fleet':
      return <Fleet />
    case 'systems':
      return <Systems />
    case 'signals':
      return <Signals />
    case 'horizon':
      return <Horizon />
  }
}
