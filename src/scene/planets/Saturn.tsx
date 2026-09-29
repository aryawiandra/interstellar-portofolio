import { useEffect, useMemo } from 'react'
import { DoubleSide, ShaderMaterial, Vector3 } from 'three'
import { SOLAR } from '../layout'
import { noiseGLSL } from '../shaders/noise'
import { ProceduralPlanet } from './ProceduralPlanet'

const SUN_DIR = new Vector3(...SOLAR.sunDirection).normalize().toArray() as [number, number, number]
const RING_TILT = 0.47

const ringVertex = /* glsl */ `
varying vec3 vLocal;
varying vec3 vWorldPos;
void main() {
  vLocal = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const ringFragment = /* glsl */ `
uniform float uInner;
uniform float uOuter;
uniform vec3 uCenter;
uniform float uPlanetRadius;
uniform vec3 uSunDir;
varying vec3 vLocal;
varying vec3 vWorldPos;
${noiseGLSL}
void main() {
  float r = length(vLocal.xy);
  float t = (r - uInner) / (uOuter - uInner);
  if (t < 0.0 || t > 1.0) discard;

  float fine = snoise(vec3(t * 140.0, 1.3, 2.7)) * 0.5 + 0.5;
  float broad = snoise(vec3(t * 18.0, 7.1, 0.4)) * 0.5 + 0.5;
  float density = mix(0.35, 1.0, broad) * mix(0.6, 1.0, fine);
  density *= smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.93, 1.0, t));
  density *= 1.0 - (1.0 - smoothstep(0.0, 0.018, abs(t - 0.66))) * 0.92;
  density *= mix(0.45, 1.0, smoothstep(0.08, 0.3, t));

  vec3 color = mix(vec3(0.55, 0.49, 0.4), vec3(0.93, 0.87, 0.74), broad * 0.7 + fine * 0.3);

  vec3 L = normalize(uSunDir);
  vec3 oc = vWorldPos - uCenter;
  float b = dot(oc, L);
  float c = dot(oc, oc) - uPlanetRadius * uPlanetRadius;
  float shadow = (b < 0.0 && b * b - c > 0.0) ? 0.12 : 1.0;

  gl_FragColor = vec4(color * 1.2 * shadow, density * 0.92);
}
`

export function Saturn() {
  const { position, radius, ringInner, ringOuter } = SOLAR.saturn

  const ringMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: ringVertex,
        fragmentShader: ringFragment,
        uniforms: {
          uInner: { value: ringInner },
          uOuter: { value: ringOuter },
          uCenter: { value: new Vector3(...position) },
          uPlanetRadius: { value: radius },
          uSunDir: { value: new Vector3(...SUN_DIR) },
        },
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    [position, radius, ringInner, ringOuter],
  )

  useEffect(() => () => ringMaterial.dispose(), [ringMaterial])

  return (
    <group>
      <ProceduralPlanet kind="gas" position={position} radius={radius} seed={3.3} lightDir={SUN_DIR} lightColor="#fff4e6" tilt={RING_TILT} spin={0.02} />
      <group position={position} rotation={[0, 0, RING_TILT]}>
        <mesh material={ringMaterial} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ringInner, ringOuter, 256, 1]} />
        </mesh>
      </group>
    </group>
  )
}
