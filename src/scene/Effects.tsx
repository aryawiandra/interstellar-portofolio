import { useFrame } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode, type ChromaticAberrationEffect } from 'postprocessing'
import { useRef } from 'react'
import { HalfFloatType, Vector2 } from 'three'
import { chapters } from '../content/chapters'
import { journey, useJourney } from '../store/useJourney'

const HORIZON_INDEX = chapters.findIndex((c) => c.id === 'horizon')
const MAX_ABERRATION = 0.0042

export function Effects() {
  const aberrationRef = useRef<ChromaticAberrationEffect>(null)
  const offset = useRef(new Vector2(0, 0))
  const bloom = useJourney((s) => s.tier !== 'low')

  useFrame(() => {
    const plunge = journey.index === HORIZON_INDEX ? journey.local : 0
    const amount = MAX_ABERRATION * plunge * plunge + journey.veil * 0.002
    offset.current.set(amount, amount * 0.6)
    if (aberrationRef.current) aberrationRef.current.offset = offset.current
  })

  return (
    <EffectComposer multisampling={0} frameBufferType={HalfFloatType}>
      <Bloom mipmapBlur intensity={bloom ? 1.05 : 0.8} luminanceThreshold={0.82} luminanceSmoothing={0.25} radius={0.78} />
      <ChromaticAberration ref={aberrationRef} offset={offset.current} radialModulation modulationOffset={0.35} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.22} darkness={0.72} />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.35} />
    </EffectComposer>
  )
}
