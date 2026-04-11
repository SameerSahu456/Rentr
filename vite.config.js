import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  envDir: '../',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': `http://localhost:${process.env.BACKEND_PORT || 8000}`
    }
  }
})
