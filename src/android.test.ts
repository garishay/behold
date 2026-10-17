// @vitest-environment node
// The Android shell (Gate 17, #68): `android/twa-manifest.json`, the config Bubblewrap makes the
// Play app from, held to the web manifest as the build writes it — the file Bubblewrap reads at
// `init` — and to A1's table as amended (#68); the site's asset links, which vouch for the app
// (68c); and `android/listing.md`, the store listing's words, held to Play's limits and to the
// game's own copy. The build is Vite's own, run once with the app's config into a folder of its
// own, as the privacy page's test runs it.
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
  packageId: string
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

/** A statement of the site's asset links, as Digital Asset Links reads one. */
interface Statement {
  relation: string[]
  target: { namespace: string; package_name: string; sha256_cert_fingerprints: string[] }
}

/** The site's asset links, at the one address Chrome looks for them, the domain's root (A4). */
const ASSET_LINKS = 'public/.well-known/assetlinks.json'

/**
 * The four certificates the asset links name, in their order (A3), pinned as posted on #68 (#12
 * [Q29]). A key reset changes the file and this list together.
 */
const FINGERPRINTS = [
  // Play's three app signing keys, as the owner posted them (issuecomment-6241826406)
  '3C:26:07:1C:C8:E0:90:52:3C:AB:35:95:E2:42:0E:34:01:98:C6:AE:0A:DA:CA:B1:E1:B5:69:C8:C2:5A:67:60',
  '2E:79:F9:3D:CD:5D:33:5D:BF:55:FE:88:4E:B2:24:3C:95:F2:26:97:C9:06:80:B5:67:0B:02:E0:93:97:D9:72',
  '11:4E:98:71:FB:70:9F:B7:BA:5E:40:51:29:79:AE:AD:97:D5:99:19:EA:58:06:92:7D:17:B7:5E:D1:DE:E0:FA',
  // the upload key's, as the owner posted it (issuecomment-6240555530)
  '21:2E:8B:89:5D:B5:0E:6C:22:09:2F:4F:73:C5:73:29:F1:F9:76:71:16:52:F8:EB:17:0F:4B:58:C0:8A:D5:38',
]

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

describe('the site’s asset links (Gate 17 A3 and A4, 68c)', () => {
  const statements = (): Statement[] => JSON.parse(readFileSync(ASSET_LINKS, 'utf8'))

  it('vouch for the shell’s package alone, to open every page of the site', () => {
    expect(statements()).toEqual([
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: config.packageId,
          sha256_cert_fingerprints: expect.any(Array),
        },
      },
    ])
  })

  // Play's three app signing keys, as its App integrity page lists them, so an install from Play
  // verifies on any Android version; and the upload key, so a build signed on the owner's PC
  // verifies too (A3). Each is posted on #68.
  it('name four certificates, each by its SHA-256 in pairs of upper-case hex', () => {
    const [{ target }] = statements()
    expect(target.sha256_cert_fingerprints).toHaveLength(4)
    expect(new Set(target.sha256_cert_fingerprints).size).toBe(4)
    for (const fingerprint of target.sha256_cert_fingerprints)
      expect(fingerprint).toMatch(/^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/)
  })

  it('name the four certificates posted on #68, in their order, and no other', () => {
    expect(statements()[0].target.sha256_cert_fingerprints).toEqual(FINGERPRINTS)
  })

  it('are written to the site’s root by the build, as they stand', () => {
    expect(readFileSync(join(out, '.well-known', 'assetlinks.json'), 'utf8')).toBe(
      readFileSync(ASSET_LINKS, 'utf8'),
    )
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
