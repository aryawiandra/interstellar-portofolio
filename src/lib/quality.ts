export type QualityTier = 'high' | 'medium' | 'low'

export interface DeviceHints {
  readonly isMobile: boolean
  readonly cores: number
  /** navigator.deviceMemory, when the browser exposes it. */
  readonly memoryGb?: number
}

export interface QualitySettings {
  readonly tier: QualityTier
  /** Device-pixel-ratio range for the canvas. */
  readonly dpr: readonly [number, number]
  /** Render scale of the black-hole ray-march target relative to the canvas. */
  readonly bhScale: number
  /** Maximum ray-march steps per pixel. */
  readonly bhSteps: number
  readonly bloom: boolean
  readonly planetSegments: number
}

const HIGH_CORES = 8
const MEDIUM_CORES = 4
const LOW_MEMORY_GB = 4

export function pickTier({ isMobile, cores, memoryGb }: DeviceHints): QualityTier {
  if (isMobile) return 'low'
  if (memoryGb !== undefined && memoryGb < LOW_MEMORY_GB) return 'low'
  if (cores >= HIGH_CORES) return 'high'
  if (cores >= MEDIUM_CORES) return 'medium'
  return 'low'
}

export function downgrade(tier: QualityTier): QualityTier {
  return tier === 'high' ? 'medium' : 'low'
}

const PRESETS: Record<QualityTier, Omit<QualitySettings, 'tier'>> = {
  high: { dpr: [1, 1.5], bhScale: 0.75, bhSteps: 300, bloom: true, planetSegments: 128 },
  medium: { dpr: [1, 1.25], bhScale: 0.6, bhSteps: 180, bloom: true, planetSegments: 96 },
  low: { dpr: [0.75, 1], bhScale: 0.45, bhSteps: 100, bloom: true, planetSegments: 64 },
}

export function settingsFor(tier: QualityTier): QualitySettings {
  const preset = PRESETS[tier]
  return { tier, ...preset, dpr: [preset.dpr[0], preset.dpr[1]] }
}

export function detectHints(nav: Navigator = navigator): DeviceHints {
  const memory = (nav as Navigator & { deviceMemory?: number }).deviceMemory
  return {
    isMobile: /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent),
    cores: nav.hardwareConcurrency || MEDIUM_CORES,
    memoryGb: memory,
  }
}
