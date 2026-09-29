export const profile = {
  name: 'Muhammad Arya Wiandra Utomo',
  shortName: 'Arya Utomo',
  headline: 'Engineering clarity from complex systems.',
  summary:
    'Computer engineer turned business analyst. I work where operations, data and people meet, and make the system make sense.',
  trajectory: ['Adaro', 'Pertamina', 'McKinsey Forward', 'ETH Zürich'],
  location: 'Depok, Indonesia',
  coordinates: '6.36°S / 106.82°E',
  education: {
    school: 'Universitas Indonesia',
    degree: 'S.T., Computer Engineering',
    gpa: '3.58 / 4.00',
    period: 'Aug 2023 – Aug 2027 (expected)',
  },
  contact: {
    email: 'aryautomo21@gmail.com',
    linkedin: 'https://www.linkedin.com/in/aryawiandra',
    github: 'https://github.com/aryawiandra',
  },
} as const

export const origin = {
  title: 'Launched from Universitas Indonesia.',
  body: 'Bachelor of Engineering in Computer Engineering. Pipelines, caches and circuits at the bottom of the stack; stakeholders, strategy and budgets at the top. I like working across both.',
  specs: [
    { key: 'Program', value: 'S.T., Computer Engineering' },
    { key: 'GPA', value: '3.58 / 4.00' },
    { key: 'Timeline', value: 'Aug 2023 – Aug 2027 (expected)' },
  ],
} as const

export const transit = {
  title: 'Four missions. One trajectory.',
  body: 'Mining, energy, consulting, research. Four very different orbits, and one question underneath all of them: how do you make a complex system make sense?',
} as const

export const horizon = {
  title: 'Ready to cross the event horizon?',
  body: 'If you are building something complex and want it to make sense, send a signal.',
  credit: 'Earth imagery: NASA Visible Earth (Blue Marble, Black Marble).',
} as const
