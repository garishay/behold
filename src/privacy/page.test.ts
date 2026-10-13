// The test reads the app's source and the config from disk under Vitest, which runs on Node; the app
// project declares no Node types, so this file brings them in itself, as the registry test does.
/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { save } from '../player/storage.ts'
import { turn } from '../sound/settings.ts'
import { policy } from '../strings/en.ts'
import { page } from './page.ts'

/** The page as the build writes it, at the site's root. */
const html = page('/', '')
/** Every sentence the page says. */
const said = [policy.intro, ...policy.sections.flatMap((s) => s.points)].join('\n')

/** The app's own modules: everything under `src/` but the tests and their setup. */
const modules = readdirSync('src', { recursive: true, encoding: 'utf8' })
  .map((file) => file.replaceAll('\\', '/'))
  .filter((file) => /\.tsx?$/.test(file) && !/\.test[.-]|^test\//.test(file))
  .map((file) => ({ file, text: readFileSync(join('src', file), 'utf8') }))
const using = (api: RegExp) => modules.filter((m) => api.test(m.text)).map((m) => m.file)

beforeEach(() => localStorage.clear())

describe('the privacy page (#9)', () => {
  it('reads without JavaScript, labelled as a privacy policy, every line of it', () => {
    expect(html).not.toMatch(/<script/i)
    expect(html).toContain(`<title>${policy.tab}</title>`)
    expect(html).toContain(`<h1>${policy.title}</h1>`)
    for (const line of [policy.effective, said, policy.back].flatMap((s) => s.split('\n')))
      expect(html).toContain(line)
  })
})

/*
 * [G13]'s page clause, held mechanically (Gate 17 A7): a change to what the game keeps or sends
 * fails here until the page says it too. These hold the places the game keeps and asks from, the
 * modules and the service worker's rules, not every way code could reach the network.
 */
describe('what the page says, held to the code (#9, [G13])', () => {
  it('names every key the game keeps, and the game keeps nothing beyond local storage', () => {
    save({})
    turn('music', true)
    turn('effects', true)
    expect(localStorage).toHaveLength(3)
    for (let i = 0; i < localStorage.length; i++) expect(said).toContain(localStorage.key(i))
    expect(using(/\blocalStorage\b/)).toEqual(['player/storage.ts', 'sound/settings.ts'])
    expect(using(/\b(sessionStorage|indexedDB)\b|document\.cookie/)).toEqual([])
  })

  it('says how much each of the service worker’s caches keeps, and for how long', () => {
    const config = readFileSync('vite.config.ts', 'utf8')
    const limits = [...config.matchAll(/maxEntries: (\d+)/g)].map((m) => m[1])
    expect(limits).toHaveLength(3)
    for (const n of limits) expect(said).toContain(`up to ${n}`)
    expect(config).toMatch(/maxAgeSeconds: 30 \* 24 \* 60 \* 60\b/)
    expect(said).toContain('up to 30 days')
  })

  it('names every site the game asks or links to, and asks from three modules alone', () => {
    const hosts = modules.flatMap((m) => [...m.text.matchAll(/https:\/\/([\w.-]+)/g)])
    for (const [, host] of hosts) expect(html).toContain(host)
    expect(
      using(/\bfetch\(|new Image\(|\b(sendBeacon|XMLHttpRequest|WebSocket|EventSource)\b/),
    ).toEqual(['passages/proxy.ts', 'player/pictures.ts', 'sound/engine.ts'])
  })
})
