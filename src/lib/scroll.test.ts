import { buildSpans, locate, scrollLength, spansFromRects } from './scroll'

describe('spansFromRects', () => {
  it('converts measured section boxes into viewport-unit spans', () => {
    const rects = [
      { top: 0, height: 1600 },
      { top: 1600, height: 2400 },
    ]
    expect(spansFromRects(rects, 800)).toEqual([
      { start: 0, end: 2 },
      { start: 2, end: 5 },
    ])
  })

  it('rejects a zero-height viewport', () => {
    expect(() => spansFromRects([{ top: 0, height: 10 }], 0)).toThrow(/viewport/)
  })
})

describe('buildSpans', () => {
  it('converts vh heights into contiguous viewport-unit spans', () => {
    // Arrange
    const heights = [100, 250, 150]

    // Act
    const spans = buildSpans(heights)

    // Assert
    expect(spans).toEqual([
      { start: 0, end: 1 },
      { start: 1, end: 3.5 },
      { start: 3.5, end: 5 },
    ])
  })

  it('returns an empty list for no chapters', () => {
    expect(buildSpans([])).toEqual([])
  })

  it('rejects non-positive heights', () => {
    expect(() => buildSpans([100, 0])).toThrow(/positive/)
  })
})

describe('scrollLength', () => {
  it('is total length minus the last visible viewport', () => {
    expect(scrollLength(buildSpans([100, 250, 150]))).toBe(4)
  })

  it('never goes negative', () => {
    expect(scrollLength(buildSpans([50]))).toBe(0)
  })
})

describe('locate', () => {
  const spans = buildSpans([100, 200, 300])

  it('finds the first chapter at the top of the page', () => {
    expect(locate(0, spans)).toEqual({ index: 0, local: 0 })
  })

  it('reports local progress inside a chapter', () => {
    expect(locate(2, spans)).toEqual({ index: 1, local: 0.5 })
  })

  it('moves to the next chapter exactly on a boundary', () => {
    expect(locate(1, spans)).toEqual({ index: 1, local: 0 })
  })

  it('reaches local 1 on the last chapter at the bottom of the page', () => {
    // Last span is 3 viewports long but only 2 of them are scrollable.
    expect(locate(scrollLength(spans), spans)).toEqual({ index: 2, local: 1 })
  })

  it('clamps offsets before the start and after the end', () => {
    expect(locate(-5, spans)).toEqual({ index: 0, local: 0 })
    expect(locate(99, spans)).toEqual({ index: 2, local: 1 })
  })

  it('handles an empty timeline', () => {
    expect(locate(3, [])).toEqual({ index: 0, local: 0 })
  })
})
