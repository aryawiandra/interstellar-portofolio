import type { CameraKeyframe } from '../lib/cameraPath'
import { add3, lerp3, scale3, sub3, type Vec3 } from '../lib/easing'
import { BLACK_HOLE, ENDURANCE, PLANETS, SOLAR } from './layout'

const UP: Vec3 = [0, 1, 0]
const DEG = Math.PI / 180

const length3 = (v: Vec3) => Math.hypot(v[0], v[1], v[2])
const normalize3 = (v: Vec3): Vec3 => scale3(v, 1 / (length3(v) || 1))
const cross3 = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]

interface OrbitOptions {
  /** Camera distance from the subject, in subject radii. */
  readonly distance: number
  /** Degrees around the subject, measured from the side facing away from Gargantua. Sign picks the side of frame. */
  readonly azimuth: number
  /** Degrees above the disk plane. */
  readonly elevation: number
  /** How far the aim point moves from the subject toward Gargantua (0..1). */
  readonly aim: number
}

/**
 * Frame a subject with Gargantua behind it. At azimuth 0 the camera looks straight past the subject
 * at the hole (subject in silhouette); larger azimuths swing round so the disk light rakes the subject.
 */
function orbitShot(subject: Vec3, radius: number, o: OrbitOptions): Pick<CameraKeyframe, 'position' | 'target' | 'focus'> {
  const away = normalize3(sub3(subject, BLACK_HOLE.center))
  const right = normalize3(cross3(away, UP))
  const az = o.azimuth * DEG
  const el = o.elevation * DEG
  const horizontal = add3(scale3(away, Math.cos(az)), scale3(right, Math.sin(az)))
  const direction = add3(scale3(horizontal, Math.cos(el)), scale3(UP, Math.sin(el)))
  return {
    position: add3(subject, scale3(direction, radius * o.distance)),
    target: lerp3(subject, BLACK_HOLE.center, o.aim),
    focus: lerp3(subject, BLACK_HOLE.center, o.aim * 0.35),
  }
}

const base = { hold: 0.55, exit: 'fly', veil: 'fade' } as const

/** One camera keyframe per chapter, in chapter order (see content/chapters.ts). */
export const keyframes: readonly CameraKeyframe[] = [
  // gargantua: the hero frame, disk nearly edge-on, hole pushed right of the headline
  { ...base, position: [0, 3.6, 44], target: [-5.5, 0.4, 0], focus: [0, 0.2, 0], fov: 38, hold: 0.45, exit: 'jump', veil: 'fade', dive: 0.25 },
  // origin: low Earth orbit, terminator across the disc
  {
    ...base,
    position: add3(SOLAR.earth.position, [9.5, 3.2, 12]),
    target: add3(SOLAR.earth.position, [-3, 4.5, -2]),
    focus: add3(SOLAR.earth.position, [0, 3, 0]),
    fov: 42,
  },
  // transit: the wormhole ahead, Saturn hanging behind it on the left
  {
    ...base,
    position: add3(SOLAR.wormhole.position, [20, 3, 42]),
    target: add3(SOLAR.wormhole.position, [-14, -2, 0]),
    focus: add3(SOLAR.wormhole.position, [-6, -1, 0]),
    fov: 46,
    hold: 0.5,
    exit: 'jump',
    veil: 'wormhole',
    dive: 1,
    drift: 0.1,
  },
  // missions: each world backlit by the disk, framed right of Gargantua
  { ...base, ...orbitShot(PLANETS.desert.position, PLANETS.desert.radius, { distance: 4.6, azimuth: 46, elevation: 8, aim: 0.3 }), fov: 42 },
  { ...base, ...orbitShot(PLANETS.ocean.position, PLANETS.ocean.radius, { distance: 4.4, azimuth: 44, elevation: 6, aim: 0.32 }), fov: 42 },
  { ...base, ...orbitShot(PLANETS.ice.position, PLANETS.ice.radius, { distance: 4.4, azimuth: 46, elevation: 10, aim: 0.3 }), fov: 42 },
  { ...base, ...orbitShot(PLANETS.moon.position, PLANETS.moon.radius, { distance: 7.5, azimuth: 36, elevation: 10, aim: 0.22 }), fov: 40 },
  // fleet: the Endurance silhouetted against Gargantua, both left of the crew table
  { ...base, position: add3(ENDURANCE.position, [1.2, 0.35, 6.2]), target: add3(ENDURANCE.position, [1.9, -0.6, -8]), focus: add3(ENDURANCE.position, [0.2, -0.3, -4]), fov: 38, hold: 0.6 },
  // systems: skimming the accretion disk
  { ...base, position: [11, 0.7, 17], target: [0, -0.4, 0], fov: 48 },
  // signals: high above the disk plane
  { ...base, position: [0, 36, 30], target: [0, 0, -3], fov: 42 },
  // horizon: the plunge
  { ...base, position: [0, 0.55, 7.2], target: [0, 0, 0], fov: 58, hold: 1, drift: 0.4 },
]
