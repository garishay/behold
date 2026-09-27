import react from '@vitejs/plugin-react'
import { hash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

/**
 * Each case picture's hash, the first eight hex digits of its file's SHA-256, by `<case>/<file>`
 * under `root` (#45). A picture's address carries it, so a changed file is an address no phone has
 * cached, and an unchanged one keeps its address and its cached copy.
 */
export function pictureHashes(root: string) {
  const hashes: Record<string, string> = {}
  for (const id of readdirSync(root))
    for (const file of readdirSync(`${root}/${id}`))
      hashes[`${id}/${file}`] = hash('sha256', readFileSync(`${root}/${id}/${file}`)).slice(0, 8)
  return hashes
}

// https://vite.dev/config/
export default defineConfig({
  // The Pages deploy serves the site from /<repository>/ (Gate 01 A4); the workflow passes the
  // path. Dev, tests, and a bare build stay at `/`, so nothing that pins a URL moves.
  base: process.env.PAGES_BASE ?? '/',
  // The pictures' hashes, read from the files when the config loads, so the build, the dev
  // server, and the tests stamp each address from the picture as it is (#45).
  define: { __PICTURE_HASHES__: JSON.stringify(pictureHashes('public/cases')) },
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
      // tap, since skipWaiting stays off. A picture is kept by its address, which carries its
      // file's hash (#45): a changed picture is a new address, fetched once and kept, and the copy
      // it supersedes stays until the 200-entry limit evicts it. The pattern still takes a bare
      // address, which a page left open on an older version asks for.
      workbox: {
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /\/cases\/[^/]+\/[^/]+\.jpg(\?v=[0-9a-f]+)?$/,
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
