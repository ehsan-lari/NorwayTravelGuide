import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // In dev: /recommend → http://localhost:8000/recommend
      '/recommend': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/destinations': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/weather': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
