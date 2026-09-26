import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // The Pages deploy serves the site from /<repository>/ (Gate 01 A4); the workflow passes the
  // path. Dev, tests, and a bare build stay at `/`, so nothing that pins a URL moves.
  base: process.env.PAGES_BASE ?? '/',
  plugins: [
    react(),
    // The PWA shell (Gate 01 A2). `prompt`: a new version waits until the player taps the
    // "Update available" toast, never reloading mid-case — `autoUpdate` would reload the app the
    // moment a deploy lands. The manifest's start_url and scope default to `base`; the icons are
    // the committed placeholders from `npm run icons`, precached with the bundle.
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.png'],
      // The case pictures are fetched when a case opens and kept from then on (Gate 02 A5), so a
      // played case stays offline; they are not precached, so the install stays the shell. The
      // worker claims the page as soon as it first activates, so a case opened on the first visit
      // is cached through the rule too (review round 2, #20); a new version still waits for the
      // tap, since skipWaiting stays off.
      workbox: {
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /\/cases\/[^/]+\/[^/]+\.jpg$/,
            handler: 'CacheFirst',
            options: { cacheName: 'cases', expiration: { maxEntries: 200 } },
          },
          // A passage the reveal fetched through the proxy (#3) is kept too, so a case once
          // closed reads offline: at most eight passages, a month each — within the ESV's
          // allowance of five hundred verses stored locally (Gate 04 A4). An error is never
          // cached; the rule keeps only a reply that came back whole.
          {
            urlPattern: /^https:\/\/behold-esv\.[^/]+\.workers\.dev\/passage\?/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'passages',
              expiration: { maxEntries: 8, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
      manifest: {
        name: 'Behold: Bible Mystery Game',
        short_name: 'Behold',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#232A3D',
        background_color: '#1B2033',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    // The Worker's tests run here too, on Node, so the test job holds the proxy as it holds the app.
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'scripts/**/*.test.ts', 'worker/src/**/*.test.ts'],
  },
})
