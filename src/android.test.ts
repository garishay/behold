// @vitest-environment node
// The Android shell (Gate 17, #68): `android/twa-manifest.json`, the config Bubblewrap makes the
// Play app from, held to the web manifest as the build writes it — the file Bubblewrap reads at
// `init` — and to A1's table as amended (#68); and `android/listing.md`, the store listing's
// words, held to Play's limits and to the game's own copy. The build is Vite's own, run once with
// the app's config into a folder of its own, as the privacy page's test runs it.
/// <reference types="node" />
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, resolve } from 'node:path'
import { build } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ICONS } from '../scripts/generate-icons.ts'
import { cases } from './cases/index.ts'
import { strings } from './strings/en.ts'

/** The web manifest's fields that the config answers to. */
interface WebManifest {
  name: string
  short_name: string
  display: string
  orientation: string
  theme_color: string
  background_color: string
  start_url: string
  scope: string
  icons: { src: string; sizes: string; purpose?: string }[]
}

/** The config as Bubblewrap writes it, the fields read here by name. */
interface Config {
  [field: string]: unknown
  host: string
  name: string
  launcherName: string
  display: string
  orientation: string
  themeColor: string
  backgroundColor: string
  startUrl: string
  iconUrl: string
  maskableIconUrl: string
  webManifestUrl: string
  fullScopeUrl: string
  signingKey: { path: string; alias: string }
}

/**
 * A1's table as amended (#68), row by row: the config `init` wrote, with the rows it writes
 * otherwise set by hand — the bars' colours, notifications, the oldest Android it installs on,
 * the version's name, and the maskable icon. Bubblewrap writes the version's name twice and reads
 * `appVersion`. The navigation bar's divider takes the bar's own colour, so no line shows above
 * the bar (#12 [Q28]): `init` writes it black, its transparent default's alpha dropped.
 */
const TABLE = {
  packageId: 'house.shay.behold',
  host: 'play.beholdgame.com',
  startUrl: '/',
  name: 'Behold: Bible Mystery Game',
  launcherName: 'Behold',
  display: 'standalone',
  orientation: 'portrait',
  themeColor: '#232A3D',
  backgroundColor: '#1B2033',
  navigationColor: '#1B2033',
  themeColorDark: '#232A3D',
  navigationColorDark: '#1B2033',
  navigationDividerColor: '#1B2033',
  navigationDividerColorDark: '#1B2033',
  iconUrl: 'https://play.beholdgame.com/icons/icon-1024.png',
  maskableIconUrl: 'https://play.beholdgame.com/icons/icon-512-maskable-android.png',
  monochromeIconUrl: undefined,
  fallbackType: 'customtabs',
  enableNotifications: false,
  minSdkVersion: 24,
  enableSiteSettingsShortcut: true,
  appVersionCode: 1,
  appVersion: '1.0.0',
  appVersionName: '1.0.0',
  signingKey: { path: '../../behold-keys/upload.keystore', alias: 'upload' },
  // Everything else as `init` writes it: no shortcuts, features, display override, extra
  // origins, or fingerprints.
  shortcuts: [],
  features: {},
  displayOverride: [],
  additionalTrustedOrigins: [],
  fingerprints: [],
}

const config: Config = JSON.parse(readFileSync('android/twa-manifest.json', 'utf8'))

/** The listing's fields by heading, each the `text` block under it, as it goes into Play Console. */
const listing = Object.fromEntries(
  Array.from(
    readFileSync('android/listing.md', 'utf8').matchAll(/^## (.+)\n\n```text\n([^]*?)\n```$/gm),
    ([, heading, text]) => [heading, text] as const,
  ),
)

const out = mkdtempSync(join(tmpdir(), 'behold-shell-'))
let manifest: WebManifest
beforeAll(async () => {
  await build({
    configFile: 'vite.config.ts',
    logLevel: 'silent',
    build: { outDir: out, emptyOutDir: true },
  })
  manifest = JSON.parse(readFileSync(join(out, 'manifest.webmanifest'), 'utf8'))
}, 60_000)
afterAll(() => rmSync(out, { recursive: true, force: true }))

describe('the shell’s config against the web manifest the build writes (#68)', () => {
  it('names the app and shows it as the manifest does', () => {
    expect(config.name).toBe(manifest.name)
    expect(config.launcherName).toBe(manifest.short_name)
    expect(config.display).toBe(manifest.display)
    expect(config.orientation).toBe(manifest.orientation)
  })

  it('colours the app as the manifest does', () => {
    expect(config.themeColor.toUpperCase()).toBe(manifest.theme_color.toUpperCase())
    expect(config.backgroundColor.toUpperCase()).toBe(manifest.background_color.toUpperCase())
  })

  it('reads the manifest at its address on the app’s host, and starts where it starts', () => {
    const address = new URL(config.webManifestUrl)
    expect(address.host).toBe(config.host)
    expect(address.pathname).toBe('/manifest.webmanifest')
    const start = new URL(manifest.start_url, address)
    expect(config.startUrl).toBe(start.pathname + start.search)
    expect(config.fullScopeUrl).toBe(new URL(manifest.scope, address).href)
  })

  it('takes its icon from the manifest’s largest `any` icon, which the splash is drawn from', () => {
    const any = manifest.icons.filter(({ purpose = 'any' }) => purpose.split(' ').includes('any'))
    const largest = any.reduce((a, b) => (parseInt(b.sizes) > parseInt(a.sizes) ? b : a))
    expect(config.iconUrl).toBe(new URL(largest.src, config.webManifestUrl).href)
  })

  // Bubblewrap's launcher lays the maskable image over 91 dp of the 108, where Chrome's install
  // lays it over 82.5, so the Play app has a file of its own, framed for 91 (#68, #133).
  it('takes its maskable icon from a file the icon script frames for it, not Chrome’s', () => {
    const chrome = manifest.icons
      .filter(({ purpose = 'any' }) => purpose.split(' ').includes('maskable'))
      .map(({ src }) => new URL(src, config.webManifestUrl).href)
    expect(chrome).not.toContain(config.maskableIconUrl)
    const { pathname } = new URL(config.maskableIconUrl)
    expect(ICONS.map(({ file }) => file)).toContain(`public${pathname}`)
  })
})

describe('the shell’s config against A1’s table as amended (#68)', () => {
  it.each(Object.entries(TABLE))('says %s is %j', (field, value) => {
    expect(config[field]).toEqual(value)
  })

  it('keeps the upload key outside the repository, and the repository tracks no key', () => {
    const key = resolve('android', config.signingKey.path)
    expect(relative(resolve('.'), key)).toMatch(/^\.\.[\\/]/)
    const keys = execFileSync('git', ['ls-files', '--', '*.keystore', '*.jks'], {
      encoding: 'utf8',
    })
    expect(keys).toBe('')
  })
})

describe('the store listing (Gate 17 A8, #68)', () => {
  const [first, ...season] = cases.map(({ text }) => text.en)

  it('gives Play Console its three fields', () => {
    expect(Object.keys(listing)).toEqual(['App name', 'Short description', 'Full description'])
  })

  it('fits Play’s limits: 30 characters for the name, 80 and 4,000 for the descriptions', () => {
    expect([...listing['App name']].length).toBeLessThanOrEqual(30)
    expect([...listing['Short description']].length).toBeLessThanOrEqual(80)
    expect([...listing['Full description']].length).toBeLessThanOrEqual(4000)
  })

  it('names the app as the manifest does, and gives the title’s line as its short description', () => {
    expect(listing['App name']).toBe(manifest.name)
    expect(listing['Short description']).toBe(strings.line)
  })

  // Each case's PR adds its title and brief (#68, ruled 2026-10-15); the valley teaches the game.
  it('starts the player at the valley, with its brief', () => {
    expect(listing['Full description']).toContain(`${strings.startWithTheValley} ${first.brief}`)
  })

  it.each(season)('lists $title with its brief, word for word', ({ title, brief }) => {
    expect(listing['Full description']).toContain(`${title}\n${brief}`)
  })

  it('names no translation the reveal marks', () => {
    for (const [translation, mark] of Object.entries(strings.translations))
      for (const text of Object.values(listing)) {
        expect(text).not.toMatch(new RegExp(`\\b${translation}\\b`))
        expect(text).not.toContain(mark)
      }
  })

  it('sets every apostrophe of the full description curly, as ruled', () => {
    expect(listing['Full description']).not.toContain("'")
  })
})
