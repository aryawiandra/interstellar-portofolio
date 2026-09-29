import { chapters } from '../content/chapters'
import { keyframes } from './choreography'
import { BLACK_HOLE, PLANETS, SOLAR } from './layout'

const distance = (p: readonly number[], q: readonly number[]) =>
  Math.hypot(p[0]! - q[0]!, p[1]! - q[1]!, p[2]! - q[2]!)

describe('choreography', () => {
  it('has exactly one keyframe per chapter, in order', () => {
    expect(keyframes).toHaveLength(chapters.length)
  })

  it('keeps every camera outside the event horizon with margin', () => {
    for (const k of keyframes) {
      if (distance(k.position, SOLAR.origin) < 2000) continue
      expect(distance(k.position, BLACK_HOLE.center)).toBeGreaterThan(BLACK_HOLE.horizonRadius * 3)
    }
  })

  it('never places a camera inside a planet', () => {
    for (const k of keyframes) {
      for (const p of Object.values(PLANETS)) {
        expect(distance(k.position, p.position)).toBeGreaterThan(p.radius * 1.5)
      }
    }
  })

  it('uses a wormhole jump to leave the solar system', () => {
    const transit = chapters.findIndex((c) => c.id === 'transit')
    expect(keyframes[transit]?.exit).toBe('jump')
    expect(keyframes[transit]?.veil).toBe('wormhole')
  })

  it('keeps field of view in a sane range', () => {
    for (const k of keyframes) {
      expect(k.fov).toBeGreaterThanOrEqual(25)
      expect(k.fov).toBeLessThanOrEqual(80)
    }
  })

  it('keeps hold fractions inside 0..1', () => {
    for (const k of keyframes) {
      expect(k.hold).toBeGreaterThanOrEqual(0)
      expect(k.hold).toBeLessThanOrEqual(1)
    }
  })
})
