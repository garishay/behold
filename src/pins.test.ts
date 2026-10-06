// The test reads two source files from disk under Vitest, which runs on Node; the app project
// declares no Node types, so this file brings them in itself, as the registry test does.
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { zoomPill } from './cases/spots.ts'
import { words } from './player/place.ts'

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
    // Workbox matches the whole URL, query and all, so the stamped address must match too (#45).
    expect(pattern.test('/behold/cases/vineyard/bedchamber.jpg?v=0123abcd')).toBe(true)
    expect(pattern.test('/cases/vineyard/gate.jpg?w=320')).toBe(false)
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

// jsdom lays nothing out, so the two wraps are pinned as text, against removal: the browser's
// reading of every label and the phone are their evidence (#77, review round 1 on #83).
describe('the words that wrap to a shape (#77)', () => {
  it('a mark’s words wrap balanced, so step 5’s two sentences take a line each', () => {
    const label = /\n\.coach \.label \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(label).toMatch(/text-wrap: balance;/)
  })

  it('a card’s line under the brief wraps pretty, so the mountain’s note leaves no word alone', () => {
    const how = /\n\.card \.how \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(how).toMatch(/text-wrap: pretty;/)
  })
})

// A mark's words are placed by the room they are given, a number place.ts holds; this keeps it the
// label's own: three of its lines, 15 px at 1.3, inside its 8 px of padding (#77).
describe('the room a mark’s words are given (#77)', () => {
  it('is three of the label’s lines and its padding, by the stylesheet’s numbers', () => {
    const label = /\n\.coach \.label \{([^}]*)\}/.exec(css)?.[1] ?? ''
    const size = Number(/font-size: (\d+)px;/.exec(label)?.[1])
    const line = Number(/line-height: ([\d.]+);/.exec(label)?.[1])
    const pad = Number(/padding: (\d+)px \d+px;/.exec(label)?.[1])
    expect(2 * pad + 3 * size * line).toBeCloseTo(words, 6)
  })
})

// The valley's failed close rings what it found wrong; the class is tested, and the ring it draws
// is the stylesheet's, pinned as text against removal: the screens are its evidence (#77).
describe('the ring on a slot a failed close found wrong (#77)', () => {
  it('is drawn on the account’s blanks and on the faces', () => {
    const blank = /\n\.scroll \.slot\.is-wrong \{([^}]*)\}/.exec(css)?.[1] ?? ''
    const face = /\n\.face \.slot\.is-wrong \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(blank).toMatch(/box-shadow: 0 0 0 2px var\(--wine\);/)
    expect(face).toMatch(/border-color: var\(--t-action\);/)
  })
})

// A tap a guided step's hold refuses pulses its ring once; the pulse's element is tested, and its
// look is the stylesheet's, pinned as text against removal: the screens are its evidence (#77).
describe('the pulse of a tap the hold refuses (#77)', () => {
  it('grows out of the ring and fades, once, and only fades under reduced motion', () => {
    const pulse = /\n\.coach \.pulse \{([^}]*)\}/.exec(css)?.[1] ?? ''
    const end = /@keyframes pulse \{\s*to \{([^}]*)\}/.exec(css)?.[1] ?? ''
    const still =
      /@media \(prefers-reduced-motion: reduce\) \{[^@]*?\n {2}\.coach \.pulse \{([^}]*)\}/.exec(
        css,
      )?.[1] ?? ''
    expect(pulse).toMatch(/animation: pulse 0\.6s ease-out forwards;/)
    expect(end).toMatch(/opacity: 0;[^}]*transform: scale\(1\.15\);/)
    expect(still).toMatch(/animation-name: arrive;\s*animation-direction: reverse;/)
  })
})

// The brief's card is placed in the picture's row, which the row's own position makes its
// containing block; the card's parent is tested, and this keeps the row positioned (#77).
describe('the picture’s row holds the brief’s card (#77)', () => {
  it('is positioned, so the card centres in it at its whole width', () => {
    const row = /\n\.stage-wrap \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(row).toMatch(/position: relative;/)
  })
})

// jsdom lays nothing out, so 07c's fixed case screen (#24) is pinned as text; the phone is its
// evidence.
describe('the case screen fits the phone (07c, #24)', () => {
  it('is pinned to the screen the phone shows, not sized by a viewport unit', () => {
    const app = /\n\.app \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(app).toMatch(/position: fixed/)
    expect(app).toMatch(/inset: 0/)
    expect(app).not.toMatch(/\d+[sdl]?vh/)
  })
})

// The bank shows three rows of words and the top of a fourth, so the eight things of the valley,
// leading it while a blank waits, are in view whole, and two under the row above it, Close the
// case or a hint on offer, which takes the third row's room; jsdom lays nothing out, so the
// heights are pinned as text, and the measured screens are their evidence (#24, Solve's room).
describe('the bank’s rows (#24)', () => {
  it('shows three rows of words and the top of a fourth, and two under the row above it', () => {
    const chips = /\n\.chips \{([^}]*)\}/.exec(css)?.[1] ?? ''
    const under = /\n\.submit-row \+ \.bank \.chips \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(chips).toMatch(/max-height: 156px;/)
    expect(under).toMatch(/max-height: 108px;/)
  })
})

// The close's order ring is a class the tests read; how it looks is the stylesheet's, pinned as
// text against removal, and the screens are its evidence (#95).
describe('the close’s order ring (#95)', () => {
  it('rings the order whole in the faces’ red', () => {
    const order = /\n\.order\.is-wrong \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(order).toMatch(/box-shadow: 0 0 0 2px var\(--t-action\);/)
  })
})

describe('the sound effects (Gate 10 A6)', () => {
  it('are precached with the shell, so the first tap sounds offline', () => {
    expect(config).toMatch(/includeAssets: \[[^\]]*'audio\/\*\.m4a'[^\]]*\]/)
  })
})

describe('the music (Gate 10 A6)', () => {
  it('caches a cue on its first play by its hashed address, and nothing else', () => {
    const rule = /\{\s*urlPattern: (\/[^\n]*\/),\s*handler: '(\w+)',\s*options: (\{[^\n]*\}),/.exec(
      config.slice(config.indexOf("cacheName: 'passages'")),
    )
    expect(rule).not.toBeNull()
    const [, pattern, handler, options] = rule!
    const matches = new RegExp(pattern.slice(1, -1))
    expect(matches.test('/behold/audio/music/lamentation.m4a?v=0123abcd')).toBe(true)
    expect(matches.test('/audio/music/desert-city.m4a?v=89abcdef')).toBe(true)
    // An effect is precached, and a cue's bare address is not what the app asks for.
    expect(matches.test('/audio/found.m4a')).toBe(false)
    expect(matches.test('/audio/music/lamentation.m4a')).toBe(false)
    expect(handler).toBe('CacheFirst')
    expect(options).toMatch(/cacheName: 'music'/)
  })
})
