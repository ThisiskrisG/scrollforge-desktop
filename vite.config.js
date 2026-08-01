import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'cross-origin-isolation-dev-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Enable cross-origin isolation for dev (required for SharedArrayBuffer / WASM threads)
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          next();
        });
      }
    }
  ],
  build: {
    // keep chunk sizes reasonable; tune as you add features
    chunkSizeWarningLimit: 600
  }
});
