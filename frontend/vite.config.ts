import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward JSON-RPC calls to the PHP backend (`php -S 127.0.0.1:8080` from repo root).
      '/jsonrpc.php': {
        target: process.env.KANBOARD_URL ?? 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
})
