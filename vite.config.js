import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Two HTML entries, one app bundle: design.html only carries the /design title
    // and link-preview tags (vercel.json rewrites /design and /design/* to it).
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        design: fileURLToPath(new URL('./design.html', import.meta.url))
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5001',
      '/go/': 'http://127.0.0.1:5001'
    }
  }
})
