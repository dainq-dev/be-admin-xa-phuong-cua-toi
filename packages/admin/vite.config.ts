import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react'
          }
          // Radix UI components
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix'
          }
          // UI utilities
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/tailwind-merge') || id.includes('node_modules/clsx') || id.includes('node_modules/class-variance-authority')) {
            return 'vendor-ui'
          }
          // Form & validation
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform') || id.includes('node_modules/zod')) {
            return 'vendor-form'
          }
          // DnD kit
          if (id.includes('node_modules/@dnd-kit')) {
            return 'vendor-dnd'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
    ],
  },
})
