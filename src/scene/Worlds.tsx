import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { sub3, type Vec3 } from '../lib/easing'
import { useJourney } from '../store/useJourney'
import { BLACK_HOLE, ENDURANCE, PLANETS } from './layout'
import { Earth } from './planets/Earth'
import { ProceduralPlanet } from './planets/ProceduralPlanet'
import { Saturn } from './planets/Saturn'
import { Endurance } from './ship/Endurance'
import { Wormhole } from './wormhole/Wormhole'

const towardHole = (p: Vec3): Vec3 => sub3(BLACK_HOLE.center, p)

/** Marks the experience as loaded once every suspended asset has resolved and a frame has rendered. */
function Ready() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
    const id = requestAnimationFrame(() => requestAnimationFrame(() => useJourney.getState().setLoaded(true)))
    return () => cancelAnimationFrame(id)
  }, [invalidate])
  return null
}

export function Worlds() {
  return (
    <>
      {/* Solar system */}
      <Earth />
      <Saturn />
      <Wormhole />

      {/* Gargantua system */}
      {Object.values(PLANETS).map((p) => (
        <ProceduralPlanet
          key={p.kind}
          kind={p.kind}
          position={p.position}
          radius={p.radius}
          seed={p.seed}
          lightDir={towardHole(p.position)}
        />
      ))}
      <Endurance />
      <pointLight position={BLACK_HOLE.center} intensity={1.5} decay={0} color="#ffd6a8" />
      <directionalLight position={[ENDURANCE.position[0] + 4, ENDURANCE.position[1] + 3, ENDURANCE.position[2] + 8]} intensity={0.85} color="#e6ebff" />
      <ambientLight intensity={0.05} />
      <Ready />
    </>
  )
}
