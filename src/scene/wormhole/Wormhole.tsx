import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { DoubleSide, Matrix3, ShaderMaterial, Vector3 } from 'three'
import { SOLAR } from '../layout'
import { noiseGLSL } from '../shaders/noise'
import { skyGLSL } from '../shaders/sky'

/** The mesh is larger than the throat so the lensing halo can blend into the background. */
const HALO_SCALE = 1.9

const vertex = /* glsl */ `
varying vec3 vWorldPos;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const fragment = /* glsl */ `
precision highp float;
uniform vec3 uCenter;
uniform float uThroat;
uniform float uHalo;
uniform mat3 uOtherSky;
varying vec3 vWorldPos;
${noiseGLSL}
${skyGLSL}

vec3 rotateToward(vec3 axis, vec3 dir, float angle) {
  vec3 perp = dir - axis * dot(dir, axis);
  float len = length(perp);
  if (len < 1e-5) return axis;
  perp /= len;
  return normalize(axis * cos(angle) + perp * sin(angle));
}

void main() {
  vec3 V = normalize(vWorldPos - cameraPosition);
  vec3 toCenter = uCenter - cameraPosition;
  float dist = length(toCenter);
  vec3 axis = toCenter / dist;

  // Inside the throat: the whole view is the other side.
  if (dist <= uThroat * 1.02) {
    vec3 o = uOtherSky * V;
    gl_FragColor = vec4(sky(o) * 1.3 + vec3(1.0, 0.72, 0.42) * pow(max(dot(o, vec3(0.0, 0.0, -1.0)), 0.0), 60.0) * 2.0, 1.0);
    return;
  }

  float theta = acos(clamp(dot(V, axis), -1.0, 1.0));
  float thetaThroat = asin(clamp(uThroat / dist, 0.0, 1.0));
  float thetaHalo = asin(clamp(uHalo / dist, 0.0, 1.0));
  float s = theta / thetaThroat;

  vec3 col;
  float alpha = 1.0;
  if (s < 1.0) {
    // Fisheye view of the far galaxy, with Gargantua's glow near the middle.
    float phi = pow(s, 0.8) * 2.4;
    vec3 o = uOtherSky * rotateToward(axis, V, phi);
    col = sky(o) * 1.35;
    col += vec3(1.0, 0.7, 0.4) * exp(-s * s * 18.0) * 0.9;
    col *= smoothstep(1.0, 0.9, s) * 0.6 + 0.4;
    col += vec3(0.75, 0.85, 1.0) * exp(-(1.0 - s) * 26.0) * 0.8;
  } else {
    // Our side of space, lensed around the throat: beta = theta - thetaE^2 / theta.
    float thetaE = thetaThroat * 1.08;
    float beta = theta - thetaE * thetaE / theta;
    vec3 src = rotateToward(axis, V, beta);
    col = sky(src) * 1.15;
    col += vec3(0.75, 0.85, 1.0) * exp(-(s - 1.0) * 22.0) * 0.5;
    alpha = 1.0 - smoothstep(thetaThroat * 1.35, thetaHalo, theta);
  }
  gl_FragColor = vec4(col, alpha);
}
`

export function Wormhole() {
  const { position, radius } = SOLAR.wormhole

  const material = useMemo(() => {
    // A different orientation of the procedural sky stands in for the other galaxy.
    const otherSky = new Matrix3().set(0.36, 0.48, -0.8, -0.8, 0.6, 0, 0.48, 0.64, 0.6)
    return new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uCenter: { value: new Vector3(...position) },
        uThroat: { value: radius },
        uHalo: { value: radius * HALO_SCALE },
        uOtherSky: { value: otherSky },
        uPixelAngle: { value: 0.0006 },
      },
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    })
  }, [position, radius])

  useEffect(() => () => material.dispose(), [material])

  useFrame(({ camera, size }) => {
    const fov = (camera as { fov?: number }).fov ?? 45
    material.uniforms.uPixelAngle!.value = (fov * Math.PI) / 180 / size.height
  })

  return (
    <mesh position={position} material={material} renderOrder={5}>
      <sphereGeometry args={[radius * HALO_SCALE, 96, 48]} />
    </mesh>
  )
}
