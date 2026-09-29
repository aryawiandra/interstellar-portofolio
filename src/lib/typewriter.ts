export interface TypewriterOptions {
  readonly charMs: number
  readonly lineGapMs: number
  /** Skip the animation (reduced motion). */
  readonly instant?: boolean
}

/** Visible text of each line after `elapsedMs` of typing. Lines type one after another. */
export function typewriterFrame(lines: readonly string[], elapsedMs: number, opts: TypewriterOptions): string[] {
  if (opts.instant) return [...lines]

  let lineStart = 0
  return lines.map((line) => {
    const typed = Math.floor((elapsedMs - lineStart) / opts.charMs)
    lineStart += line.length * opts.charMs + opts.lineGapMs
    return line.slice(0, Math.max(0, Math.min(line.length, typed)))
  })
}

export function typewriterDuration(lines: readonly string[], opts: TypewriterOptions): number {
  if (lines.length === 0) return 0
  const chars = lines.reduce((n, l) => n + l.length, 0)
  return chars * opts.charMs + (lines.length - 1) * opts.lineGapMs
}
