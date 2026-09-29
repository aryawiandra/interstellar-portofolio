import { act, renderHook } from '@testing-library/react'
import { chapters } from '../content/chapters'
import { keyframes } from '../scene/choreography'
import { journey, useJourney } from '../store/useJourney'
import { useScrollDriver } from './useScrollDriver'

const lenis = vi.hoisted(() => {
  const instances: Array<{
    handlers: Record<string, () => void>
    scrollTo: ReturnType<typeof vi.fn>
    destroy: ReturnType<typeof vi.fn>
  }> = []
  class FakeLenis {
    handlers: Record<string, () => void> = {}
    scrollTo = vi.fn()
    raf = vi.fn()
    destroy = vi.fn()
    constructor() {
      instances.push(this)
    }
    on(event: string, cb: () => void) {
      this.handlers[event] = cb
    }
  }
  return { FakeLenis, instances }
})

vi.mock('lenis', () => ({ default: lenis.FakeLenis }))

const VIEWPORT = 1000

function setWindow(prop: 'scrollY' | 'innerHeight', value: number) {
  Object.defineProperty(window, prop, { value, configurable: true, writable: true })
}

/** jsdom has no layout: give each chapter section a fake box from its nominal height. */
function mountSections() {
  const main = document.createElement('main')
  main.id = 'main'
  let top = 0
  for (const c of chapters) {
    const section = document.createElement('section')
    section.id = c.id
    const height = (c.heightVh / 100) * VIEWPORT
    const sectionTop = top
    Object.defineProperty(section, 'offsetTop', { get: () => sectionTop })
    Object.defineProperty(section, 'offsetHeight', { get: () => height })
    main.appendChild(section)
    top += height
  }
  document.body.appendChild(main)
  return main
}

const indexOf = (id: string) => chapters.findIndex((c) => c.id === id)
const topOf = (id: string) => document.getElementById(id)!.offsetTop
const latest = () => lenis.instances.at(-1)!

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
  } as unknown as typeof ResizeObserver
})

beforeEach(() => {
  lenis.instances.length = 0
  useJourney.getState().reset()
  journey.index = 0
  journey.snap = false
  setWindow('innerHeight', VIEWPORT)
  setWindow('scrollY', 0)
  mountSections()
})

afterEach(() => {
  document.getElementById('main')?.remove()
  vi.useRealTimers()
})

describe('useScrollDriver', () => {
  it('publishes the chapter under the current scroll position', () => {
    renderHook(() => useScrollDriver())
    setWindow('scrollY', topOf('fleet') + 10)
    act(() => latest().handlers.scroll!())
    expect(useJourney.getState().chapterIndex).toBe(indexOf('fleet'))
    expect(journey.index).toBe(indexOf('fleet'))
    expect(useJourney.getState().travelling).toBe(false)
  })

  it('flags travelling once a chapter is past its hold', () => {
    renderHook(() => useScrollDriver())
    const i = indexOf('origin')
    const hold = keyframes[i]!.hold
    const height = document.getElementById('origin')!.offsetHeight
    setWindow('scrollY', topOf('origin') + height * (hold + 0.1))
    act(() => latest().handlers.scroll!())
    expect(useJourney.getState().travelling).toBe(true)
  })

  it('ignores a zero-height viewport instead of crashing', () => {
    renderHook(() => useScrollDriver())
    setWindow('innerHeight', 0)
    expect(() => act(() => latest().handlers.scroll!())).not.toThrow()
  })

  it('always starts the journey at the top', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    renderHook(() => useScrollDriver())
    expect(history.scrollRestoration).toBe('manual')
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
    scrollTo.mockRestore()
  })

  it('flies smoothly to a neighbouring chapter', () => {
    const { result } = renderHook(() => useScrollDriver())
    act(() => result.current('origin'))
    expect(latest().scrollTo).toHaveBeenCalledWith(document.getElementById('origin'), { duration: 2.2 })
  })

  it('teleports behind a blackout to a distant chapter', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useScrollDriver())
    act(() => result.current('horizon'))
    expect(useJourney.getState().blackout).toBe(true)
    expect(latest().scrollTo).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(400))
    expect(latest().scrollTo).toHaveBeenCalledWith(document.getElementById('horizon'), { immediate: true, force: true })

    act(() => vi.advanceTimersByTime(200))
    expect(useJourney.getState().blackout).toBe(false)
  })

  it('does nothing for an unknown chapter element', () => {
    const { result } = renderHook(() => useScrollDriver())
    document.getElementById('signals')!.remove()
    act(() => result.current('signals'))
    expect(latest().scrollTo).not.toHaveBeenCalled()
  })

  it('routes in-page chapter anchors through the navigator', () => {
    renderHook(() => useScrollDriver())
    const link = document.createElement('a')
    link.href = '#origin'
    document.body.appendChild(link)
    act(() => link.click())
    expect(latest().scrollTo).toHaveBeenCalledTimes(1)
    link.remove()
  })

  it('leaves other anchors alone', () => {
    renderHook(() => useScrollDriver())
    const link = document.createElement('a')
    link.href = '#main'
    document.body.appendChild(link)
    act(() => link.click())
    expect(latest().scrollTo).not.toHaveBeenCalled()
    link.remove()
  })

  it('tears Lenis down on unmount', () => {
    const { unmount } = renderHook(() => useScrollDriver())
    const instance = latest()
    unmount()
    expect(instance.destroy).toHaveBeenCalled()
  })
})
