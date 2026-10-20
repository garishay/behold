// @vitest-environment node
// The Android shell (Gate 17, #68): the Play app's own project in `android/`, a WebView that opens
// the game from its site. `android/shell.json`, the config its Gradle build reads, is held to the
// web manifest as the build writes it and to A1's table as ruled for the WebView (#68); the app's
// Android manifest to its one permission and the flags the gate names; the site's asset links,
// which vouch for the app (68c); and `android/listing.md`, the store listing's words, held to
// Play's limits and to the game's own copy. The build is Vite's own, run once with the app's config
// into a folder of its own, as the privacy page's test runs it. The activity's restart, its links,
// and the words it shows of its own are held as written (#151).
/// <reference types="node" />
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cases } from './cases/index.ts'
import { shell, strings } from './strings/en.ts'

/** The web manifest's fields that the config answers to. */
interface WebManifest {
  name: string
  short_name: string
  orientation: string
  theme_color: string
  background_color: string
  start_url: string
}

/** The shell's config as its Gradle build reads it, the fields read here by name. */
interface Config {
  [field: string]: unknown
  packageId: string
  host: string
  startUrl: string
  name: string
  launcherName: string
  orientation: string
  themeColor: string
  backgroundColor: string
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
 * A1's table as ruled for the WebView shell (#68), row by row: the package and the address the
 * app opens, its names, the bars' and the splash's colours as the TWA had them, the oldest Android
 * it installs on and the one it targets, and its version: code 3, the restart's (#151).
 */
const TABLE = {
  packageId: 'house.shay.behold',
  host: 'play.beholdgame.com',
  startUrl: '/',
  name: 'Behold: Bible Mystery Game',
  launcherName: 'Behold',
  orientation: 'portrait',
  themeColor: '#232A3D',
  navigationColor: '#1B2033',
  backgroundColor: '#1B2033',
  minSdkVersion: 24,
  targetSdkVersion: 36,
  appVersionCode: 3,
  appVersion: '1.1.1',
}

const config: Config = JSON.parse(readFileSync('android/shell.json', 'utf8'))
/** The app's Android manifest, as the project keeps it. */
const appManifest = readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8')
/** The app's one activity, as the project keeps it. */
const activity = readFileSync(
  'android/app/src/main/java/house/shay/behold/MainActivity.java',
  'utf8',
)
/** A file's SHA-256, in lower-case hex. */
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex')

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
  it('names the app and turns it as the manifest does', () => {
    expect(config.name).toBe(manifest.name)
    expect(config.launcherName).toBe(manifest.short_name)
    expect(config.orientation).toBe(manifest.orientation)
  })

  it('colours the app as the manifest does', () => {
    expect(config.themeColor.toUpperCase()).toBe(manifest.theme_color.toUpperCase())
    expect(config.backgroundColor.toUpperCase()).toBe(manifest.background_color.toUpperCase())
  })

  it('opens the game where the manifest starts it, on the app’s host', () => {
    const start = new URL(manifest.start_url, `https://${config.host}/`)
    expect(config.startUrl).toBe(start.pathname + start.search)
  })
})

describe('the shell against A1’s table as ruled for the WebView (#68)', () => {
  it.each(Object.entries(TABLE))('says %s is %j', (field, value) => {
    expect(config[field]).toEqual(value)
  })

  it('names nothing in its config but the table’s rows', () => {
    expect(Object.keys(config).sort()).toEqual(Object.keys(TABLE).sort())
  })

  it('builds the package from the config', () => {
    const gradle = readFileSync('android/app/build.gradle', 'utf8')
    expect(gradle).toContain("file('../shell.json')")
    expect(gradle).toContain(`namespace '${config.packageId}'`)
  })

  it('asks for the internet alone, keeps no cloud backup, and sends WebView no diagnostics', () => {
    const permissions = [...appManifest.matchAll(/<uses-permission android:name="([^"]+)"/g)]
    expect(permissions.map(([, name]) => name)).toEqual(['android.permission.INTERNET'])
    expect(appManifest).toContain('android:allowBackup="false"')
    expect(appManifest).toMatch(
      /android:name="android\.webkit\.WebView\.MetricsOptOut"\s+android:value="true"/,
    )
  })

  // Android 16 ignores an app's orientation on a large screen, unless the app is a game.
  it('says it is a game, so it stays upright on a tablet', () => {
    expect(appManifest).toContain('android:appCategory="game"')
    expect(appManifest).toContain('android:screenOrientation="${orientation}"')
  })

  it('takes the site’s links, which its asset links verify', () => {
    expect(appManifest).toMatch(
      /<intent-filter android:autoVerify="true">[^]*android:host="\$\{host\}"\s+android:scheme="https"/,
    )
  })

  // Bubblewrap made them from the icon script's Android file and laid the maskable image over 91
  // dp of the 108; 68b measured the result on the owner's phone (#68).
  it('keeps the launcher icons Bubblewrap made for the TWA, at every density', () => {
    for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'])
      for (const icon of ['ic_launcher', 'ic_maskable'])
        expect(existsSync(`android/app/src/main/res/mipmap-${density}/${icon}.png`), density).toBe(
          true,
        )
    expect(
      readFileSync('android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml', 'utf8'),
    ).toContain('android:top="8.5dp"')
  })

  // Bubblewrap drew the TWA's splash at 300 dp from the 1024 (Gate 18); the shell draws the same file
  // the same size, and Android 12's own splash before it shows the background alone.
  it('opens on the 1024’s art at 300 dp, as the TWA’s splash did, and on no other picture', () => {
    expect(sha256('android/app/src/main/res/drawable-nodpi/splash.png')).toBe(
      sha256('public/icons/icon-1024.png'),
    )
    const launch = readFileSync('android/app/src/main/res/drawable/launch.xml', 'utf8')
    expect(launch).toMatch(/android:width="300dp"\s+android:height="300dp"/)
    expect(readFileSync('android/app/src/main/res/values-v31/themes.xml', 'utf8')).toContain(
      '<item name="android:windowSplashScreenAnimatedIcon">@android:color/transparent</item>',
    )
  })

  // The wrapper is Gradle 8.11.1's own, and the Gradle it downloads is checked before it runs: each
  // by the SHA-256 Gradle publishes beside it at services.gradle.org.
  it('builds with Gradle 8.11.1’s own wrapper, which checks the Gradle it downloads', () => {
    const properties = readFileSync('android/gradle/wrapper/gradle-wrapper.properties', 'utf8')
    expect(properties).toContain(
      'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.11.1-bin.zip',
    )
    expect(properties).toContain(
      'distributionSha256Sum=f397b287023acdba1e9f6fc5ea72d22dd63669d59ed4a289a29b1a76eee151c6',
    )
    expect(sha256('android/gradle/wrapper/gradle-wrapper.jar')).toBe(
      '2db75c40782f5e8ba1fc278a5574bab070adccb2d21ca5a6e5ed840888448046',
    )
  })

  // Git keeps a file's mode, and `./gradlew` runs on Linux and macOS only when it's marked
  // executable, as Gradle writes it; cmd.exe runs `gradlew.bat` with no mark (#12 [Q31]).
  it('marks the Unix wrapper executable, and the Windows one not', () => {
    const index = execFileSync(
      'git',
      ['ls-files', '--stage', '--', 'android/gradlew', 'android/gradlew.bat'],
      { encoding: 'utf8' },
    )
    const modes = Object.fromEntries(
      Array.from(
        index.matchAll(/^(\d{6}) \S+ \d\t(.+)$/gm),
        ([, mode, file]) => [file, mode] as const,
      ),
    )
    expect(modes).toEqual({ 'android/gradlew': '100755', 'android/gradlew.bat': '100644' })
  })

  it('tracks no key in the repository', () => {
    const keys = execFileSync('git', ['ls-files', '--', '*.keystore', '*.jks'], {
      encoding: 'utf8',
    })
    expect(keys).toBe('')
  })
})

// The activity runs only on a phone, and nothing here runs it. Each test holds a fix from the
// owner's review of 68d (#149) as text, and fails on the code before it; the phone check reads
// what the fix does.
describe('the shell’s activity (A3, #68)', () => {
  // Android's own state fills the bundle a restart is given, even when the activity saved no page,
  // as after its renderer is gone; and restoring a bundle with no page in it gives null.
  it('loads the page when a restart finds none to restore, as after its renderer is gone', () => {
    expect(activity).toContain(
      'if (saved == null || web.restoreState(saved) == null) web.loadUrl(address(getIntent()));',
    )
  })

  // From Android 15 the bands and the root's sides take the bars and the cutout. WebView gives the
  // insets that reach it to the page's env(safe-area-inset-*), which the game pads for, so the page
  // gets none of them: the types the bands are sized by, set to none, as Chromium's note on
  // WebView's insets advises (android_webview/docs/insets.md).
  it('gives the page none of the insets the bands take, from Android 15', () => {
    expect(activity).toContain(
      'return new WindowInsets.Builder(insets).setInsets(types, Insets.NONE).build();',
    )
    expect(activity).toContain(
      'int types = WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout();',
    )
    expect(activity).toContain('Insets bars = insets.getInsets(types);')
  })
})

// As above, the activity runs only on a phone: each test holds a behaviour of #151 as text, and
// fails on the code before it. The check build's phone check reads what each does.
describe('the shell’s restart after its renderer is gone, and its links (#151)', () => {
  /** The app's build file, which reads the shell's words and makes the check build. */
  const gradle = readFileSync('android/app/build.gradle', 'utf8')
  /** The words past the cap, as the app lays them out. */
  const stoppedLayout = readFileSync('android/app/src/main/res/layout/stopped.xml', 'utf8')

  // Android's guide: while the activity is hidden, "Postponing recovery until user returns".
  it('builds the page again at once while the player can see it, and on return while hidden', () => {
    expect(activity).toMatch(
      /if \(!resumed\) pending = true;\s+else if \(\+\+restarts > RESTARTS\) stopped\(\);\s+else restart\(\);\s+return true;/,
    )
    expect(activity).toMatch(/if \(pending\) \{\s+pending = false;\s+restart\(\);/)
    expect(activity).toMatch(/super\.onResume\(\);\s+resumed = true;/)
    expect(activity).toMatch(/super\.onPause\(\);\s+resumed = false;/)
  })

  // The guide's example stops at three; a renderer that goes while the app is hidden doesn't count.
  it('builds it three times in a run at most, and Try again counts afresh', () => {
    expect(activity).toContain('private static final int RESTARTS = 3;')
    expect(activity).toMatch(/page\.removeView\(stopped\);\s+restarts = 0;\s+restart\(\);/)
  })

  // Nothing the player reads lives in code: the build reads the words from the strings module, as
  // a line of its own in single quotes, and the layout shows them by key.
  it('says it keeps stopping in the strings module’s words, which its build reads', () => {
    const block = /\nexport const shell = \{\n([^]*?)\n\}/.exec(
      readFileSync('src/strings/en.ts', 'utf8'),
    )?.[1]
    for (const [key, words] of Object.entries(shell)) {
      expect(block).toContain(`  ${key}: '${words}',`)
      expect(words).not.toMatch(/['\\]/)
      expect(gradle).toContain(`resValue 'string', '${key}', word('${key}')`)
      expect(stoppedLayout).toContain(`android:text="@string/${key}"`)
    }
  })

  it('draws its words and Try again in the game’s mist and wine, as Begin is drawn', () => {
    const css = readFileSync('src/index.css', 'utf8')
    const colors = readFileSync('android/app/src/main/res/values/colors.xml', 'utf8')
    for (const name of ['mist', 'wine']) {
      const game = new RegExp(`--${name}: (#[0-9a-f]{6});`).exec(css)?.[1]
      expect(colors.toLowerCase()).toContain(`<color name="${name}">${game}</color>`)
    }
  })

  // Android resolves the selector, and finds the default browser for an address no app claims;
  // with no default set, it asks, as it does for any link (AOSP's CrossProfileIntentResolverEngine).
  it('opens a web link in the default browser, by a selector no app claims', () => {
    expect(activity).toContain('Uri ANYWHERE = Uri.parse("https://example.com/");')
    expect(activity).toContain(
      'new Intent(Intent.ACTION_VIEW, ANYWHERE).addCategory(Intent.CATEGORY_BROWSABLE)',
    )
    expect(activity).not.toContain('CATEGORY_APP_BROWSER')
    expect(appManifest).not.toContain('<queries>')
  })

  // Every WebView on the renderer must answer for it, or WebView ends the app; a tab is never on
  // the screen, so a post on the tab itself would wait for it forever (AOSP's View.post).
  it('answers for a tab when the renderer goes, and destroys a sent tab from the page’s queue', () => {
    expect(activity).toContain('page.post(from::destroy);')
    expect(activity).toMatch(
      /public boolean onRenderProcessGone\(WebView from, RenderProcessGoneDetail detail\) \{\s+from\.destroy\(\);\s+return true;/,
    )
  })

  it('builds a check build beside the Play app, which alone can make its renderer go', () => {
    expect(gradle).toMatch(/debug \{\s+applicationIdSuffix '\.check'\s+\}/)
    expect(activity).toContain(
      'if (BuildConfig.DEBUG && url != null && "chrome".equals(url.getScheme())) {',
    )
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
