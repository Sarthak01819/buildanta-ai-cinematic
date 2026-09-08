import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Hashed bundles live under /_app so the unhashed files in /public/assets
    // (fonts, hero media) can carry their own cache rules in vercel.json.
    assetsDir: '_app',
    sourcemap: false,
  },
  server: { port: 5173, strictPort: true },
})
