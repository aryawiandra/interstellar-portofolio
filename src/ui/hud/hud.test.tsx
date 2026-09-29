import { act, render, screen } from '@testing-library/react'
import { useJourney } from '../../store/useJourney'
import { ChapterContext } from '../ChapterSection'
import { DetectionBox } from './DetectionBox'
import { Telemetry } from './Telemetry'

const lines = ['TARGET  GARGANTUA', 'ETA  AUG 2027']

function renderTelemetry(visible: boolean) {
  return render(
    <ChapterContext.Provider value={{ visible }}>
      <Telemetry lines={lines} />
    </ChapterContext.Provider>,
  )
}

describe('Telemetry', () => {
  beforeEach(() => useJourney.getState().reset())
  afterEach(() => vi.useRealTimers())

  it('always offers the full text to screen readers', () => {
    renderTelemetry(false)
    expect(screen.getByText('TARGET GARGANTUA. ETA AUG 2027')).toHaveClass('sr-only')
  })

  it('types nothing while its chapter is hidden', () => {
    const { container } = renderTelemetry(false)
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(/^$/)
  })

  it('types every line once visible', () => {
    vi.useFakeTimers()
    const { container } = renderTelemetry(true)
    act(() => vi.advanceTimersByTime(5000))
    const typed = container.querySelector('[aria-hidden="true"]')!
    expect(typed).toHaveTextContent('TARGETGARGANTUA')
    expect(typed).toHaveTextContent('ETAAUG 2027')
  })

  it('renders lines without a key/value separator as plain values', () => {
    act(() => useJourney.getState().setReducedMotion(true))
    const { container } = render(
      <ChapterContext.Provider value={{ visible: true }}>
        <Telemetry lines={['SCAN ACTIVE']} />
      </ChapterContext.Provider>,
    )
    expect(container.querySelector('.telemetry__key')).toBeNull()
    expect(container.querySelector('.telemetry__value')).toHaveTextContent('SCAN ACTIVE')
  })

  it('shows everything instantly with reduced motion', () => {
    act(() => useJourney.getState().setReducedMotion(true))
    const { container } = renderTelemetry(true)
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('ETAAUG 2027')
  })
})

describe('DetectionBox', () => {
  it('renders its label and position', () => {
    const { container } = render(<DetectionBox label="ANOMALY  0.96" slot={{ left: 60, top: 30, size: 8 }} index={0} />)
    expect(screen.getByText(/ANOMALY\s+0\.96/)).toBeInTheDocument()
    const box = container.firstElementChild as HTMLElement
    expect(box.style.left).toBe('60%')
    expect(box).toHaveAttribute('aria-hidden', 'true')
  })
})
