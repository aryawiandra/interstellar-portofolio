# Trajectory: Arya Utomo's portfolio

A single-page, scroll-driven 3D portfolio. The camera flies from Gargantua to Earth, past Saturn, through the wormhole, around four mission planets and the Endurance, and ends by plunging into the event horizon. Each chapter is one part of the CV.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # unit + component tests (Vitest)
npm run test:coverage
npm run e2e          # Playwright journey tests (starts its own dev server on :5174)
npm run build        # type-check + production build into dist/
npm run preview      # serve dist/ on :4173
```

## Editing the copy

All text lives in typed data files. There's no copy inside components.

| File | What it holds |
|---|---|
| `src/content/profile.ts` | name, headline, summary, education, contact links, Origin/Transit/Horizon copy |
| `src/content/chapters.ts` | chapter order, nav labels, scroll length (`heightVh`), HUD telemetry lines |
| `src/content/missions.ts` | the four experience chapters |
| `src/content/fleet.ts` | leadership table and counters |
| `src/content/systems.ts` | projects and toolkit |
| `src/content/signals.ts` | achievements and certifications |

`src/content/content.test.ts` guards the content:
- It fails if a phone number ever appears.
- It fails if the contact channels change.
- It fails if HUD counts (for example `CERTIFICATIONS  12`) drift from the data.

## How it works

- **Scroll → chapter.** `src/ui/useScrollDriver.ts` runs Lenis smooth scroll and measures each `<section>`. It publishes `{ index, local }` into a non-reactive `journey` object, so scrolling never re-renders React. Menu jumps to distant chapters teleport behind a short blackout instead of flying past everything.
- **Chapter → camera.** `src/scene/choreography.ts` has one keyframe per chapter. `src/lib/cameraPath.ts` holds the pose, then either *flies* to the next keyframe or *jumps* behind a veil (a black fade, or the wormhole flare). `src/scene/CameraRig.tsx` damps toward that pose and adds pointer parallax. On portrait screens it swings toward each keyframe's `focus`.
- **Gargantua.** `src/scene/blackhole/blackholeShader.ts` ray-marches photon paths in the Schwarzschild metric (`a = -1.5·h²·x/r⁵`, r_s = 1).
  - Each ray's crossings of a thin accretion disk are accumulated. That produces the lensed halo above and below the hole, and the photon ring.
  - The disk has Keplerian differential rotation, mild Doppler beaming and gravitational dimming.
  - The procedural star field is lensed too.
  - It renders into a reduced-resolution target and is upscaled with a Catmull-Rom filter.
- **Worlds.** Earth uses NASA textures. Saturn, its rings and the four mission planets are procedural GLSL. The wormhole shows a fisheye view of the far galaxy with a lensed rim.
- **Quality tiers.** `src/lib/quality.ts` picks high, medium or low from the device, which sets DPR, ray-march steps and render scale. drei's `PerformanceMonitor` steps down a tier if the frame rate drops.
- **Fallbacks.**
  - Without WebGL2, or if the scene throws (`SceneBoundary`), a CSS rendition of Gargantua replaces the canvas.
  - All copy is real DOM text, and `<noscript>` carries a text CV.
  - `prefers-reduced-motion` turns off smooth scroll, typing, and reveal animations.

## Credits

- Earth imagery: NASA Visible Earth (Blue Marble, Black Marble), public domain.
- Simplex noise after Ashima Arts / Stefan Gustavson (MIT). Hash functions after Dave Hoskins (MIT).
- Fonts: Geist and Geist Mono (OFL).
