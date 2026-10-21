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
const deploy = readFileSync('.github/workflows/deploy.yml', 'utf8')
const wrangler = readFileSync('worker/wrangler.jsonc', 'utf8')

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
  // under five hundred verses (review round 1, #31), eleven since #12 [Q17], which the registry
  // test holds to that bound with the passage coming in. The service is asked first, so each
  // reveal online reaches it and is reported, and the copy shows when it can't answer (Gate 33 A2).
  it('caches a passage the Worker returned, at most eleven for thirty days, asking first', () => {
    const rule = /\{\s*urlPattern: (\/[^\n]*\/),\s*handler: '(\w+)',([^}]*\}[^}]*)\}/.exec(
      config.slice(config.indexOf("cacheName: 'cases'")),
    )
    expect(rule).not.toBeNull()
    const [, pattern, handler, options] = rule!
    const matches = new RegExp(pattern.slice(1, -1))
    const worker = 'https://behold-passages.garishay.workers.dev'
    expect(matches.test(`${worker}/passage?translation=NIV&book=1KI&chapter=21`)).toBe(true)
    expect(matches.test(`${worker}/passage?translation=NIV&book=1SA&chapter=17&from=4&to=4`)).toBe(
      true,
    )
    expect(matches.test(`${worker}/other?book=1KI`)).toBe(false)
    expect(matches.test('https://behold-esv.garishay.workers.dev/passage?book=1KI')).toBe(false)
    expect(matches.test('https://elsewhere.workers.dev/passage?book=1KI&chapter=21')).toBe(false)
    expect(matches.test('/cases/vineyard/gate.jpg')).toBe(false)
    expect(handler).toBe('NetworkFirst')
    expect(options).toMatch(/networkTimeoutSeconds: 3,/)
    expect(options).toMatch(/cacheName: 'passages'/)
    expect(options).toMatch(/maxEntries: 11,/)
    expect(options).toMatch(/maxAgeSeconds: 30 \* 24 \* 60 \* 60/)
  })
})

describe('the stylesheet’s ruled measure, a margin above the inset (Gate 03 [6])', () => {
  // The bar is the case screen's foot since #24, so the margin moves from the bank to it.
  it('keeps the bar clear of the gesture zone: a margin above the safe-area inset', () => {
    const bar = /\.bar \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(bar).toMatch(/padding:[^;]*calc\(24px \+ env\(safe-area-inset-bottom\)\)/)
  })

  // The privacy policy's link is the cases page's last tap target, so the page's foot keeps its
  // margin above the inset, where `max()` let a phone's inset swallow it (Gate 19 A4, #9).
  it('keeps the cases page’s foot clear of the gesture zone, its link 16 px above the inset', () => {
    const screen = /\.screen \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(screen).toMatch(/padding:[^;]*calc\(16px \+ env\(safe-area-inset-bottom\)\)/)
  })
})

// API.Bible's terms (§12): a passage's text can't be selected, and a print leaves it out (Gate 33
// A5). jsdom neither selects nor prints, so the two rules are pinned as text against removal.
describe('the passage’s text, not freely copied (Gate 33 A5)', () => {
  it('can’t be selected, and leaves a print', () => {
    const text = /\n\.passage p \{([^}]*)\}/.exec(css)?.[1] ?? ''
    const print = /@media print \{\s*\.passage p \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(text).toMatch(/-webkit-user-select: none;\s+user-select: none;\s*$/)
    expect(print).toMatch(/display: none;/)
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
  // A lesson's words in their row are set as every mark's are (#159).
  it('a mark’s words wrap balanced, so step 5’s two sentences take a line each', () => {
    const label = /\n\.coach \.label,\n\.said-row \.label \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(label).toMatch(/text-wrap: balance;/)
  })

  it('a card’s line under the brief wraps pretty, so the mountain’s note leaves no word alone', () => {
    const how = /\n\.card \.how \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(how).toMatch(/text-wrap: pretty;/)
  })

  // The owner's ruling on the redrafted part 3 (#131): measured in Roboto and this machine's font.
  // Each part is a box of its own, so a line breaks between parts, and inside one only where it is
  // longer than the line, as at a phone's largest text (#152).
  it('a line of finds wraps only between its parts, each part kept whole where it fits a line', () => {
    const part = /\n\.dock \.found span \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(part).toMatch(/display: inline-block;/)
    expect(part).not.toMatch(/white-space: nowrap;/)
  })
})

// A mark's words are placed by the room they are given, a number place.ts holds; this keeps it the
// label's own: three of its lines, 15 px at 1.3, inside its 8 px of padding (#77).
describe('the room a mark’s words are given (#77)', () => {
  it('is three of the label’s lines and its padding, by the stylesheet’s numbers', () => {
    const label = /\n\.coach \.label,\n\.said-row \.label \{([^}]*)\}/.exec(css)?.[1] ?? ''
    const size = Number(/font-size: (\d+)px;/.exec(label)?.[1])
    const line = Number(/line-height: ([\d.]+);/.exec(label)?.[1])
    const pad = Number(/padding: (\d+)px \d+px;/.exec(label)?.[1])
    expect(2 * pad + 3 * size * line).toBeCloseTo(words, 6)
  })
})

// A lesson's words take a row of their own under Solve's account (#159): the row is tested, and
// that it takes its height from the account and lies over the mark's dim is the stylesheet's,
// pinned as text against removal; the audit of every mark on Solve is its evidence.
describe('the lesson’s row (#159)', () => {
  it('takes its height from the account, and lies over the mark’s dim', () => {
    const row = /\n\.said-row \{([^}]*)\}/.exec(css)?.[1] ?? ''
    const dim = Number(/\n\.coach \{[^}]*z-index: (\d+);/.exec(css)?.[1])
    expect(row).toMatch(/flex: none;/)
    expect(row).toMatch(/position: relative;/)
    expect(Number(/z-index: (\d+);/.exec(row)?.[1])).toBeGreaterThan(dim)
  })
})

// The valley's failed close rings what it found wrong; the class is tested, and the ring it draws
// is the stylesheet's, pinned as text against removal: the screens are its evidence (#77). The
// ring is heavier than a slot's line, and a face that fits shows its ✓ as a blank does, and the
// order beside its question (#102).
describe('the ring on a slot a failed close found wrong (#77)', () => {
  it('is drawn on the account’s blanks and on the faces', () => {
    const blank = /\n\.scroll \.slot\.is-wrong \{([^}]*)\}/.exec(css)?.[1] ?? ''
    const face = /\n\.face \.slot\.is-wrong \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(blank).toMatch(/box-shadow: 0 0 0 3px var\(--wine\);/)
    expect(face).toMatch(
      /border-color: var\(--t-action\);\s+box-shadow: 0 0 0 2px var\(--t-action\);/,
    )
  })

  it('a face that fits shows its ✓ beside the name, and the order beside its question', () => {
    const right =
      /\n\.face \.slot\.is-right::after,\n\.app h2\.is-right::after \{([^}]*)\}/.exec(css)?.[1] ??
      ''
    expect(right).toMatch(/content: '\\2713';\s+margin-left: 0\.3em;\s+color: var\(--right\);/)
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

// At a phone's largest font the case screen's boxes hold text twice its size (#152): what outgrows
// its box scrolls in it, and nothing to tap leaves the screen. jsdom lays nothing out, so each
// box's rule is pinned as text, against removal; the audit of every screen at 115% to 200% and the
// phone are their evidence.
describe('the case screen at the largest font (#152)', () => {
  const rule = (selector: string) =>
    new RegExp(`\\n${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`).exec(
      css,
    )?.[1] ?? ''

  // The row is raised, not the card: a WebView from before July 2024 makes the row a stacking
  // context, which no z-index inside it can lift past the dock ([Q34] on #12).
  it('lays the brief’s card over the dock and the bar by raising its row, no taller than the screen, its words scrolling above Start', () => {
    expect(rule('.stage-wrap')).toMatch(/z-index: var\(--z, auto\);/)
    const card = rule('.card')
    expect(card).not.toMatch(/z-index/)
    expect(card).toMatch(/max-height: calc\(100svh - 24px\);/)
    expect(card).toMatch(/transform: translateY\(calc\(-50% \+ var\(--shift, 0px\)\)\);/)
    expect(rule('.card .words')).toMatch(/overflow-y: auto;/)
  })

  it('keeps the dock room for a line of caption, its More, and three lines of finds', () => {
    expect(rule('.app')).toMatch(
      /--dock: max\(104px, calc\(\(21em \+ 3 \* 18em\) \/ 16 \+ 22px\)\);/,
    )
    expect(rule('.dock .said')).toMatch(/min-height: calc\(1\.4em \* 15 \/ 16\);/)
  })

  it('raises Solve’s badge over the tab’s top edge as its text grows, clear of the count', () => {
    expect(rule('.tab .new')).toMatch(/top: calc\(25px - 2em\);/)
  })

  it('scrolls a caption opened past the picture’s row, More over the whole of it', () => {
    expect(rule('.dock .whole')).toMatch(/overflow-y: auto;/)
    expect(rule('.dock .whole > div')).toMatch(/position: relative;/)
  })

  // Gate 36 A4 as ruled: Less stays on show at the foot of an opened caption whose words scroll.
  it('keeps Less at the foot of an opened caption whose words scroll', () => {
    const less = rule('.dock .whole .more span')
    expect(less).toMatch(/position: sticky;/)
    expect(less).toMatch(/bottom: 0;/)
  })

  it('wraps the picker onto a second row', () => {
    expect(rule('.moment-picker')).toMatch(/flex-wrap: wrap;/)
  })

  it('scrolls a paper taller than the screen from its top', () => {
    expect(rule('.modal:not(.sheet)')).toMatch(/overflow-y: auto;/)
    expect(rule('.modal:not(.sheet) > .paper')).toMatch(/margin: auto;/)
  })

  it('sets fewer faces, order slots, and pictures to a row, so Solve never scrolls sideways', () => {
    const third = /repeat\(auto-fit, minmax\(max\(4em, \(100% - 20px\) \/ 3\), 1fr\)\)/
    expect(rule('.faces')).toMatch(third)
    expect(rule('.order')).toMatch(third)
    expect(rule('.tiles')).toMatch(
      /repeat\(auto-fit, minmax\(max\(7\.5em, \(100% - 10px\) \/ 2\), 1fr\)\)/,
    )
    expect(css).toMatch(/\n\.face \.slot,\n\.oslot,\n\.tile \{\s+overflow-wrap: anywhere;\s+\}/)
  })

  it('sets the title’s name by how it fits the column', () => {
    expect(css).toMatch(/\n\.title h1 \{\s+font-size: calc\(60px \* var\(--fit, 1\)\);\s+\}/)
  })
})

// Restart's question is a modal alert dialog (#153): nothing outside it is reached while it shows.
// The screen under it is inert, and an update's toast, outside the game's page, waits it out
// unseen. jsdom lays nothing out, so the toast's rule is pinned as text; Chrome's accessibility
// tree is its evidence.
describe('Restart’s question (#153)', () => {
  it('hides an update’s toast while it shows', () => {
    expect(css).toMatch(/\n:root:has\(\.question\) \.toast \{\s+visibility: hidden;\s+\}/)
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

  // Under the row, a failed close's count and what is left to find take two lines of the bank's
  // head, and the words give that room back, so the account keeps eight lines at the floor (#24,
  // ruling [2]; #95).
  it('keeps its height under the row when its head takes two lines', () => {
    const bank = /\n\.bank \{([^}]*)\}/.exec(css)?.[1] ?? ''
    const under = /\n\.submit-row \+ \.bank \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(bank).toMatch(/display: flex;\s+flex-direction: column;/)
    expect(under).toMatch(/max-height: 150px;/)
  })
})

// The close's order ring and a hint's found marks are classes the tests read; how they look is the
// stylesheet's, pinned as text against removal, and the screens are their evidence (#95).
describe('the close’s order ring and the hint’s found marks (#95)', () => {
  it('rings the order whole in the faces’ red', () => {
    const order = /\n\.order\.is-wrong \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(order).toMatch(/box-shadow: 0 0 0 3px var\(--t-action\);/)
  })

  it('marks a found thing in gold, taking no tap', () => {
    const found = /\n\.stage \.found \{([^}]*)\}/.exec(css)?.[1] ?? ''
    const ring = /\n\.stage \.found circle \{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(found).toMatch(/pointer-events: none;/)
    expect(ring).toMatch(/stroke: var\(--gold\);/)
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

// Where the game is served is deploy configuration, which no test runs: the Pages build, its
// artifact, and the origins the Worker answers, pinned as text against removal. The live site and
// the phone check on the day of the move are their evidence (Gate 17 A4, as amended; 68a, #68).
describe('the game at play.beholdgame.com (68a, #68)', () => {
  it('is built for the root of its own origin, with no base from the config or the deploy', () => {
    expect(config).not.toMatch(/^ {2}base:/m)
    expect(deploy).not.toMatch(/PAGES_BASE|--base/)
  })

  it('keeps dot-folders in the Pages artifact, where the asset links live (68c)', () => {
    const upload = deploy.slice(deploy.indexOf('actions/upload-pages-artifact'))
    expect(upload.slice(0, upload.indexOf('\n\n'))).toMatch(/^\s+include-hidden-files: true$/m)
  })

  // The dev server is not one since Gate 33 A9: a dev shell names it to a local Worker.
  it('is answered by the Worker, as is its old address, for a copy installed there', () => {
    const origins = /"ORIGINS": "([^"]*)"/.exec(wrangler)?.[1].split(' ')
    expect(origins).toEqual(['https://play.beholdgame.com', 'https://garishay.github.io'])
  })
})

// The Worker reads the registry for the passages its store keeps (04c, #3): a merge that changes a
// case deploys the Worker too, or a new case's passage would never reach the store.
describe('the Worker’s deploy (04c, #3)', () => {
  it('runs on a merge that touches the cases, as on one that touches the Worker', () => {
    const workflow = readFileSync('.github/workflows/deploy-worker.yml', 'utf8')
    const paths = /\n {4}paths:\n((?: {6}.*\n)+)/.exec(workflow)?.[1] ?? ''
    expect(paths).toMatch(/^ {6}- worker\/\*\*$/m)
    expect(paths).toMatch(/^ {6}- src\/cases\/\*\*$/m)
  })
})
