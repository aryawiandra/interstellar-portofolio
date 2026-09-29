import { PerformanceMonitor, useProgress } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { settingsFor } from '../lib/quality'
import { useJourney } from '../store/useJourney'
import { BlackHole } from './blackhole/BlackHole'
import { CameraRig } from './CameraRig'
import { keyframes } from './choreography'
import { Effects } from './Effects'
import { Worlds } from './Worlds'

function ProgressReporter() {
  const progress = useProgress((s) => s.progress)
  useEffect(() => useJourney.getState().setProgress(progress), [progress])
  return null
}

const first = keyframes[0]!

export default function Experience() {
  const tier = useJourney((s) => s.tier)
  const degrade = useJourney((s) => s.degrade)
  const settings = settingsFor(tier)

  return (
    <Canvas
      flat
      dpr={[settings.dpr[0], settings.dpr[1]]}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false }}
      camera={{ fov: first.fov, near: 0.05, far: 20000, position: [...first.position] }}
    >
      <color attach="background" args={['#000']} />
      <PerformanceMonitor onDecline={degrade} flipflops={2} bounds={() => [40, 70]} />
      <ProgressReporter />
      <CameraRig />
      <BlackHole />
      <Suspense fallback={null}>
        <Worlds />
      </Suspense>
      <Effects />
    </Canvas>
  )
}
