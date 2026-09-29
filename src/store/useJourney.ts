import { create } from 'zustand'
import type { VeilStyle } from '../lib/cameraPath'
import { downgrade, type QualityTier } from '../lib/quality'

interface JourneyState {
  readonly chapterIndex: number
  /** True while the camera is travelling between chapters (text is hidden). */
  readonly travelling: boolean
  /** Full-screen black cover used when teleporting between distant chapters. */
  readonly blackout: boolean
  readonly loaded: boolean
  /** Asset loading progress, 0..100. */
  readonly progress: number
  readonly tier: QualityTier
  readonly reducedMotion: boolean
  setChapter: (index: number) => void
  setTravelling: (travelling: boolean) => void
  setBlackout: (blackout: boolean) => void
  setLoaded: (loaded: boolean) => void
  setProgress: (progress: number) => void
  setTier: (tier: QualityTier) => void
  setReducedMotion: (reduced: boolean) => void
  degrade: () => void
  reset: () => void
}

const initial = {
  chapterIndex: 0,
  travelling: false,
  blackout: false,
  loaded: false,
  progress: 0,
  tier: 'medium' as QualityTier,
  reducedMotion: false,
}

export const useJourney = create<JourneyState>()((set, get) => ({
  ...initial,
  setChapter: (index) => {
    if (get().chapterIndex !== index) set({ chapterIndex: index })
  },
  setTravelling: (travelling) => {
    if (get().travelling !== travelling) set({ travelling })
  },
  setBlackout: (blackout) => set({ blackout }),
  setLoaded: (loaded) => set({ loaded }),
  setProgress: (progress) => set({ progress: Math.min(100, Math.max(0, progress)) }),
  setTier: (tier) => set({ tier }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  degrade: () => set({ tier: downgrade(get().tier) }),
  reset: () => set(initial),
}))

/**
 * Per-frame state shared between the scroll driver, the camera rig and the veil.
 * Kept out of React state so scrolling never re-renders the tree.
 */
export const journey = {
  /** Scroll offset in viewport units. */
  offset: 0,
  index: 0,
  local: 0,
  /** Transition veil opacity (0..1), written by the camera rig. */
  veil: 0,
  veilStyle: 'fade' as VeilStyle,
  /** Set to make the camera jump straight to its target pose on the next frame. */
  snap: true,
}
