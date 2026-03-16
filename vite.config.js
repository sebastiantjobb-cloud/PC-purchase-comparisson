import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Dual-mode build: set VITE_SINGLE_FILE=true for offline single-file HTML,
// leave unset for GitHub Pages deployment (uses repo base path)
const isSingleFile = process.env.VITE_SINGLE_FILE === 'true';

export default defineConfig({
  // Pages mode: /PC-purchase-comparisson/ prefix for GitHub Pages asset URLs
  // Single-file mode: ./ relative paths (self-contained HTML)
  base: isSingleFile ? './' : '/PC-purchase-comparisson/',
  plugins: isSingleFile
    ? [react(), viteSingleFile()]  // inline all assets into one HTML
    : [react()],                   // normal Vite chunking for Pages
  // Strip the OpenRouter key from public single-file builds so it never ends up in the HTML
  ...(isSingleFile ? {
    define: { 'import.meta.env.VITE_OPENROUTER_KEY': '""' },
  } : {}),
  build: {
    target: 'esnext',
    ...(isSingleFile ? {
      assetsInlineLimit: 100000000,  // inline everything under 100MB
      cssCodeSplit: false,           // bundle all CSS together
    } : {}),
  },
})
