import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,       
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/tests/setup.ts'],
    fileParallelism: false,
    pool: "threads",
    maxWorkers: 1,
    isolate: false
  }
})