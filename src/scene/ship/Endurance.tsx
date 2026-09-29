import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import { Object3D, type Group, type InstancedMesh } from 'three'
import { ENDURANCE } from '../layout'

const MODULES = 12
const RING_RADIUS = 1
const SPOKES = 4

/** The Endurance: twelve modules on a ring around a central hub. */
export function Endurance() {
  const groupRef = useRef<Group>(null)
  const modulesRef = useRef<InstancedMesh>(null)
  const spokesRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const dummy = new Object3D()
    const modules = modulesRef.current
    const spokes = spokesRef.current
    if (!modules || !spokes) return

    for (let i = 0; i < MODULES; i++) {
      const a = (i / MODULES) * Math.PI * 2
      dummy.position.set(Math.cos(a) * RING_RADIUS, 0, Math.sin(a) * RING_RADIUS)
      dummy.rotation.set(0, -a, 0)
      dummy.updateMatrix()
      modules.setMatrixAt(i, dummy.matrix)
    }
    modules.instanceMatrix.needsUpdate = true

    for (let i = 0; i < SPOKES; i++) {
      const a = (i / SPOKES) * Math.PI * 2 + Math.PI / MODULES
      dummy.position.set(Math.cos(a) * RING_RADIUS * 0.5, 0, Math.sin(a) * RING_RADIUS * 0.5)
      dummy.rotation.set(0, -a, Math.PI / 2)
      dummy.updateMatrix()
      spokes.setMatrixAt(i, dummy.matrix)
    }
    spokes.instanceMatrix.needsUpdate = true
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.12
  })

  return (
    <group position={ENDURANCE.position} rotation={[0.42, 0.2, -0.18]} scale={ENDURANCE.scale}>
      <group ref={groupRef}>
        <instancedMesh ref={modulesRef} args={[undefined, undefined, MODULES]}>
          <boxGeometry args={[0.2, 0.13, 0.36]} />
          <meshStandardMaterial color="#d9d6d0" metalness={0.55} roughness={0.42} />
        </instancedMesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[RING_RADIUS, 0.028, 10, 96]} />
          <meshStandardMaterial color="#8f8c88" metalness={0.7} roughness={0.35} />
        </mesh>
        <instancedMesh ref={spokesRef} args={[undefined, undefined, SPOKES]}>
          <cylinderGeometry args={[0.012, 0.012, RING_RADIUS, 6]} />
          <meshStandardMaterial color="#8f8c88" metalness={0.7} roughness={0.35} />
        </instancedMesh>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.42, 20]} />
          <meshStandardMaterial color="#e6e3de" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}
