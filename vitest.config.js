import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    includeSource: ['lib/**/*.{js,mjs}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.{js,mjs}'],
      exclude: ['**/*.test.{js,mjs}', '**/*.spec.{js,mjs}'],
    },
  },
})
