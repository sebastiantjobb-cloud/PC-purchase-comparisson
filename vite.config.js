import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const isSingleFile = process.env.VITE_SINGLE_FILE === 'true';

export default defineConfig({
  // base path for GitHub Pages (repo name)
  base: isSingleFile ? './' : '/PC-purchase-comparisson/',
  plugins: isSingleFile
    ? [react(), viteSingleFile()]
    : [react()],
  build: {
    target: 'esnext',
    ...(isSingleFile ? {
      assetsInlineLimit: 100000000,
      cssCodeSplit: false,
    } : {}),
  },
})
