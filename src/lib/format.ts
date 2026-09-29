export interface ParsedStat {
  readonly prefix: string
  readonly value: number
  readonly decimals: number
  readonly suffix: string
}

const STAT_PATTERN = /^([^\d]*)(\d+(?:\.\d+)?)(.*)$/

/** Split a display figure like "$2.65M" into parts that can be counted up. */
export function parseStat(text: string): ParsedStat {
  const match = STAT_PATTERN.exec(text)
  if (!match) return { prefix: text, value: 0, decimals: 0, suffix: '' }
  const [, prefix = '', digits = '0', suffix = ''] = match
  const decimals = digits.includes('.') ? digits.split('.')[1]!.length : 0
  return { prefix, value: Number(digits), decimals, suffix }
}

export function formatStat(stat: ParsedStat, current: number): string {
  if (stat.value === 0 && stat.suffix === '') return stat.prefix
  return `${stat.prefix}${current.toFixed(stat.decimals)}${stat.suffix}`
}
