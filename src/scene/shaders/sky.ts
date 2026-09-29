/**
 * Procedural deep-space sky sampled by direction: crisp point stars plus a faint,
 * dusty galactic band. Requires noiseGLSL. `uPixelAngle` (radians per pixel) keeps
 * stars about one pixel wide at any resolution.
 */
export const skyGLSL = /* glsl */ `
uniform float uPixelAngle;

vec3 starLayer(vec3 dir, float scale, float density, float seed) {
  vec3 p = dir * scale;
  vec3 cell = floor(p);
  vec3 h = hash33(cell + seed);
  if (h.x > density) return vec3(0.0);
  vec3 starPos = 0.25 + 0.5 * hash33(cell + seed + 17.0);
  vec3 d = (p - cell) - starPos;
  d -= dir * dot(d, dir);
  float radius = max(uPixelAngle * scale * 1.1, 0.015);
  float core = smoothstep(radius, 0.0, length(d));
  float brightness = 0.25 + pow(h.y, 8.0) * 9.0;
  vec3 tint = mix(vec3(1.0, 0.84, 0.68), vec3(0.74, 0.85, 1.0), h.z);
  return tint * core * core * brightness;
}

vec3 galaxy(vec3 dir) {
  vec3 pole = normalize(vec3(0.28, 1.0, -0.42));
  float lat = dot(dir, pole);
  float band = exp(-lat * lat / 0.03);
  if (band < 0.002) return vec3(0.0);
  float clouds = fbm(dir * 3.1 + 7.0, 5) * 0.5 + 0.5;
  float dust = smoothstep(0.42, 0.78, fbm(dir * 6.5 - 3.0, 4) * 0.5 + 0.5);
  float core = exp(-lat * lat / 0.006);
  float glow = band * (0.3 + 0.7 * clouds) * (1.0 - 0.8 * dust * core);
  vec3 tint = mix(vec3(0.46, 0.44, 0.46), vec3(0.78, 0.68, 0.56), clouds);
  return tint * glow * 0.075;
}

vec3 sky(vec3 dir) {
  vec3 col = galaxy(dir);
  col += starLayer(dir, 140.0, 0.06, 0.0) * 0.85;
  col += starLayer(dir, 300.0, 0.11, 11.0) * 0.45;
  col += starLayer(dir, 60.0, 0.03, 23.0) * 1.2;
  return col;
}
`
