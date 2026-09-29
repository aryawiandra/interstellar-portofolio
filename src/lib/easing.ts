export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v))

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export const easeInCubic = (t: number): number => t * t * t

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

export type Vec3 = readonly [number, number, number]

export const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

export const add3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]

export const sub3 = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]

export const scale3 = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s]
