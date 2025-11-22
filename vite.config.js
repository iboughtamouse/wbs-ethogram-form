import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { imagetools } from 'vite-imagetools';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Image optimization plugin
    imagetools({
      defaultDirectives: (url) => {
        // Apply optimization to images in the public directory
        if (url.searchParams.has('url')) {
          return new URLSearchParams({
            format: 'webp',
            quality: '85',
          });
        }
        return new URLSearchParams();
      },
    }),

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

  build: {
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
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // React and React-DOM in one vendor chunk
          if (id.includes('node_modules/react')) {
            return 'vendor-react';
          }

          // React-Select in its own chunk
          if (id.includes('node_modules/react-select')) {
            return 'vendor-react-select';
          }

          // ExcelJS is code-split and prefetched in OutputPreview.jsx
          // It loads when OutputPreview mounts (after form completion)
          // This provides instant downloads without bloating initial bundle
          if (id.includes('node_modules/exceljs')) {
            return 'vendor-exceljs';
          }

          // Other node_modules go into a general vendor chunk
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

    // CSS code splitting
    cssCodeSplit: true,

    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
      },
      format: {
        comments: false, // Remove all comments
      },
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-select',
      'prop-types',
      // Note: exceljs excluded since it's dynamically imported
    ],
  },
});
