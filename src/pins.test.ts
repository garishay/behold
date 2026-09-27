// The test reads two source files from disk under Vitest, which runs on Node; the app project
// declares no Node types, so this file brings them in itself, as the registry test does.
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { zoomPill } from './cases/spots.ts'

/*
 * Two things the tests cannot exercise, pinned as text (review round 4, #20): a Workbox option
 * has no unit test short of a build, and jsdom lays nothing out. These hold the shape — the
 * service worker's cache rule and its claim on first activation, and the bar's bottom padding —
 * against removal, not their behaviour; the build and the phone are the evidence for that.
 */
const config = readFileSync('vite.config.ts', 'utf8')
const css = readFileSync('src/index.css', 'utf8')

describe('the service worker’s configuration (Gate 03 A3)', () => {
  it('claims the page when it first activates, and still waits for the tap to take over', () => {
    expect(config).toMatch(/clientsClaim: true/)
    expect(config).toMatch(/registerType: 'prompt'/)
    expect(config).not.toMatch(/skipWaiting: true/)
  })

  it('caches a case picture on its first request, and nothing else', () => {
    const rule = /urlPattern: (\/.*\/),/.exec(config)
    expect(rule).not.toBeNull()
    const pattern = new RegExp(rule![1].slice(1, -1))
    expect(pattern.test('/cases/vineyard/gate.jpg')).toBe(true)
    expect(pattern.test('/behold/cases/valley/valley.jpg')).toBe(true)
    expect(pattern.test('/cases/valley/d1.jpg')).toBe(true)
    expect(pattern.test('/icons/icon-192.png')).toBe(false)
    expect(pattern.test('/cases/vineyard/notes.txt')).toBe(false)
    expect(config).toMatch(/handler: 'CacheFirst'/)
    expect(config).toMatch(/cacheName: 'cases'/)
  })

  // A passage read once reads offline: the rule's matcher, strategy, and the limits Gate 04 A4 set
  // under the ESV's five hundred verses stored locally (review round 1, #31).
  it('caches a passage the Worker returned, at most eight for thirty days, and nothing else', () => {
    const rule = /\{\s*urlPattern: (\/[^\n]*\/),\s*handler: '(\w+)',([^}]*\}[^}]*)\}/.exec(
      config.slice(config.indexOf("cacheName: 'cases'")),
    )
    expect(rule).not.toBeNull()
    const [, pattern, handler, options] = rule!
    const matches = new RegExp(pattern.slice(1, -1))
    const worker = 'https://behold-esv.garishay.workers.dev'
    expect(matches.test(`${worker}/passage?translation=ESV&book=1KI&chapter=21`)).toBe(true)
    expect(matches.test(`${worker}/passage?translation=ESV&book=1SA&chapter=17&from=4&to=4`)).toBe(
      true,
    )
    expect(matches.test(`${worker}/other?book=1KI`)).toBe(false)
    expect(matches.test('https://elsewhere.workers.dev/passage?book=1KI&chapter=21')).toBe(false)
    expect(matches.test('/cases/vineyard/gate.jpg')).toBe(false)
    expect(handler).toBe('CacheFirst')
    expect(options).toMatch(/cacheName: 'passages'/)
    expect(options).toMatch(/maxEntries: 8,/)
    expect(options).toMatch(/maxAgeSeconds: 30 \* 24 \* 60 \* 60/)
  })
})

describe('the stylesheet’s one ruled measure (Gate 03 [6])', () => {
  // The bar is the case screen's foot since #24, so the margin moves from the bank to it.
  it('keeps the bar clear of the gesture zone: a margin above the safe-area inset', () => {
    const bar = /\.bar \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(bar).toMatch(/padding:[^;]*calc\(24px \+ env\(safe-area-inset-bottom\)\)/)
  })
})

describe('the picture’s spots (#37)', () => {
  it('draw no tap highlight, so a tap never shows a spot’s box', () => {
    const rule = /\.stage svg,\s*\.stage rect \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(rule).toMatch(/-webkit-tap-highlight-color: transparent/)
  })
})

describe('the Zoom pill (#24, ruling [1])', () => {
  it('sits where check (l) counts it: the stylesheet’s box is spots.ts’s', () => {
    const rule = /\n\.pill \{([^}]*)\}/.exec(css)?.[1] ?? ''
    const px = (name: string) => Number(new RegExp(`(?:^|\\s)${name}: (\\d+)px`).exec(rule)?.[1])
    expect(['left', 'top', 'width', 'height'].map(px)).toEqual([...zoomPill])
  })
})
