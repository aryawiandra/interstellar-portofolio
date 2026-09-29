import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import { useRef } from 'react'
import { Vector3, type PerspectiveCamera } from 'three'
import { sampleCamera } from '../lib/cameraPath'
import { journey, useJourney } from '../store/useJourney'
import { keyframes } from './choreography'

/** Camera moves further than this in one frame are cuts, not flights. */
const CUT_DISTANCE = 400
const SMOOTH_TIME = 0.28
const PARALLAX = 0.012
/** Aspect ratios at or above this frame shots as designed; narrower screens swing toward the subject. */
const WIDE_ASPECT = 1.2
const PORTRAIT_RANGE = 0.65
const PORTRAIT_FOV_BOOST = 0.5

/** 0 on landscape screens, 1 on tall phones. */
const portraitAmount = (aspect: number) => Math.min(1, Math.max(0, (WIDE_ASPECT - aspect) / PORTRAIT_RANGE))

export function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const lookAt = useRef(new Vector3())
  const goalPos = useRef(new Vector3())
  const goalTarget = useRef(new Vector3())
  const right = useRef(new Vector3())
  const up = useRef(new Vector3())
  const focus = useRef(new Vector3())

  useFrame(({ pointer, size }, delta) => {
    const sample = sampleCamera(keyframes, journey.index, journey.local)
    journey.veil = sample.veil
    journey.veilStyle = sample.veilStyle

    const portrait = portraitAmount(size.width / Math.max(size.height, 1))
    const fov = sample.fov * (1 + PORTRAIT_FOV_BOOST * portrait)
    goalPos.current.set(...sample.position)
    goalTarget.current.set(...sample.target).lerp(focus.current.set(...sample.focus), portrait * 0.9)

    // Subtle pointer parallax, scaled by how far the camera is from what it looks at.
    if (!useJourney.getState().reducedMotion) {
      const reach = goalPos.current.distanceTo(goalTarget.current) * PARALLAX
      right.current.setFromMatrixColumn(camera.matrixWorld, 0)
      up.current.setFromMatrixColumn(camera.matrixWorld, 1)
      goalPos.current.addScaledVector(right.current, pointer.x * reach * 1.4)
      goalPos.current.addScaledVector(up.current, pointer.y * reach * 0.8)
    }

    const isCut = journey.snap || sample.veil > 0.6 || camera.position.distanceTo(goalPos.current) > CUT_DISTANCE
    if (isCut) {
      camera.position.copy(goalPos.current)
      lookAt.current.copy(goalTarget.current)
      camera.fov = fov
      journey.snap = false
    } else {
      const dt = Math.min(delta, 0.1)
      easing.damp3(camera.position, goalPos.current, SMOOTH_TIME, dt)
      easing.damp3(lookAt.current, goalTarget.current, SMOOTH_TIME, dt)
      camera.fov += (fov - camera.fov) * Math.min(1, dt * 4)
    }

    camera.lookAt(lookAt.current)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
  })

  return null
}
