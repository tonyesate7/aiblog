import { defineConfig } from 'vite'
import pages from '@hono/vite-cloudflare-pages'

export default defineConfig({
  plugins: [pages()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './src/styles/input.css'
      }
    }
  },
  css: {
    postcss: './postcss.config.js'
  }
})
