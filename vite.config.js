import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({movie_app
  base: '/movie_app/', 
  plugins: [react(), tailwindcss()],
})