import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, ShaderMaterial, Vector3, type Mesh } from 'three'
import type { Vec3 } from '../../lib/easing'
import { settingsFor } from '../../lib/quality'
import { useJourney } from '../../store/useJourney'
import { Atmosphere } from './Atmosphere'
import { planetFragment, planetVertex, SURFACE, type SurfaceKind } from './planetShader'

/** Rim and atmosphere tint per surface. */
const ATMOSPHERE: Record<SurfaceKind, { color: string; thickness: number; strength: number }> = {
  desert: { color: '#f2b27a', thickness: 0.035, strength: 0.9 },
  ocean: { color: '#9cc3d6', thickness: 0.06, strength: 1.3 },
  ice: { color: '#cfe3ff', thickness: 0.04, strength: 1.1 },
  moon: { color: '#8a8a8a', thickness: 0.015, strength: 0.25 },
  gas: { color: '#f3dcae', thickness: 0.025, strength: 0.7 },
}

/** Gargantua's disk light: warm white. */
export const DISK_LIGHT = '#ffd9b0'

interface ProceduralPlanetProps {
  readonly kind: SurfaceKind
  readonly position: Vec3
  readonly radius: number
  readonly seed: number
  /** Direction from the planet toward its light source. */
  readonly lightDir: Vec3
  readonly lightColor?: string
  readonly tilt?: number
  readonly spin?: number
}

export function ProceduralPlanet({
  kind,
  position,
  radius,
  seed,
  lightDir,
  lightColor = DISK_LIGHT,
  tilt = 0.35,
  spin = 0.012,
}: ProceduralPlanetProps) {
  const meshRef = useRef<Mesh>(null)
  const tier = useJourney((s) => s.tier)
  const segments = settingsFor(tier).planetSegments
  const atmosphere = ATMOSPHERE[kind]

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: planetVertex,
        fragmentShader: planetFragment,
        uniforms: {
          uKind: { value: SURFACE[kind] },
          uSeed: { value: seed },
          uTime: { value: 0 },
          uLightDir: { value: new Vector3(...lightDir).normalize() },
          uLightColor: { value: new Color(lightColor) },
          uRimColor: { value: new Color(atmosphere.color) },
        },
      }),
    [kind, seed, lightDir, lightColor, atmosphere.color],
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame((_, delta) => {
    material.uniforms.uTime!.value += delta
    if (meshRef.current) meshRef.current.rotation.y += delta * spin
  })

  return (
    <group position={position} rotation={[0, 0, tilt]}>
      <mesh ref={meshRef} material={material}>
        <sphereGeometry args={[radius, segments, segments / 2]} />
      </mesh>
      <Atmosphere
        radius={radius}
        color={atmosphere.color}
        lightDir={lightDir}
        thickness={atmosphere.thickness}
        strength={atmosphere.strength}
      />
    </group>
  )
}
