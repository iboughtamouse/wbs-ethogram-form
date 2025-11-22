import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),

    // Gzip compression for static assets
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Only compress files larger than 1KB
      deleteOriginFile: false,
    }),

    // Brotli compression for modern browsers (better compression than gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],

  // esbuild configuration
  // Only remove console.log in production (keeps console.error, console.warn for debugging)
  esbuild: {
    pure: mode === 'production' ? ['console.log'] : [],
    drop: mode === 'production' ? ['debugger'] : [],
  },

  build: {
    // Build configuration philosophy:
    // - Keep it simple: Vite's defaults are well-optimized
    // - Manual optimization only where it provides clear benefit
    // - Avoid premature optimization that adds complexity
    //
    // When to consider more optimization:
    // - Total bundle size >500KB (currently ~250KB)
    // - Vendor chunk >200KB (currently ~90KB)
    // - Build time >10s (currently ~7s)
    // - Lighthouse performance score <90 (currently ~95)

    // Target modern browsers (ES2020+)
    // Supports: Chrome 87+, Firefox 78+, Safari 14+, Edge 88+
    target: 'es2020',

    // Source maps configuration
    // 'hidden' generates source maps but doesn't reference them in bundle
    // Good for production error tracking without exposing maps to users
    sourcemap: 'hidden',

    // Rollup options for code splitting and chunk optimization
    rollupOptions: {
      output: {
        // Simplified chunking strategy for small-to-medium apps
        // Philosophy: Let Vite's auto-chunking handle most cases, manually split only when beneficial
        manualChunks: (id) => {
          // ExcelJS is huge (930KB) and lazy-loaded via dynamic import in OutputPreview.jsx
          // Keeping it separate ensures it never blocks the initial load
          if (id.includes('node_modules/exceljs')) {
            return 'vendor-exceljs';
          }

          // All other node_modules go into a single vendor chunk
          // For a small app, this is simpler and avoids unnecessary HTTP requests
          // If the vendor chunk grows >200KB, consider splitting React separately
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },

        // Asset file naming for better caching
        assetFileNames: (assetInfo) => {
          // Images
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          // CSS
          if (/\.css$/i.test(assetInfo.name)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          // Other assets
          return 'assets/[name]-[hash][extname]';
        },

        // JS chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },

    // Increase chunk size warning limit (we expect ExcelJS to be large)
    chunkSizeWarningLimit: 600,

    // CSS code splitting - enabled by default, but explicit for clarity
    cssCodeSplit: true,

    // Minification: esbuild is Vite's default and fastest option
    // No need to change unless you hit specific edge cases
    minify: 'esbuild',
  },

  // Pre-bundling optimization for development
  // Vite auto-detects most dependencies; only specify if you have issues
  optimizeDeps: {
    include: [
      'react-select', // Has complex ESM/CJS structure, pre-bundle for faster dev
      // exceljs excluded - it's dynamically imported, no need to pre-bundle
    ],
  },
}));
