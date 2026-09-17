import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../assets/react',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: 'src/main.tsx',
    },
  },
  server: {
    port: 5173,
    cors: true,
    origin: 'http://127.0.0.1:5173',
    proxy: {
      '/api': 'http://127.0.0.1:8080',
      '/jsonrpc.php': 'http://127.0.0.1:8080',
    },
  },
})
