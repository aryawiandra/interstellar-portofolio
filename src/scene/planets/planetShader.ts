import { noiseGLSL } from '../shaders/noise'

/** Surface kinds understood by the shader. Mission worlds plus Saturn's gas bands. */
export const SURFACE = { desert: 0, ocean: 1, ice: 2, moon: 3, gas: 4 } as const
export type SurfaceKind = keyof typeof SURFACE

export const planetVertex = /* glsl */ `
varying vec3 vObjPos;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
  vObjPos = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

export const planetFragment = /* glsl */ `
precision highp float;
uniform int uKind;
uniform float uSeed;
uniform float uTime;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform vec3 uRimColor;

varying vec3 vObjPos;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;

${noiseGLSL}

float craters(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  float d = 1.0;
  for (int x = -1; x <= 1; x++)
  for (int y = -1; y <= 1; y++)
  for (int z = -1; z <= 1; z++) {
    vec3 g = vec3(float(x), float(y), float(z));
    vec3 r = g + hash33(i + g) - f;
    d = min(d, dot(r, r));
  }
  d = sqrt(d);
  float bowl = smoothstep(0.12, 0.42, d);
  float rim = smoothstep(0.3, 0.38, d) * (1.0 - smoothstep(0.38, 0.5, d));
  return bowl + rim * 0.55;
}

vec3 desert(vec3 p, out float spec) {
  float h = fbm(p * 2.1 + uSeed, 6);
  float ridge = ridged(p * 3.6 + uSeed, 5);
  vec3 sand = vec3(0.8, 0.62, 0.43);
  vec3 rust = vec3(0.56, 0.31, 0.17);
  vec3 dark = vec3(0.2, 0.13, 0.09);
  vec3 c = mix(rust, sand, smoothstep(-0.35, 0.5, h));
  c = mix(c, dark, smoothstep(0.5, 0.85, ridge) * 0.65);
  c *= 0.9 + 0.1 * snoise(p * vec3(46.0, 9.0, 46.0) + uSeed);
  float cloud = smoothstep(0.3, 0.8, fbm(p * 2.8 + vec3(uTime * 0.004, 0.0, 0.0) + 40.0, 4) * 0.5 + 0.5);
  spec = 0.04;
  return mix(c, vec3(0.93, 0.87, 0.8), cloud * 0.4);
}

vec3 ocean(vec3 p, out float spec) {
  float n = fbm(p * 3.0 + uSeed, 5);
  vec3 deep = vec3(0.03, 0.08, 0.12);
  vec3 shallow = vec3(0.16, 0.27, 0.32);
  vec3 c = mix(deep, shallow, smoothstep(-0.45, 0.6, n));
  float lat = dot(p, normalize(vec3(0.25, 1.0, 0.15)));
  float swell = sin((lat + n * 0.05) * 34.0 + uTime * 0.18);
  float wave = smoothstep(0.9, 1.0, swell);
  c = mix(c, vec3(0.72, 0.8, 0.83), wave * 0.6);
  float mist = smoothstep(0.05, 0.85, fbm(p * 2.2 + 9.0 + vec3(0.0, uTime * 0.003, 0.0), 5) * 0.5 + 0.5);
  spec = (1.0 - mist) * 0.9;
  return mix(c, vec3(0.66, 0.7, 0.72), mist * 0.55);
}

vec3 ice(vec3 p, out float spec) {
  float n = fbm(p * 2.7 + uSeed, 6);
  float crack = ridged(p * 5.5 + uSeed, 4);
  vec3 bright = vec3(0.86, 0.9, 0.94);
  vec3 blue = vec3(0.48, 0.6, 0.7);
  vec3 shade = vec3(0.26, 0.32, 0.38);
  vec3 c = mix(blue, bright, smoothstep(-0.4, 0.45, n));
  c = mix(c, shade, smoothstep(0.62, 0.92, crack) * 0.55);
  float shelf = smoothstep(0.25, 0.72, fbm(p * vec3(2.0, 5.5, 2.0) + 30.0, 5) * 0.5 + 0.5);
  spec = 0.25;
  return mix(c, vec3(0.96, 0.97, 0.98), shelf * 0.5);
}

vec3 moon(vec3 p, out float spec) {
  float n = fbm(p * 3.0 + uSeed, 5);
  vec3 c = mix(vec3(0.3, 0.29, 0.28), vec3(0.6, 0.58, 0.56), smoothstep(-0.5, 0.5, n));
  c *= 0.7 + 0.38 * craters(p * 7.0 + uSeed);
  c *= 0.85 + 0.2 * craters(p * 17.0 - uSeed);
  spec = 0.0;
  return c;
}

vec3 gas(vec3 p, out float spec) {
  float lat = p.y;
  float turb = fbm(p * vec3(1.4, 10.0, 1.4) + uSeed, 4);
  float bands = sin(lat * 38.0 + turb * 1.3) * 0.5 + 0.5;
  float fine = sin(lat * 120.0 + turb * 3.0) * 0.5 + 0.5;
  vec3 c = mix(vec3(0.7, 0.58, 0.4), vec3(0.9, 0.81, 0.6), bands);
  c = mix(c, c * 0.88, fine * 0.35);
  c = mix(c, vec3(0.52, 0.56, 0.56), smoothstep(0.78, 0.97, abs(lat)));
  spec = 0.0;
  return c;
}

void main() {
  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 L = normalize(uLightDir);
  float spec = 0.0;
  vec3 albedo;
  if (uKind == 0) albedo = desert(vObjPos, spec);
  else if (uKind == 1) albedo = ocean(vObjPos, spec);
  else if (uKind == 2) albedo = ice(vObjPos, spec);
  else if (uKind == 3) albedo = moon(vObjPos, spec);
  else albedo = gas(vObjPos, spec);

  float ndl = dot(N, L);
  float diffuse = smoothstep(-0.06, 1.0, ndl);
  vec3 H = normalize(L + V);
  float glint = pow(max(dot(N, H), 0.0), 70.0) * spec * step(0.0, ndl);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 4.0) * smoothstep(-0.3, 0.4, ndl);

  vec3 col = albedo * (uLightColor * diffuse * 1.4 + vec3(0.01, 0.012, 0.018));
  col += uLightColor * glint;
  col += uRimColor * rim * 0.5;
  gl_FragColor = vec4(col, 1.0);
}
`
