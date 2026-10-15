// @vitest-environment node
// The privacy page as the build ships it (#9, [Q19]): Vite's own build, run once with the app's
// config into a folder of its own, so the plugin's place in the config and Workbox's precache are
// what is tested, where `page.test.ts` reads the page as `page()` writes it. The icons' precache
// (#10, Gate 18 A5, [Q21]) is read from the same build, since the build is the test's cost.
/// <reference types="node" />
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { page } from './page.ts'

const out = mkdtempSync(join(tmpdir(), 'behold-build-'))
beforeAll(async () => {
  await build({
    configFile: 'vite.config.ts',
    logLevel: 'silent',
    build: { outDir: out, emptyOutDir: true },
  })
}, 60_000)
afterAll(() => rmSync(out, { recursive: true, force: true }))

describe('the privacy page as the build ships it (#9, [Q19])', () => {
  it('is emitted at privacy/index.html, as page() writes it, and precached', () => {
    const html = readFileSync(join(out, 'privacy/index.html'), 'utf8')
    expect(html).toBe(page('/', readFileSync('src/privacy/page.css', 'utf8')))
    expect(readFileSync(join(out, 'sw.js'), 'utf8')).toMatch(/["']privacy\/index\.html["']/)
  })
})

describe('the icons as the build precaches them (#10, Gate 18 A5)', () => {
  it('precaches the two the pages link, and none of the manifest’s', () => {
    const sw = readFileSync(join(out, 'sw.js'), 'utf8')
    const icons = [...sw.matchAll(/["']icons\/([\w.-]+)["']/g)].map((m) => m[1])
    // The favicon, and since #133 the iPhone's 180 in the 192's place.
    expect(icons.sort()).toEqual(['apple-touch-icon-180.png', 'favicon-48.png'])
  })
})
