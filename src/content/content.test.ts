import { achievements, certifications } from './signals'
import { chapterById, chapters } from './chapters'
import { fleetStats, fleetRows } from './fleet'
import { missions } from './missions'
import { horizon, origin, profile, transit } from './profile'
import { projects, toolkit } from './systems'

const allContent = JSON.stringify({
  achievements,
  certifications,
  chapters,
  fleetStats,
  fleetRows,
  missions,
  horizon,
  origin,
  profile,
  transit,
  projects,
  toolkit,
})

describe('content: privacy guard', () => {
  it('never publishes a phone number', () => {
    expect(allContent).not.toMatch(/\+62/)
    expect(allContent).not.toMatch(/\b0?8\d{2}[-\s]?\d{3,4}[-\s]?\d{3,4}\b/)
    expect(allContent).not.toMatch(/whatsapp|wa\.me/i)
  })

  it('exposes exactly the approved contact channels', () => {
    expect(Object.keys(profile.contact).sort()).toEqual(['email', 'github', 'linkedin'])
    expect(profile.contact.linkedin).toMatch(/^https:\/\/www\.linkedin\.com\/in\//)
    expect(profile.contact.github).toMatch(/^https:\/\/github\.com\//)
  })
})

describe('content: chapters', () => {
  it('has unique ids', () => {
    const ids = chapters.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('starts at Gargantua and ends at the event horizon', () => {
    expect(chapters[0]?.id).toBe('gargantua')
    expect(chapters.at(-1)?.id).toBe('horizon')
  })

  it('gives every chapter at least a screen and a half of scroll', () => {
    for (const c of chapters) expect(c.heightVh).toBeGreaterThanOrEqual(150)
  })

  it('gives every chapter HUD telemetry in uppercase', () => {
    for (const c of chapters) {
      expect(c.hud.length).toBeGreaterThan(0)
      for (const line of c.hud) expect(line).toBe(line.toUpperCase().replace('MCKINSEY', 'McKINSEY'))
    }
  })

  it('looks chapters up by id and rejects unknown ids', () => {
    expect(chapterById('fleet').label).toBe('FLEET')
    expect(() => chapterById('nope' as never)).toThrow(/Unknown chapter/)
  })
})

describe('content: missions', () => {
  it('maps each mission to an existing chapter', () => {
    const ids = new Set(chapters.map((c) => c.id))
    for (const m of missions) expect(ids.has(m.chapterId)).toBe(true)
  })

  it('numbers missions 01..04 in order', () => {
    expect(missions.map((m) => m.code)).toEqual(['MISSION 01', 'MISSION 02', 'MISSION 03', 'MISSION 04'])
  })

  it('keeps the Pertamina figures from the CV', () => {
    const pertamina = missions.find((m) => m.chapterId === 'mission-pertamina')
    expect(pertamina?.stats.map((s) => s.value)).toEqual(['876K', '44', '96%'])
  })
})

describe('content: HUD counts match the data', () => {
  const hudOf = (id: Parameters<typeof chapterById>[0]) => chapterById(id).hud.join(' ')

  it('fleet', () => {
    expect(hudOf('fleet')).toContain(`CREW  ${fleetRows.length} POSTS`)
  })

  it('systems', () => {
    const live = projects.filter((p) => p.href).length
    expect(hudOf('systems')).toContain(`OBJECTS  ${projects.length} TRACKED`)
    expect(hudOf('systems')).toContain(`LIVE  ${live} / ${projects.length}`)
  })

  it('signals', () => {
    const certCount = certifications.reduce((n, g) => n + g.items.length, 0)
    expect(hudOf('signals')).toContain(`SIGNALS  ${achievements.length} RECEIVED`)
    expect(hudOf('signals')).toContain(`CERTIFICATIONS  ${certCount}`)
  })
})

describe('content: projects', () => {
  it('links only to https sites', () => {
    for (const p of projects) if (p.href) expect(p.href).toMatch(/^https:\/\//)
  })
})
