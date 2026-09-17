import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// The bundle is emitted into ../assets/react so nginx/PHP-FPM serve it as a
// plain static asset. Filenames are stable (no content hash) because
// app/Template/react/shell.php cache-busts them with filemtime().
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: fileURLToPath(new URL('../assets/react', import.meta.url)),
    emptyOutDir: true,
    manifest: false,
    sourcemap: false,
    rollupOptions: {
      input: fileURLToPath(new URL('./src/main.tsx', import.meta.url)),
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: (info) =>
          info.names.some((n) => n.endsWith('.css')) ? 'app.css' : 'static/[name][extname]',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    // Proxy PHP endpoints to a local `php -S` / nginx instance during `npm run dev`.
    proxy: {
      '/jsonrpc.php': 'http://localhost:8080',
      '/index.php': 'http://localhost:8080',
      '/assets/css': 'http://localhost:8080',
      '/assets/img': 'http://localhost:8080',
      '/assets/fonts': 'http://localhost:8080',
    },
  },
})
