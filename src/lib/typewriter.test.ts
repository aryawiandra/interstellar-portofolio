import { typewriterFrame, typewriterDuration } from './typewriter'

const opts = { charMs: 10, lineGapMs: 100 }

describe('typewriterFrame', () => {
  it('shows nothing before it starts', () => {
    expect(typewriterFrame(['ABC', 'DE'], 0, opts)).toEqual(['', ''])
  })

  it('types the first line character by character', () => {
    expect(typewriterFrame(['ABC', 'DE'], 25, opts)).toEqual(['AB', ''])
  })

  it('waits for the line gap before starting the next line', () => {
    // Line 1 finishes at 30ms, line 2 starts at 130ms.
    expect(typewriterFrame(['ABC', 'DE'], 120, opts)).toEqual(['ABC', ''])
    expect(typewriterFrame(['ABC', 'DE'], 140, opts)).toEqual(['ABC', 'D'])
  })

  it('shows everything once complete', () => {
    expect(typewriterFrame(['ABC', 'DE'], 10_000, opts)).toEqual(['ABC', 'DE'])
  })

  it('shows everything immediately when instant is set', () => {
    expect(typewriterFrame(['ABC'], 0, { ...opts, instant: true })).toEqual(['ABC'])
  })
})

describe('typewriterDuration', () => {
  it('sums characters and gaps between lines', () => {
    expect(typewriterDuration(['ABC', 'DE'], opts)).toBe(30 + 100 + 20)
  })

  it('is zero for no lines', () => {
    expect(typewriterDuration([], opts)).toBe(0)
  })
})
