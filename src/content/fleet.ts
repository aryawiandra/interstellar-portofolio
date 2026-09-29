import type { FleetRow, Stat } from './types'

export const fleet = {
  title: 'Leading the crew.',
  body: 'Labs, classrooms, marketplaces and a student government with a 370K+ following. Most of what I know about people, I learned building things with them.',
} as const

export const fleetRows: readonly FleetRow[] = [
  {
    org: 'Quantum Computing Lab, FTUI',
    role: 'Co-Founder',
    period: 'Mar 2026 – Present',
    detail: 'Building undergraduate lab modules on IBM Quantum and Qiskit: circuits, entanglement, quantum algorithms.',
  },
  {
    org: 'Modern Computer Architecture',
    role: 'Teaching Assistant',
    period: 'Aug 2026 – Present',
    detail: 'Pipelining, memory hierarchy and cache design. Lab sessions, tutorials and grading.',
  },
  {
    org: 'Fundamentals of Data Analytics',
    role: 'Teaching Assistant',
    period: 'Sep 2026 – Present',
    detail: 'Data-analysis fundamentals and statistical methods. Labs, grading and office hours.',
  },
  {
    org: 'BEM UI',
    role: 'Head of Multimedia',
    period: 'Jun – Dec 2025',
    detail:
      "Led digital strategy for a 370K+ follower organization. Shipped sitbemui.com, sptbemui.com (the university's first open-recruitment platform) and its first public company-profile site.",
  },
  {
    org: 'ROOPA Market · HIPMI PT UI',
    role: 'Co-Founder & Vice Project Officer',
    period: 'Dec 2025 – Present',
    detail: 'A curated marketplace of 22 tenants from 60+ Indonesian business owners, taken from campus events to M Bloc Space.',
  },
  {
    org: 'NEST UI',
    role: 'Director of Event',
    period: 'Aug – Dec 2025',
    detail: 'Directed the flagship seminar for 200+ attendees and managed 8 mentors supporting competition finalists.',
  },
  {
    org: 'BK MWA UI UM',
    role: 'Pengurus Inti · External Affairs',
    period: 'Apr 2026 – Present',
    detail: 'Runs every information and communication channel for BK MWA UI UM 2026.',
  },
  {
    org: 'PILAR IKM UI 2026',
    role: 'Creative Coordinator',
    period: 'Jun – Sep 2026',
    detail: 'Produced the teaser, welcoming video, after-movie and design collateral.',
  },
  {
    org: 'BEM UI',
    role: 'Staff, Public Relations',
    period: 'Mar – Dec 2024',
    detail: 'Connected 50+ student organizations across 14 faculties and contributed to 500+ published pieces.',
  },
]

export const fleetStats: readonly Stat[] = [
  { value: '370K+', label: 'followers reached at BEM UI' },
  { value: '22', label: 'ROOPA Market tenants' },
  { value: '200+', label: 'NEST UI attendees' },
  { value: '500+', label: 'published pieces' },
]
