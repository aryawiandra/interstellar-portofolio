import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { chapters } from '../content/chapters'
import { journey, useJourney } from '../store/useJourney'
import { ChapterIndicator } from './ChapterIndicator'
import { ChapterSection } from './ChapterSection'
import { MenuOverlay } from './MenuOverlay'
import { Nav } from './Nav'
import { SceneBoundary } from './SceneBoundary'
import { SpecTable } from './SpecTable'
import { StatCounter } from './StatCounter'
import { Veil } from './Veil'

beforeEach(() => useJourney.getState().reset())

describe('ChapterIndicator', () => {
  it('shows the label of the current chapter', () => {
    render(<ChapterIndicator />)
    expect(screen.getByText('GARGANTUA')).toBeInTheDocument()
  })

  it('follows the store as the chapter changes', () => {
    render(<ChapterIndicator />)
    act(() => useJourney.getState().setChapter(3))
    expect(screen.getByText('MISSION 01')).toBeInTheDocument()
  })

  it('renders one progress dash per chapter', () => {
    const { container } = render(<ChapterIndicator />)
    expect(container.querySelectorAll('[data-dash]')).toHaveLength(chapters.length)
  })
})

describe('MenuOverlay', () => {
  it('renders nothing when closed', () => {
    render(<MenuOverlay open={false} onClose={vi.fn()} onNavigate={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('lists every chapter as a jump link', () => {
    render(<MenuOverlay open onClose={vi.fn()} onNavigate={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    for (const c of chapters) expect(dialog).toHaveTextContent(c.label)
  })

  it('navigates to the chosen chapter', async () => {
    const onNavigate = vi.fn()
    render(<MenuOverlay open onClose={vi.fn()} onNavigate={onNavigate} />)
    await userEvent.click(screen.getByRole('link', { name: /FLEET/ }))
    expect(onNavigate).toHaveBeenCalledWith('fleet')
  })

  it('closes on Escape', async () => {
    const onClose = vi.fn()
    render(<MenuOverlay open onClose={onClose} onNavigate={vi.fn()} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('moves focus into the dialog and traps Tab inside it', async () => {
    render(<MenuOverlay open onClose={vi.fn()} onNavigate={vi.fn()} />)
    const close = screen.getByRole('button', { name: /close menu/i })
    expect(close).toHaveFocus()
    const links = screen.getAllByRole('link')
    links.at(-1)!.focus()
    await userEvent.tab()
    expect(close).toHaveFocus()
    await userEvent.tab({ shift: true })
    expect(links.at(-1)).toHaveFocus()
  })
})

describe('Nav', () => {
  it('jumps to the contact chapter', async () => {
    const onNavigate = vi.fn()
    render(<Nav onNavigate={onNavigate} />)
    await userEvent.click(screen.getByRole('button', { name: 'Contact' }))
    expect(onNavigate).toHaveBeenCalledWith('horizon')
  })

  it('opens and closes the menu', async () => {
    render(<Nav onNavigate={vi.fn()} />)
    const toggle = screen.getByRole('button', { name: /open menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(toggle)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /close menu/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the menu after choosing a chapter', async () => {
    const onNavigate = vi.fn()
    render(<Nav onNavigate={onNavigate} />)
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }))
    await userEvent.click(screen.getByRole('link', { name: /SIGNALS/ }))
    expect(onNavigate).toHaveBeenCalledWith('signals')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('takes the wordmark back to the start', async () => {
    const onNavigate = vi.fn()
    render(<Nav onNavigate={onNavigate} />)
    await userEvent.click(screen.getByRole('link', { name: /Arya Utomo/ }))
    expect(onNavigate).toHaveBeenCalledWith('gargantua')
  })
})

describe('ChapterSection', () => {
  const chapter = chapters[1]!

  it('renders a tall anchored section', () => {
    const { container } = render(
      <ChapterSection chapter={chapter} index={1}>
        <p>content</p>
      </ChapterSection>,
    )
    const section = container.querySelector('section')!
    expect(section.id).toBe(chapter.id)
    expect(section.style.minHeight).toBe(`${chapter.heightVh}vh`)
  })

  it('is visible only while its chapter is active and not travelling', () => {
    const { container } = render(
      <ChapterSection chapter={chapter} index={1}>
        <p>content</p>
      </ChapterSection>,
    )
    const section = container.querySelector('section')!
    expect(section.dataset.visible).toBe('false')
    act(() => useJourney.getState().setChapter(1))
    expect(section.dataset.visible).toBe('true')
    act(() => useJourney.getState().setTravelling(true))
    expect(section.dataset.visible).toBe('false')
  })
})

describe('SceneBoundary', () => {
  function Boom(): never {
    throw new Error('shader failed')
  }

  it('swaps a crashing scene for the static fallback and releases the loader', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(
      <SceneBoundary>
        <Boom />
      </SceneBoundary>,
    )
    expect(container.querySelector('.fallback')).toBeInTheDocument()
    expect(useJourney.getState().loaded).toBe(true)
    spy.mockRestore()
  })

  it('renders children when nothing fails', () => {
    render(
      <SceneBoundary>
        <p>scene</p>
      </SceneBoundary>,
    )
    expect(screen.getByText('scene')).toBeInTheDocument()
  })
})

describe('Veil', () => {
  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)))

  it('fades to black during a fade jump', async () => {
    journey.veil = 0.5
    journey.veilStyle = 'fade'
    const { container } = render(<Veil />)
    await act(nextFrame)
    expect((container.querySelector('.veil--fade') as HTMLElement).style.opacity).toBe('0.5')
    expect((container.querySelector('.veil--wormhole') as HTMLElement).style.opacity).toBe('0')
  })

  it('flares white during a wormhole jump', async () => {
    journey.veil = 0.8
    journey.veilStyle = 'wormhole'
    const { container } = render(<Veil />)
    await act(nextFrame)
    const worm = container.querySelector('.veil--wormhole') as HTMLElement
    expect(Number(worm.style.opacity)).toBeCloseTo(0.92)
    expect(worm.style.getPropertyValue('--warp')).toBe('0.8')
    journey.veil = 0
  })

  it('shows the navigation blackout from the store', () => {
    const { container } = render(<Veil />)
    const blackout = container.querySelector('.veil--blackout') as HTMLElement
    expect(blackout.dataset.on).toBe('false')
    act(() => useJourney.getState().setBlackout(true))
    expect(blackout.dataset.on).toBe('true')
  })
})

describe('SpecTable', () => {
  it('renders nothing for an empty table', () => {
    const { container } = render(<SpecTable rows={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders key/value rows as a description list', () => {
    render(<SpecTable rows={[{ key: 'GPA', value: '3.58 / 4.00' }]} />)
    expect(screen.getByText('GPA').tagName).toBe('DT')
    expect(screen.getByText('3.58 / 4.00').tagName).toBe('DD')
  })
})

describe('StatCounter', () => {
  it('shows the final figure with reduced motion', () => {
    act(() => useJourney.getState().setReducedMotion(true))
    render(<StatCounter value="$2.65M" label="exposure" active />)
    expect(screen.getByText('$2.65M')).toBeInTheDocument()
    expect(screen.getByText('exposure')).toBeInTheDocument()
  })

  it('counts up to the final figure when active', () => {
    vi.useFakeTimers()
    render(<StatCounter value="876K" label="rows" active />)
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.getByText('876K')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('always exposes the final figure to assistive tech', () => {
    render(<StatCounter value="96%" label="recall" active={false} />)
    expect(screen.getByText('96% recall')).toHaveClass('sr-only')
  })
})
