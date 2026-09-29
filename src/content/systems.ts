import type { Project } from './types'

export const systems = {
  title: "Things I've built.",
  body: 'Hardware, games and web platforms. Two of them are live.',
} as const

export const projects: readonly Project[] = [
  { name: 'WattWatch', kind: 'Electricity-consumption tracker', stack: 'C' },
  { name: 'SmartGate', kind: 'Sensor-based smart parking', stack: 'Sensors · embedded' },
  { name: 'El Diver', kind: '2D role-playing game', stack: 'Unity' },
  { name: 'UIvent', kind: 'Event-aggregation platform', stack: 'React · Express' },
  { name: 'sitbemui.com', kind: 'Internal operations system, BEM UI', stack: 'Web', href: 'https://sitbemui.com' },
  { name: 'sptbemui.com', kind: "UI's first open-recruitment platform", stack: 'Web', href: 'https://sptbemui.com' },
]

export const toolkit: readonly string[] = [
  'Python',
  'SQL',
  'C',
  'React',
  'Express',
  'Unity',
  'Streamlit',
  'Isolation Forest',
  'Qiskit',
  'BRD / PRD',
  'UX flows',
  'Functional QA',
]
