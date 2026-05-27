import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

// Change this to a function that receives the Vite environment context
export default defineConfig(({ command }) => {
  return {
    // Only use the subpath base when building for production
    base: command === 'build' ? '/projects/map/eldenring/' : '/',

    plugins: [
      react(),
      cesium()
    ],
  }
})