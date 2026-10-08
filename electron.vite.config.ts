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
    build: { ...build, cssMinify: true, modulePreload: false },
    esbuild,
    plugins: [react()]
  }
})
