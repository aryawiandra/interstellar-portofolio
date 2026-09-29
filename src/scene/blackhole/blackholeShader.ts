import { noiseGLSL } from '../shaders/noise'
import { skyGLSL } from '../shaders/sky'

export const MAX_STEPS = 320

export const blackholeVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

/**
 * Ray-marched Schwarzschild black hole with a thin accretion disk.
 * Units: Schwarzschild radius r_s = 1, hole at the origin.
 * Photon paths use the pseudo-Newtonian form a = -1.5 h^2 x / r^5, which reproduces
 * the exact null-geodesic shape (h = |x × v| is conserved).
 */
export const blackholeFragment = /* glsl */ `
precision highp float;
#define MAX_STEPS ${MAX_STEPS}
#define PI 3.14159265359

uniform vec3 uCamPos;
uniform mat4 uInvProj;
uniform mat4 uCamWorld;
uniform float uTime;
uniform int uSteps;
uniform float uHole;
uniform float uDiskInner;
uniform float uDiskOuter;
uniform float uBeaming;
uniform float uDiskGain;
uniform vec3 uSunDir;

varying vec2 vUv;

${noiseGLSL}
${skyGLSL}

vec3 diskPalette(float t) {
  t = clamp(t, 0.0, 1.2);
  vec3 ember = vec3(0.36, 0.08, 0.02);
  vec3 orange = vec3(1.0, 0.42, 0.11);
  vec3 gold = vec3(1.0, 0.74, 0.42);
  vec3 white = vec3(1.0, 0.95, 0.88);
  vec3 c = mix(ember, orange, smoothstep(0.0, 0.32, t));
  c = mix(c, gold, smoothstep(0.32, 0.68, t));
  return mix(c, white, smoothstep(0.68, 1.05, t));
}

float diskNoise(vec3 hit, float r, float phase) {
  float omega = pow(r, -1.5);
  float ang = atan(hit.z, hit.x) - phase * omega * 3.0;
  vec3 q = vec3(r * 1.3, cos(ang) * 2.4, sin(ang) * 2.4);
  float broad = fbm(q, 4);
  float streak = fbm(vec3(r * 6.0, cos(ang) * 1.1, sin(ang) * 1.1) + 4.0, 3);
  return clamp(0.5 + 0.5 * (0.62 * broad + 0.38 * streak), 0.0, 1.0);
}

vec4 shadeDisk(vec3 hit, vec3 rayDir) {
  float r = length(hit.xz);
  float edge = smoothstep(uDiskInner * 0.96, uDiskInner * 1.1, r) * (1.0 - smoothstep(uDiskOuter * 0.5, uDiskOuter, r));
  if (edge <= 0.0) return vec4(0.0);

  // Two phases blended so differential rotation never winds the texture up forever.
  const float PERIOD = 24.0;
  float t0 = fract(uTime / PERIOD);
  float t1 = fract(uTime / PERIOD + 0.5);
  float w = abs(t0 - 0.5) * 2.0;
  float n = mix(diskNoise(hit, r, t0 * PERIOD), diskNoise(hit, r, t1 * PERIOD), w);

  float temp = pow(uDiskInner / r, 1.05);

  // Relativistic beaming, kept subtle as in the film.
  vec3 vdir = normalize(vec3(-hit.z, 0.0, hit.x));
  float beta = clamp(sqrt(0.5 / r), 0.0, 0.7);
  float gamma = inversesqrt(1.0 - beta * beta);
  float doppler = 1.0 / (gamma * (1.0 - beta * dot(vdir, -rayDir)));
  float beaming = mix(1.0, pow(doppler, 3.0), uBeaming);
  float redshift = sqrt(max(1.0 - 1.0 / r, 0.0));

  float intensity = temp * temp * (0.3 + 1.35 * n) * beaming * redshift;
  vec3 col = diskPalette(temp * (0.72 + 0.4 * n)) * intensity * uDiskGain;
  float alpha = edge * clamp(0.3 + 0.9 * n, 0.0, 1.0);
  return vec4(col * alpha, alpha);
}

vec3 sunGlow(vec3 dir) {
  float c = max(dot(dir, normalize(uSunDir)), 0.0);
  return vec3(1.0, 0.93, 0.82) * (pow(c, 4000.0) * 40.0 + pow(c, 180.0) * 0.8 + pow(c, 12.0) * 0.05);
}

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  vec4 view = uInvProj * vec4(ndc, 1.0, 1.0);
  vec3 dir = normalize((uCamWorld * vec4(normalize(view.xyz / view.w), 0.0)).xyz);
  vec3 pos = uCamPos;
  float r0 = length(pos);

  if (uHole < 0.5 || r0 > 900.0) {
    gl_FragColor = vec4(sky(dir) + sunGlow(dir), 1.0);
    return;
  }

  vec3 vel = dir;
  vec3 hvec = cross(pos, vel);
  float h2 = dot(hvec, hvec);
  float escapeR = max(r0 * 1.02, uDiskOuter * 2.5);
  vec3 col = vec3(0.0);
  float alpha = 0.0;
  bool captured = false;

  for (int i = 0; i < MAX_STEPS; i++) {
    if (i >= uSteps) break;
    float r = length(pos);
    float dt = clamp(0.085 * r, 0.02, 4.0) * clamp((r - 1.0) * 1.1, 0.16, 1.0);
    vec3 prev = pos;

    vec3 acc = -1.5 * h2 * pos / pow(r, 5.0);
    vel += acc * (0.5 * dt);
    pos += vel * dt;
    float rn = length(pos);
    acc = -1.5 * h2 * pos / pow(rn, 5.0);
    vel += acc * (0.5 * dt);

    if (prev.y * pos.y < 0.0) {
      float t = prev.y / (prev.y - pos.y);
      vec4 d = shadeDisk(mix(prev, pos, t), normalize(vel));
      col += (1.0 - alpha) * d.rgb;
      alpha += (1.0 - alpha) * d.a;
      if (alpha > 0.995) break;
    }
    if (rn < 1.0) { captured = true; break; }
    if (rn > escapeR && dot(pos, vel) > 0.0) break;
  }

  if (!captured && alpha < 0.995) col += (1.0 - alpha) * sky(normalize(vel));
  gl_FragColor = vec4(col, 1.0);
}
`
