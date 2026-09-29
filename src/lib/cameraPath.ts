import { add3, clamp01, easeInCubic, easeInOutCubic, easeOutCubic, lerp, lerp3, scale3, sub3, type Vec3 } from './easing'

export type { Vec3 }

/** How the camera leaves a keyframe for the next one. */
export type ExitKind = 'fly' | 'jump'
/** What covers the screen during a jump. */
export type VeilStyle = 'fade' | 'wormhole'

export interface CameraKeyframe {
  readonly position: Vec3
  readonly target: Vec3
  readonly fov: number
  /** Fraction of the chapter spent holding this pose before moving on. */
  readonly hold: number
  readonly exit: ExitKind
  readonly veil: VeilStyle
  /** For jumps: how far toward the target the camera dives before the cut (0..1). */
  readonly dive?: number
  /** Fraction of the camera-target distance to creep forward while holding. */
  readonly drift?: number
  /** The shot's main subject; narrow screens aim here instead of the (off-centre) target. */
  readonly focus?: Vec3
}

export interface CameraSample {
  readonly position: Vec3
  readonly target: Vec3
  readonly focus: Vec3
  readonly fov: number
  /** 0..1 opacity of the transition veil. */
  readonly veil: number
  readonly veilStyle: VeilStyle
}

const DEFAULT_DRIFT = 0.06
const DEFAULT_DIVE = 0.35
/** Extra distance the camera settles in from after a jump, as a fraction of its target distance. */
const SETTLE_BACKOFF = 0.35

const focusOf = (k: CameraKeyframe): Vec3 => k.focus ?? k.target

function driftPose(k: CameraKeyframe, amount: number): Vec3 {
  return lerp3(k.position, k.target, (k.drift ?? DEFAULT_DRIFT) * amount)
}

function fly(from: CameraKeyframe, to: CameraKeyframe, u: number): CameraSample {
  const e = easeInOutCubic(u)
  return {
    position: lerp3(driftPose(from, 1), to.position, e),
    target: lerp3(from.target, to.target, e),
    focus: lerp3(focusOf(from), focusOf(to), e),
    fov: lerp(from.fov, to.fov, e),
    veil: 0,
    veilStyle: from.veil,
  }
}

function jump(from: CameraKeyframe, to: CameraKeyframe, u: number): CameraSample {
  const veil = Math.sin(Math.PI * u)
  if (u < 0.5) {
    const dive = easeInCubic(u * 2) * (from.dive ?? DEFAULT_DIVE)
    return {
      position: lerp3(driftPose(from, 1), from.target, dive),
      target: from.target,
      focus: focusOf(from),
      fov: lerp(from.fov, from.fov + 20, easeInCubic(u * 2)),
      veil,
      veilStyle: from.veil,
    }
  }
  const settle = easeOutCubic((u - 0.5) * 2)
  const backoff = add3(to.position, scale3(sub3(to.position, to.target), SETTLE_BACKOFF))
  return {
    position: lerp3(backoff, to.position, settle),
    target: to.target,
    focus: focusOf(to),
    fov: lerp(to.fov + 20, to.fov, settle),
    veil,
    veilStyle: from.veil,
  }
}

/**
 * Camera pose for a given chapter and progress through it. The camera holds (with a slow drift)
 * for `hold` of the chapter, then travels to the next chapter's keyframe.
 */
export function sampleCamera(keyframes: readonly CameraKeyframe[], index: number, local: number): CameraSample {
  if (keyframes.length === 0) throw new Error('sampleCamera needs at least one keyframe')

  const i = Math.min(keyframes.length - 1, Math.max(0, index))
  const current = keyframes[i]!
  const next = keyframes[i + 1]
  const t = clamp01(local)

  if (!next || t <= current.hold) {
    const holdProgress = next ? t / Math.max(current.hold, Number.EPSILON) : t
    return {
      position: driftPose(current, holdProgress),
      target: current.target,
      focus: focusOf(current),
      fov: current.fov,
      veil: 0,
      veilStyle: current.veil,
    }
  }

  const u = (t - current.hold) / (1 - current.hold)
  return current.exit === 'jump' ? jump(current, next, u) : fly(current, next, u)
}
