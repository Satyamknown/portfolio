import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The dev API (npm run dev:api) listens on 5001 unless PORT says otherwise; API_PORT points the
// proxy at the same place.
const api = `http://127.0.0.1:${process.env.API_PORT || 5001}`

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
      '/api': api,
      '/go/': api
    }
  }
})
