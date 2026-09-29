import { hasWebGL2, prefersReducedMotion } from './webgl'

function fakeDoc(context: unknown, throws = false): Document {
  return {
    createElement: () => ({
      getContext: () => {
        if (throws) throw new Error('blocked')
        return context
      },
    }),
  } as unknown as Document
}

describe('hasWebGL2', () => {
  it('is true when a webgl2 context can be created', () => {
    expect(hasWebGL2(fakeDoc({}))).toBe(true)
  })

  it('is false when the context is unavailable', () => {
    expect(hasWebGL2(fakeDoc(null))).toBe(false)
  })

  it('is false when context creation throws', () => {
    expect(hasWebGL2(fakeDoc({}, true))).toBe(false)
  })
})

describe('prefersReducedMotion', () => {
  const fakeWin = (matches: boolean | undefined) =>
    ({ matchMedia: matches === undefined ? undefined : () => ({ matches }) }) as unknown as Window

  it('reads the media query', () => {
    expect(prefersReducedMotion(fakeWin(true))).toBe(true)
    expect(prefersReducedMotion(fakeWin(false))).toBe(false)
  })

  it('defaults to motion when matchMedia is missing', () => {
    expect(prefersReducedMotion(fakeWin(undefined))).toBe(false)
  })
})
