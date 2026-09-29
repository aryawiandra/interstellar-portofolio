/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    testTimeout: 15_000,
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/content/**', 'src/store/**', 'src/ui/**', 'src/scene/choreography.ts', 'src/scene/layout.ts'],
      exclude: ['**/*.test.{ts,tsx}', 'src/ui/Loader.tsx'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
})
