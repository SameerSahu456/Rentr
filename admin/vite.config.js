import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 4000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      },
      '/saleor': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/saleor/, ''),
      },
    },
  },
})
