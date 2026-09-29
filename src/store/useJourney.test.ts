import { journey, useJourney } from './useJourney'

describe('useJourney store', () => {
  beforeEach(() => useJourney.getState().reset())

  it('starts on the first chapter, not loaded', () => {
    const s = useJourney.getState()
    expect(s.chapterIndex).toBe(0)
    expect(s.loaded).toBe(false)
  })

  it('updates the chapter only when it changes', () => {
    const listener = vi.fn()
    const unsub = useJourney.subscribe(listener)
    useJourney.getState().setChapter(2)
    useJourney.getState().setChapter(2)
    unsub()
    expect(useJourney.getState().chapterIndex).toBe(2)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('marks assets as loaded', () => {
    useJourney.getState().setLoaded(true)
    expect(useJourney.getState().loaded).toBe(true)
  })

  it('steps the quality tier down', () => {
    useJourney.getState().setTier('high')
    useJourney.getState().degrade()
    expect(useJourney.getState().tier).toBe('medium')
  })

  it('updates travelling only when it changes', () => {
    const listener = vi.fn()
    const unsub = useJourney.subscribe(listener)
    useJourney.getState().setTravelling(true)
    useJourney.getState().setTravelling(true)
    unsub()
    expect(useJourney.getState().travelling).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('clamps loading progress to 0..100', () => {
    useJourney.getState().setProgress(140)
    expect(useJourney.getState().progress).toBe(100)
    useJourney.getState().setProgress(-3)
    expect(useJourney.getState().progress).toBe(0)
  })

  it('toggles the blackout cover', () => {
    useJourney.getState().setBlackout(true)
    expect(useJourney.getState().blackout).toBe(true)
  })

  it('keeps per-frame scroll state outside React state', () => {
    journey.offset = 3.2
    expect(useJourney.getState()).not.toHaveProperty('offset')
    expect(journey.offset).toBe(3.2)
  })
})
