// The test reads two source files from disk under Vitest, which runs on Node; the app project
// declares no Node types, so this file brings them in itself, as the registry test does.
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/*
 * Two things the tests cannot exercise, pinned as text (review round 4, #20): a Workbox option
 * has no unit test short of a build, and jsdom lays nothing out. These hold the shape — the
 * service worker's cache rule and its claim on first activation, and the bank's bottom padding —
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
})

describe('the stylesheet’s one ruled measure (Gate 03 [6])', () => {
  it('keeps the bank’s chips clear of the gesture zone: a margin above the safe-area inset', () => {
    const bank = /\.bank \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(bank).toMatch(/position: sticky/)
    expect(bank).toMatch(/padding:[^;]*calc\(24px \+ env\(safe-area-inset-bottom\)\)/)
  })
})
