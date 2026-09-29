import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { LinearSRGBColorSpace, ShaderMaterial, SRGBColorSpace, Vector3, type Mesh } from 'three'
import { SOLAR } from '../layout'
import { Atmosphere } from './Atmosphere'

const vertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
  vUv = uv;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const fragment = /* glsl */ `
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uClouds;
uniform vec3 uSunDir;
uniform float uTime;
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
  vec3 N = normalize(vWorldNormal);
  vec3 L = normalize(uSunDir);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float ndl = dot(N, L);
  float dayMix = smoothstep(-0.12, 0.22, ndl);

  vec3 day = texture2D(uDay, vUv).rgb;
  float lights = texture2D(uNight, vUv).r;
  float cloud = texture2D(uClouds, vUv + vec2(uTime * 0.0015, 0.0)).r;
  cloud = smoothstep(0.12, 0.9, cloud);

  float ocean = smoothstep(0.015, 0.09, day.b - day.r);
  vec3 H = normalize(L + V);
  float glint = pow(max(dot(N, H), 0.0), 90.0) * ocean * (1.0 - cloud) * dayMix;

  vec3 lit = day * max(ndl, 0.0) * 1.35 + vec3(1.0, 0.95, 0.88) * glint * 1.4;
  vec3 night = vec3(1.0, 0.68, 0.36) * pow(lights, 1.6) * 1.8 * (1.0 - cloud * 0.85);
  vec3 col = mix(night, lit, dayMix);
  col = mix(col, vec3(0.92, 0.94, 0.97) * max(ndl, 0.0) * 1.05, cloud * 0.85 * dayMix);

  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * smoothstep(-0.2, 0.5, ndl);
  col += vec3(0.3, 0.55, 1.0) * rim * 0.9;
  gl_FragColor = vec4(col, 1.0);
}
`

const SUN_DIR = new Vector3(...SOLAR.sunDirection).normalize().toArray() as [number, number, number]

export function Earth() {
  const meshRef = useRef<Mesh>(null)
  const { day, night, clouds } = useTexture({
    day: '/textures/earth_day.webp',
    night: '/textures/earth_night.webp',
    clouds: '/textures/earth_clouds.webp',
  })

  useEffect(() => {
    day.colorSpace = SRGBColorSpace
    night.colorSpace = LinearSRGBColorSpace
    clouds.colorSpace = LinearSRGBColorSpace
    for (const t of [day, night, clouds]) {
      t.anisotropy = 8
      t.needsUpdate = true
    }
  }, [day, night, clouds])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uDay: { value: day },
          uNight: { value: night },
          uClouds: { value: clouds },
          uSunDir: { value: new Vector3(...SUN_DIR) },
          uTime: { value: 0 },
        },
      }),
    [day, night, clouds],
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame((_, delta) => {
    material.uniforms.uTime!.value += delta
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.002
  })

  const { position, radius } = SOLAR.earth
  return (
    <group position={position} rotation={[0, 0, 0.18]}>
      {/* Start with Indonesia facing the camera. */}
      <mesh ref={meshRef} material={material} rotation={[0, -2.77, 0]}>
        <sphereGeometry args={[radius, 128, 64]} />
      </mesh>
      <Atmosphere radius={radius} color="#6fa8ff" lightDir={SUN_DIR} thickness={0.025} strength={1.6} />
    </group>
  )
}
