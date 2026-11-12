import { defineConfig } from 'vite';

export default defineConfig({
  base: '/MauritiusInfo/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
  },
});
