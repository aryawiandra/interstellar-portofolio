import { detectHints, downgrade, pickTier, settingsFor } from './quality'

describe('pickTier', () => {
  it('picks high for a capable desktop', () => {
    expect(pickTier({ isMobile: false, cores: 10, memoryGb: 16 })).toBe('high')
  })

  it('picks medium for a modest desktop', () => {
    expect(pickTier({ isMobile: false, cores: 4, memoryGb: 8 })).toBe('medium')
  })

  it('picks low for phones', () => {
    expect(pickTier({ isMobile: true, cores: 8, memoryGb: 8 })).toBe('low')
  })

  it('picks low for very small machines', () => {
    expect(pickTier({ isMobile: false, cores: 2, memoryGb: 2 })).toBe('low')
  })

  it('treats unknown memory as medium-capable', () => {
    expect(pickTier({ isMobile: false, cores: 8 })).toBe('high')
    expect(pickTier({ isMobile: false, cores: 4 })).toBe('medium')
  })
})

describe('downgrade', () => {
  it('steps down one tier and bottoms out at low', () => {
    expect(downgrade('high')).toBe('medium')
    expect(downgrade('medium')).toBe('low')
    expect(downgrade('low')).toBe('low')
  })
})

describe('settingsFor', () => {
  it('scales ray-march cost with the tier', () => {
    const high = settingsFor('high')
    const low = settingsFor('low')
    expect(high.bhSteps).toBeGreaterThan(low.bhSteps)
    expect(high.bhScale).toBeGreaterThan(low.bhScale)
    expect(high.dpr[1]).toBeGreaterThanOrEqual(low.dpr[1])
  })

  it('returns a fresh object each call', () => {
    expect(settingsFor('medium')).not.toBe(settingsFor('medium'))
  })
})

describe('detectHints', () => {
  const nav = (userAgent: string, hardwareConcurrency: number, deviceMemory?: number) =>
    ({ userAgent, hardwareConcurrency, deviceMemory }) as unknown as Navigator

  it('flags phones from the user agent', () => {
    expect(detectHints(nav('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)', 6)).isMobile).toBe(true)
  })

  it('reads cores and memory from a desktop browser', () => {
    expect(detectHints(nav('Mozilla/5.0 (Macintosh)', 10, 16))).toEqual({ isMobile: false, cores: 10, memoryGb: 16 })
  })

  it('assumes a mid-range core count when the browser hides it', () => {
    expect(detectHints(nav('Mozilla/5.0 (Windows NT 10.0)', 0)).cores).toBe(4)
  })
})
