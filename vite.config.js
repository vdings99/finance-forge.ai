import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import blogLoader from './src/blog-loader.js'

export default defineConfig({
  plugins: [blogLoader(), react(), tailwindcss()],
})
