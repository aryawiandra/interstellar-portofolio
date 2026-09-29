import { formatStat, parseStat } from './format'

describe('parseStat', () => {
  it('splits currency prefix, decimals and suffix', () => {
    expect(parseStat('$2.65M')).toEqual({ prefix: '$', value: 2.65, decimals: 2, suffix: 'M' })
  })

  it('handles integer figures with a unit suffix', () => {
    expect(parseStat('876K')).toEqual({ prefix: '', value: 876, decimals: 0, suffix: 'K' })
    expect(parseStat('370K+')).toEqual({ prefix: '', value: 370, decimals: 0, suffix: 'K+' })
    expect(parseStat('96%')).toEqual({ prefix: '', value: 96, decimals: 0, suffix: '%' })
  })

  it('treats non-numeric text as a plain label', () => {
    expect(parseStat('BRD')).toEqual({ prefix: 'BRD', value: 0, decimals: 0, suffix: '' })
  })
})

describe('formatStat', () => {
  it('rebuilds the figure at any progress value', () => {
    const parsed = parseStat('$2.65M')
    expect(formatStat(parsed, parsed.value)).toBe('$2.65M')
    expect(formatStat(parsed, 1)).toBe('$1.00M')
  })

  it('rounds integers while counting', () => {
    expect(formatStat(parseStat('876K'), 437.6)).toBe('438K')
  })

  it('leaves plain labels untouched', () => {
    expect(formatStat(parseStat('BRD'), 0)).toBe('BRD')
  })
})
