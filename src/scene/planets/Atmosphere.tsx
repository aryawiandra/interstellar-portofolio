import { useMemo } from 'react'
import { AdditiveBlending, Color, FrontSide, ShaderMaterial, Vector3 } from 'three'
import type { Vec3 } from '../../lib/easing'

const vertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
void main() {
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const fragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uLightDir;
uniform float uStrength;
varying vec3 vNormal;
varying vec3 vWorldPos;
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  float lit = smoothstep(-0.35, 0.55, dot(N, normalize(uLightDir)));
  gl_FragColor = vec4(uColor * fres * lit * uStrength, 1.0);
}
`

interface AtmosphereProps {
  readonly radius: number
  readonly color: string
  readonly lightDir: Vec3
  /** Shell thickness as a fraction of the radius. */
  readonly thickness?: number
  readonly strength?: number
}

/** Fresnel glow shell: a soft limb that brightens on the lit side. */
export function Atmosphere({ radius, color, lightDir, thickness = 0.04, strength = 1.2 }: AtmosphereProps) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uColor: { value: new Color(color) },
          uLightDir: { value: new Vector3(...lightDir).normalize() },
          uStrength: { value: strength },
        },
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
        side: FrontSide,
      }),
    [color, lightDir, strength],
  )

  return (
    <mesh material={material} scale={1 + thickness}>
      <sphereGeometry args={[radius, 96, 48]} />
    </mesh>
  )
}
