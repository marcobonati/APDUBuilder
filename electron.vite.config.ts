import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

/** Minified output without license banners or source maps: smaller app.asar, faster startup. */
const build = {
  minify: 'esbuild' as const,
  sourcemap: false,
  reportCompressedSize: false
}
const esbuild = { legalComments: 'none' as const }

export default defineConfig({
  main: { build, esbuild },
  preload: { build, esbuild },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    // Loaded from disk: a single ~500 KB chunk is fine, no need to warn about it.
    build: { ...build, cssMinify: true, modulePreload: false, chunkSizeWarningLimit: 1024 },
    esbuild,
    plugins: [react()]
  }
})
