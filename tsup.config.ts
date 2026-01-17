import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/**/*.ts',
    'bin/**/*.ts',
    '!src/scripts/**/*.ts',
    '!src/tests/**/*.ts'
  ],
  format: ['cjs'],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  outDir: 'dist',
  target: 'node18',
  platform: 'node',
  bundle: false,
  skipNodeModulesBundle: true,
  treeshake: false,
  shims: true,
  keepNames: true,
});
