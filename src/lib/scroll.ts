/** A chapter's extent on the scroll timeline, in viewport units (1 = one screen). */
export interface ChapterSpan {
  readonly start: number
  readonly end: number
}

export interface Location {
  readonly index: number
  /** 0..1 progress through the chapter. */
  readonly local: number
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export function buildSpans(heightsVh: readonly number[]): ChapterSpan[] {
  let cursor = 0
  return heightsVh.map((vh) => {
    if (!(vh > 0)) throw new Error(`Chapter heights must be positive, got ${vh}`)
    const span = { start: cursor, end: cursor + vh / 100 }
    cursor = span.end
    return span
  })
}

/** Spans measured from rendered sections (sections can grow past their nominal height on small screens). */
export function spansFromRects(rects: readonly { top: number; height: number }[], viewportHeight: number): ChapterSpan[] {
  if (!(viewportHeight > 0)) throw new Error('viewport height must be positive')
  return rects.map((r) => ({ start: r.top / viewportHeight, end: (r.top + r.height) / viewportHeight }))
}

/** How far the page can actually scroll: the last screen stays in view. */
export function scrollLength(spans: readonly ChapterSpan[]): number {
  const total = spans.at(-1)?.end ?? 0
  return Math.max(0, total - 1)
}

/** Map a scroll offset (in viewport units) to a chapter and progress within it. */
export function locate(offset: number, spans: readonly ChapterSpan[]): Location {
  if (spans.length === 0) return { index: 0, local: 0 }

  const max = scrollLength(spans)
  const t = Math.min(max, Math.max(0, offset))
  const lastIndex = spans.length - 1

  for (let i = 0; i < lastIndex; i++) {
    const span = spans[i]!
    if (t < span.end) return { index: i, local: clamp01((t - span.start) / (span.end - span.start)) }
  }

  // The last chapter only has (length - 1) scrollable screens.
  const last = spans[lastIndex]!
  const usable = Math.max(max - last.start, Number.EPSILON)
  return { index: lastIndex, local: clamp01((t - last.start) / usable) }
}
