import type { Vec3 } from '../lib/easing'
import type { PlanetKind } from '../content/types'

/**
 * World units are Schwarzschild radii (r_s = 1). Gargantua sits at the origin.
 * The solar-system scenes live far away so Gargantua's lensing is negligible there.
 */
export const BLACK_HOLE = {
  center: [0, 0, 0] as Vec3,
  horizonRadius: 1,
  diskInner: 2.6,
  diskOuter: 14,
} as const

const SOLAR_ORIGIN: Vec3 = [4000, 0, 0]

const offset = (v: Vec3): Vec3 => [SOLAR_ORIGIN[0] + v[0], SOLAR_ORIGIN[1] + v[1], SOLAR_ORIGIN[2] + v[2]]

export const SOLAR = {
  origin: SOLAR_ORIGIN,
  /** Direction the sunlight travels from (normalized in the scene). */
  sunDirection: [1, 0.3, -0.35] as Vec3,
  earth: { position: offset([0, 0, 0]), radius: 6 },
  saturn: { position: offset([-330, -8, -560]), radius: 38, ringInner: 46, ringOuter: 88 },
  wormhole: { position: offset([-60, 18, -330]), radius: 7 },
} as const

export interface PlanetPlacement {
  readonly kind: PlanetKind
  readonly position: Vec3
  readonly radius: number
  readonly seed: number
}

export const PLANETS: Record<PlanetKind, PlanetPlacement> = {
  desert: { kind: 'desert', position: [-38, 2, 22], radius: 3.2, seed: 11.3 },
  ocean: { kind: 'ocean', position: [20, -1.5, 18], radius: 3.6, seed: 4.7 },
  ice: { kind: 'ice', position: [44, 5, -26], radius: 4.2, seed: 23.9 },
  moon: { kind: 'moon', position: [-52, 6, -12], radius: 1.6, seed: 8.1 },
}

export const ENDURANCE = {
  position: [3.4, 2.1, 27] as Vec3,
  /** Ring radius in world units. */
  scale: 0.42,
} as const
