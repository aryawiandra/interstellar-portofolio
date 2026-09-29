import { render, screen, within } from '@testing-library/react'
import { chapters } from '../../content/chapters'
import { fleetRows } from '../../content/fleet'
import { missions } from '../../content/missions'
import { profile } from '../../content/profile'
import { useJourney } from '../../store/useJourney'
import { renderChapter } from './renderChapter'

beforeEach(() => {
  useJourney.getState().reset()
  useJourney.getState().setReducedMotion(true)
})

const renderAll = () => render(<main>{chapters.map((c) => <div key={c.id}>{renderChapter(c.id)}</div>)}</main>)

describe('chapter sections', () => {
  it('renders exactly one h1: the hero headline', () => {
    renderAll()
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveTextContent(profile.headline)
  })

  it('gives every other chapter an h2', () => {
    renderAll()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(chapters.length - 1)
  })

  it('renders every mission with its company and period', () => {
    renderAll()
    for (const m of missions) {
      expect(screen.getByRole('heading', { name: m.title })).toBeInTheDocument()
      expect(screen.getAllByText(new RegExp(m.period)).length).toBeGreaterThan(0)
    }
  })

  it('renders the Pertamina figures', () => {
    renderAll()
    expect(screen.getByText('876K')).toBeInTheDocument()
    expect(screen.getByText('96%')).toBeInTheDocument()
  })

  it('renders every leadership post', () => {
    renderAll()
    const table = screen.getByRole('table', { name: /leadership/i })
    expect(within(table).getAllByRole('row')).toHaveLength(fleetRows.length + 1)
  })

  it('links the live projects', () => {
    renderAll()
    expect(screen.getByRole('link', { name: /sitbemui\.com/ })).toHaveAttribute('href', 'https://sitbemui.com')
    expect(screen.getByRole('link', { name: /sptbemui\.com/ })).toHaveAttribute('href', 'https://sptbemui.com')
  })
})

describe('Horizon contact', () => {
  it('links exactly the approved channels', () => {
    renderAll()
    const contact = screen.getByRole('navigation', { name: /contact/i })
    const links = within(contact).getAllByRole('link')
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      'mailto:aryautomo21@gmail.com',
      'https://www.linkedin.com/in/aryawiandra',
      'https://github.com/aryawiandra',
    ])
  })

  it('opens external profiles safely in a new tab', () => {
    renderAll()
    const contact = screen.getByRole('navigation', { name: /contact/i })
    for (const link of within(contact).getAllByRole('link').slice(1)) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })
})

describe('renderChapter', () => {
  it('throws for a mission chapter with no mission data', async () => {
    const { renderMission } = await import('./renderChapter')
    expect(() => renderMission('gargantua')).toThrow(/No mission/)
  })
})
