import type { Chapter } from './types'

export const chapters: readonly Chapter[] = [
  {
    id: 'gargantua',
    label: 'GARGANTUA',
    heightVh: 170,
    hud: [
      'TARGET  GARGANTUA',
      'ORIGIN  DEPOK, ID  [6.36°S / 106.82°E]',
      'VESSEL  ENDURANCE  [NOMINAL]',
      'ETA  AUG 2027',
    ],
  },
  {
    id: 'origin',
    label: 'ORIGIN',
    heightVh: 190,
    hud: [
      'INSTITUTION  UNIVERSITAS INDONESIA',
      'PROGRAM  COMPUTER ENGINEERING',
      'GPA  3.58 / 4.00',
      'DEPARTURE  AUG 2023',
    ],
  },
  {
    id: 'transit',
    label: 'TRANSIT',
    heightVh: 210,
    hud: ['SATURN  FLYBY', 'WORMHOLE  DETECTED', 'DESTINATION  GARGANTUA SYSTEM', 'TIME DILATION  ACCEPTABLE'],
  },
  {
    id: 'mission-adaro',
    label: 'MISSION 01',
    heightVh: 200,
    hud: ['SECTOR  MINING & ENERGY', 'SCOPE  MULTI-BILLION IDR', 'ROLE  BUSINESS ANALYST', 'STATUS  IN PROGRESS'],
  },
  {
    id: 'mission-pertamina',
    label: 'MISSION 02',
    heightVh: 220,
    hud: ['SECTOR  ENERGY', 'DATASET  876K ROWS', 'MODEL  ISOLATION FOREST', 'RECALL  96%  [PRE-FAILURE]'],
  },
  {
    id: 'mission-mckinsey',
    label: 'MISSION 03',
    heightVh: 200,
    hud: ['PROGRAM  McKINSEY FORWARD', 'WINDOW  MAR – JUL 2026', 'LIVE CASE  TRAFFIC SYSTEMS'],
  },
  {
    id: 'mission-eth',
    label: 'MISSION 04',
    heightVh: 200,
    hud: ['LAB  ETH ZÜRICH', 'DOMAIN  COMPUTER VISION', 'THROUGHPUT  50+ VIDEOS / WEEK'],
  },
  {
    id: 'fleet',
    label: 'FLEET',
    heightVh: 260,
    hud: ['CREW  9 POSTS', 'REACH  370K+', 'MODULES  12 / 12 ONLINE'],
  },
  {
    id: 'systems',
    label: 'SYSTEMS',
    heightVh: 220,
    hud: ['SCAN MODE  ACTIVE', 'OBJECTS  6 TRACKED', 'LIVE  2 / 6'],
  },
  {
    id: 'signals',
    label: 'SIGNALS',
    heightVh: 210,
    hud: ['SIGNALS  7 RECEIVED', 'CERTIFICATIONS  12', 'NOISE  LOW'],
  },
  {
    id: 'horizon',
    label: 'EVENT HORIZON',
    heightVh: 230,
    hud: ['DISTANCE  1.5 RS', 'TIDAL FORCES  RISING', 'CHANNEL  OPEN'],
  },
]

export function chapterById(id: Chapter['id']): Chapter {
  const found = chapters.find((c) => c.id === id)
  if (!found) throw new Error(`Unknown chapter: ${id}`)
  return found
}
