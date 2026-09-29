import Lenis from 'lenis'
import { useCallback, useEffect, useRef } from 'react'
import { chapters } from '../content/chapters'
import type { ChapterId } from '../content/types'
import { buildSpans, locate, spansFromRects, type ChapterSpan } from '../lib/scroll'
import { keyframes } from '../scene/choreography'
import { journey, useJourney } from '../store/useJourney'

const BLACKOUT_IN_MS = 380
const BLACKOUT_HOLD_MS = 120
/** Chapters further apart than this are reached by a blackout teleport instead of a long fly-through. */
const TELEPORT_DISTANCE = 1

let spans: ChapterSpan[] = buildSpans(chapters.map((c) => c.heightVh))

function measureSpans() {
  // Hidden tabs and collapsed panes report a zero-height viewport; keep the last good spans.
  if (window.innerHeight <= 0) return
  const sections = chapters.map((c) => document.getElementById(c.id))
  if (sections.some((s) => !s)) return
  spans = spansFromRects(
    sections.map((s) => ({ top: s!.offsetTop, height: s!.offsetHeight })),
    window.innerHeight,
  )
}

function remeasure() {
  measureSpans()
  syncJourney()
}

function syncJourney() {
  if (window.innerHeight <= 0) return
  const offset = window.scrollY / window.innerHeight
  const { index, local } = locate(offset, spans)
  journey.offset = offset
  journey.index = index
  journey.local = local
  const hold = keyframes[index]?.hold ?? 1
  const store = useJourney.getState()
  store.setChapter(index)
  store.setTravelling(index < chapters.length - 1 && local > hold)
}

/** Drives smooth scrolling and publishes scroll progress. Returns a chapter navigator. */
export function useScrollDriver(): (id: ChapterId) => void {
  const lenisRef = useRef<Lenis | null>(null)
  const reduced = useJourney((s) => s.reducedMotion)

  useEffect(() => {
    // The journey always starts at the loader, not wherever the last visit left off.
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    journey.snap = true
  }, [])

  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: !reduced, lerp: 0.08, wheelMultiplier: 0.85, anchors: false })
    lenisRef.current = lenis
    if (import.meta.env.DEV) {
      // Test hook: jump the page to an exact offset (used by e2e screenshots).
      ;(window as Window & { __jump?: (y: number) => void }).__jump = (y) => lenis.scrollTo(y, { immediate: true, force: true })
    }
    lenis.on('scroll', syncJourney)
    window.addEventListener('resize', remeasure)
    const observer = new ResizeObserver(remeasure)
    const main = document.getElementById('main')
    if (main) observer.observe(main)

    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    })
    remeasure()

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', remeasure)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  const navigate = useCallback((id: ChapterId) => {
    const el = document.getElementById(id)
    const lenis = lenisRef.current
    if (!el || !lenis) return

    const targetIndex = chapters.findIndex((c) => c.id === id)
    const far = Math.abs(targetIndex - journey.index) > TELEPORT_DISTANCE
    const { reducedMotion, setBlackout } = useJourney.getState()

    if (!far && !reducedMotion) {
      lenis.scrollTo(el, { duration: 2.2 })
      return
    }

    setBlackout(true)
    window.setTimeout(
      () => {
        lenis.scrollTo(el, { immediate: true, force: true })
        journey.snap = true
        syncJourney()
        window.setTimeout(() => setBlackout(false), BLACKOUT_HOLD_MS)
      },
      reducedMotion ? 0 : BLACKOUT_IN_MS,
    )
  }, [])

  // Route in-page anchor clicks (e.g. "Scroll to launch") through the navigator.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.('a[href^="#"]')
      const id = anchor?.getAttribute('href')?.slice(1)
      if (!id || !chapters.some((c) => c.id === id)) return
      event.preventDefault()
      navigate(id as ChapterId)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [navigate])

  return navigate
}
