import type { Achievement, CertificationGroup } from './types'

export const signals = {
  title: 'Signals received.',
  body: 'Competitions, hackathons and the certifications I picked up along the way.',
} as const

export const achievements: readonly Achievement[] = [
  { rank: 'Top 5', event: '180DC UGM Bootcamp' },
  { rank: 'Top 10', event: 'UI AI for Accessibility Hackathon (Microsoft)' },
  { rank: 'Semifinalist', event: 'Economic BCC (UNNES)' },
  { rank: 'Semifinalist', event: 'DWDG IPB BCC' },
  { rank: 'Semifinalist', event: 'Bizionary BCC (Unpad)' },
  { rank: 'Semifinalist', event: 'Young Entrepreneur Days (BEM FMIPA UI)' },
  { rank: 'Semifinalist', event: 'Samsung Solve for Tomorrow' },
]

export const certifications: readonly CertificationGroup[] = [
  { issuer: 'Coursera', items: ['UVA Business Strategy', 'Google Data Analytics', 'IBM IT Project Manager'] },
  { issuer: 'Dicoding', items: ['Python', 'SQL', 'Web Dev', 'Front-End', 'AI Fundamentals'] },
  { issuer: 'CCNA', items: ['Networks', 'Ethical Hacker'] },
  { issuer: 'Other', items: ['Sailor Academy: Strategic PM', 'OMDCCP'] },
]
