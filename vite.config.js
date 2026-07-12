import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// ВАЖНО за GitHub Pages:
// Сайтът се сервира от подпапка https://<потребител>.github.io/<хранилище>/
// затова „base" трябва да съвпада с името на хранилището.
// Ако преименувате хранилището, сменете стойността тук.
const REPO = 'bungalooo'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? `/${REPO}/` : '/'
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
        manifest: {
          name: 'Bungalooo — бунгала по Черноморието',
          short_name: 'Bungalooo',
          description:
            'Сравнение и избор на бунгала по Южното българско Черноморие.',
          lang: 'bg',
          dir: 'ltr',
          theme_color: '#0ea5b7',
          background_color: '#f7fafc',
          display: 'standalone',
          orientation: 'portrait',
          start_url: base,
          scope: base,
          icons: [
            { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icons/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'bungalooo-images',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@supabase')) return 'supabase'
              if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/'))
                return 'react'
            }
          },
        },
      },
    },
  }
})
