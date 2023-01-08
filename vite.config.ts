import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasmPack from 'vite-plugin-wasm-pack'
import { wasmPackHmr } from 'vite-wasm-pack-hmr'
import analyze from 'rollup-plugin-visualizer'

export default defineConfig({
  build: {
    minify: false,
  },
  plugins: [
    // react({ jsxImportSource: '@welldone-software/why-did-you-render' }),
    react(),
    wasmPack(['./dom-logo']),
    wasmPackHmr() as any,
    analyze(),
  ],
})
