import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.png',
          'apple-touch-icon.png',
          'icon.svg',
          'branding/wasl-islamic-light.webp',
          'branding/wasl-islamic-light.png',
          'branding/wasl-islamic-light.svg',
          'branding/wasl-islamic-dark.webp',
          'branding/wasl-islamic-dark.png',
          'branding/wasl-islamic-dark.svg',
          'branding/wasl-islamic-icon-light.webp',
          'branding/wasl-islamic-icon-light.png',
          'branding/wasl-islamic-icon-light.svg',
          'branding/wasl-islamic-icon-dark.webp',
          'branding/wasl-islamic-icon-dark.png',
          'branding/wasl-islamic-icon-dark.svg',
          'branding/favicon-light.png',
          'branding/favicon-dark.png',
          'branding/apple-touch-icon.png',
          'brand/logo-full.webp',
          'brand/logo-compact.webp',
          'brand/logo-icon.webp',
          'brand/logo-full.png',
          'brand/logo-compact.png',
          'brand/logo-icon.png'
        ],
        manifest: {
          id: '/',
          name: 'وصل الإسلامية - Wasl Islamic Platform',
          short_name: 'وصل الإسلامية',
          description: 'منصة إسلامية رقمية شاملة للقرآن الكريم، الأذكار، مواقيت الصلاة، الأحاديث، والتقويم الهجري.',
          theme_color: '#062e24',
          background_color: '#062e24',
          display: 'standalone',
          orientation: 'portrait',
          dir: 'rtl',
          lang: 'ar',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 25 * 1024 * 1024,
          globIgnores: ['**/test-*.png', '**/sample-*.png'],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/api\.alquran\.cloud\/v1\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'quran-api-cache',
                expiration: {
                  maxEntries: 120,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              urlPattern: /^https:\/\/api\.aladhan\.com\/v1\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'prayer-times-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
              },
            },
            {
              // Do not cache live video streams in service worker (direct to source)
              urlPattern: /^https?:\/\/.*\.(m3u8|ts|m3u|key|mp4|aac)($|\?)/i,
              handler: 'NetworkOnly',
            },
            {
              // Cache channel metadata safely
              urlPattern: /\/api\/channels/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'channels-api-cache',
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: true as const,
      cors: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
