import { useFBO } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import {
  HalfFloatType,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  type PerspectiveCamera,
} from 'three'
import { settingsFor } from '../../lib/quality'
import { useJourney } from '../../store/useJourney'
import { BLACK_HOLE, SOLAR } from '../layout'
import { blackholeFragment, blackholeVertex } from './blackholeShader'

/** Beyond this distance the hole is skipped and only the sky is drawn. */
const HOLE_RANGE = 2000

const compositeVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`

/** Catmull-Rom upscale in 9 bilinear taps: keeps the thin photon ring crisp at reduced render scale. */
const compositeFragment = /* glsl */ `
uniform sampler2D uTex;
uniform vec2 uTexSize;
varying vec2 vUv;
vec4 sampleCatmullRom(vec2 uv) {
  vec2 samplePos = uv * uTexSize;
  vec2 texPos1 = floor(samplePos - 0.5) + 0.5;
  vec2 f = samplePos - texPos1;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 offset12 = w2 / w12;
  vec2 texPos0 = (texPos1 - 1.0) / uTexSize;
  vec2 texPos3 = (texPos1 + 2.0) / uTexSize;
  vec2 texPos12 = (texPos1 + offset12) / uTexSize;
  vec4 result = vec4(0.0);
  result += texture2D(uTex, vec2(texPos0.x, texPos0.y)) * w0.x * w0.y;
  result += texture2D(uTex, vec2(texPos12.x, texPos0.y)) * w12.x * w0.y;
  result += texture2D(uTex, vec2(texPos3.x, texPos0.y)) * w3.x * w0.y;
  result += texture2D(uTex, vec2(texPos0.x, texPos12.y)) * w0.x * w12.y;
  result += texture2D(uTex, vec2(texPos12.x, texPos12.y)) * w12.x * w12.y;
  result += texture2D(uTex, vec2(texPos3.x, texPos12.y)) * w3.x * w12.y;
  result += texture2D(uTex, vec2(texPos0.x, texPos3.y)) * w0.x * w3.y;
  result += texture2D(uTex, vec2(texPos12.x, texPos3.y)) * w12.x * w3.y;
  result += texture2D(uTex, vec2(texPos3.x, texPos3.y)) * w3.x * w3.y;
  return max(result, vec4(0.0));
}
void main() {
  gl_FragColor = sampleCatmullRom(vUv);
}
`

function createRayMarchPass() {
  const material = new ShaderMaterial({
    vertexShader: blackholeVertex,
    fragmentShader: blackholeFragment,
    uniforms: {
      uCamPos: { value: new Vector3() },
      uInvProj: { value: null },
      uCamWorld: { value: null },
      uTime: { value: 0 },
      uSteps: { value: 200 },
      uHole: { value: 1 },
      uDiskInner: { value: BLACK_HOLE.diskInner },
      uDiskOuter: { value: BLACK_HOLE.diskOuter },
      uBeaming: { value: 0.32 },
      uDiskGain: { value: 3.2 },
      uSunDir: { value: new Vector3(...SOLAR.sunDirection).normalize() },
      uPixelAngle: { value: 0.0005 },
    },
    depthTest: false,
    depthWrite: false,
  })
  const scene = new Scene()
  const quad = new Mesh(new PlaneGeometry(2, 2), material)
  quad.frustumCulled = false
  scene.add(quad)
  return { scene, camera: new OrthographicCamera(-1, 1, 1, -1, 0, 1), material }
}

/**
 * Gargantua: ray-marched into a reduced-resolution target, then drawn as the scene background.
 * Everything else in the scene renders in front of it.
 */
export function BlackHole() {
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)
  const tier = useJourney((s) => s.tier)
  const reduced = useJourney((s) => s.reducedMotion)
  const settings = settingsFor(tier)

  const width = Math.max(2, Math.round(size.width * dpr * settings.bhScale))
  const height = Math.max(2, Math.round(size.height * dpr * settings.bhScale))
  const target = useFBO(width, height, {
    type: HalfFloatType,
    depthBuffer: false,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
  })

  const pass = useMemo(createRayMarchPass, [])
  const composite = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: compositeVertex,
        fragmentShader: compositeFragment,
        uniforms: { uTex: { value: null }, uTexSize: { value: new Vector2(1, 1) } },
        depthTest: false,
        depthWrite: false,
      }),
    [],
  )

  useEffect(
    () => () => {
      pass.material.dispose()
      composite.dispose()
    },
    [pass, composite],
  )

  useFrame(({ gl, camera }, delta) => {
    const cam = camera as PerspectiveCamera
    const u = pass.material.uniforms
    u.uCamPos!.value.copy(cam.position)
    u.uInvProj!.value = cam.projectionMatrixInverse
    u.uCamWorld!.value = cam.matrixWorld
    u.uTime!.value += delta * (reduced ? 0.25 : 1)
    u.uSteps!.value = settings.bhSteps
    u.uHole!.value = cam.position.length() < HOLE_RANGE ? 1 : 0
    u.uPixelAngle!.value = ((cam.fov * Math.PI) / 180 / height) * 1.0

    gl.setRenderTarget(target)
    gl.render(pass.scene, pass.camera)
    gl.setRenderTarget(null)
    composite.uniforms.uTex!.value = target.texture
    composite.uniforms.uTexSize!.value.set(width, height)
  })

  return (
    <mesh renderOrder={-1000} frustumCulled={false} material={composite}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
