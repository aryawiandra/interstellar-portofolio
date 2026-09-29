import { sampleCamera, type CameraKeyframe } from './cameraPath'

const a: CameraKeyframe = {
  position: [0, 0, 10],
  target: [0, 0, 0],
  fov: 40,
  hold: 0.5,
  exit: 'fly',
  veil: 'fade',
}
const b: CameraKeyframe = {
  position: [10, 0, 10],
  target: [10, 0, 0],
  fov: 60,
  hold: 0.5,
  exit: 'fly',
  veil: 'fade',
}
const jumpA: CameraKeyframe = { ...a, exit: 'jump', veil: 'wormhole', dive: 1 }

describe('sampleCamera', () => {
  it('holds the keyframe pose during the hold phase', () => {
    const s = sampleCamera([a, b], 0, 0.2)
    expect(s.position[0]).toBeCloseTo(0)
    expect(s.target).toEqual([0, 0, 0])
    expect(s.fov).toBe(40)
    expect(s.veil).toBe(0)
  })

  it('drifts slightly toward the target while holding', () => {
    const start = sampleCamera([a, b], 0, 0)
    const later = sampleCamera([a, b], 0, 0.5)
    expect(later.position[2]).toBeLessThan(start.position[2])
    expect(later.position[2]).toBeGreaterThan(9)
  })

  it('arrives at the next keyframe at the end of a fly transition', () => {
    const s = sampleCamera([a, b], 0, 1)
    expect(s.position[0]).toBeCloseTo(10)
    expect(s.target[0]).toBeCloseTo(10)
    expect(s.fov).toBeCloseTo(60)
  })

  it('eases through the midpoint of a fly transition', () => {
    const s = sampleCamera([a, b], 0, 0.75)
    expect(s.position[0]).toBeCloseTo(5)
    expect(s.fov).toBeCloseTo(50)
    expect(s.veil).toBe(0)
  })

  it('holds the last keyframe forever', () => {
    const s = sampleCamera([a, b], 1, 1)
    expect(s.position[0]).toBeCloseTo(10)
    expect(s.veil).toBe(0)
  })

  it('peaks the veil in the middle of a jump and reports its style', () => {
    const s = sampleCamera([jumpA, b], 0, 0.75)
    expect(s.veil).toBeCloseTo(1)
    expect(s.veilStyle).toBe('wormhole')
  })

  it('dives toward the target before cutting over in a jump', () => {
    const s = sampleCamera([jumpA, b], 0, 0.7)
    expect(s.position[0]).toBeCloseTo(0)
    expect(s.position[2]).toBeLessThan(5)
  })

  it('settles into the next pose after the cut', () => {
    const justAfter = sampleCamera([jumpA, b], 0, 0.76)
    const end = sampleCamera([jumpA, b], 0, 1)
    expect(justAfter.target[0]).toBeCloseTo(10)
    expect(justAfter.position[2]).toBeGreaterThan(end.position[2])
    expect(end.position).toEqual([10, 0, 10])
    expect(end.veil).toBeCloseTo(0)
  })

  it('defaults the focus point to the target', () => {
    expect(sampleCamera([a, b], 0, 0.2).focus).toEqual([0, 0, 0])
  })

  it('interpolates the focus point alongside the target', () => {
    const withFocus: CameraKeyframe = { ...a, focus: [4, 0, 0] }
    const s = sampleCamera([withFocus, { ...b, focus: [14, 0, 0] }], 0, 0.75)
    expect(s.focus[0]).toBeCloseTo(9)
  })

  it('clamps an out-of-range index', () => {
    expect(sampleCamera([a, b], 9, 0).fov).toBe(60)
  })

  it('throws on an empty keyframe list', () => {
    expect(() => sampleCamera([], 0, 0)).toThrow(/keyframe/)
  })
})
