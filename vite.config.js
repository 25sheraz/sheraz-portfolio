import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the build works at a domain root or a sub-path (e.g. GitHub Pages).
  base: './',
  server: { host: true, port: 5173 },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Keep the big, rarely-changing libraries in their own cached chunks.
        manualChunks: { three: ['three'], gsap: ['gsap'] },
      },
    },
  },
});
