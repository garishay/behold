// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import worker, { handle, type Env } from './index.ts'
import type { KV, Store } from './store.ts'

const site = 'https://play.beholdgame.com'

/** A store holding what it is given, as KV would; what it was asked is kept. */
const kv = (store: Store | null) => ({
  get: vi.fn<KV['get']>(() => Promise.resolve(store)),
  put: vi.fn<KV['put']>(() => Promise.resolve()),
})

// Made-up sentences in the store's shape — never a verse (CLAUDE.md, Guardrails).
const kept: Store = {
  '1 Kings 21': {
    at: 0,
    verses: [
      { number: 1, text: 'One thing.' },
      { number: 2, text: 'Another.' },
    ],
  },
  '1 Samuel 17:17-18': {
    at: 0,
    verses: [
      { number: 17, text: 'One.' },
      { number: 18, text: 'Two.' },
    ],
  },
}

const env = (over: Partial<Env> = {}): Env => ({
  ESV_TOKEN: 'the-token',
  ORIGINS: `${site} http://localhost:5173`,
  STORE: kv(kept),
  ...over,
})

/** A request as the browser sends it, with the address Cloudflare adds. */
const get = (query: string, origin: string | null = site, method = 'GET') =>
  new Request(`https://behold-esv.example.workers.dev/passage?${query}`, {
    method,
    headers: { ...(origin === null ? {} : { origin }), 'cf-connecting-ip': '203.0.113.9' },
  })

const chapter = 'translation=ESV&book=1KI&chapter=21'

/** The network, failing any request made: a player's request asks no one (04c). */
const network = () => {
  const asked = vi.fn(() => Promise.reject(new Error('a request left the Worker')))
  vi.stubGlobal('fetch', asked)
  return asked
}
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('the ESV proxy (#3)', () => {
  it('answers a registered passage from the store, with its origin and a day of caching, and asks no one', async () => {
    const asked = network()
    const request = get(chapter)
    const read = vi.spyOn(request.headers, 'get')
    const reply = await handle(request, env())
    expect(reply.status).toBe(200)
    expect(reply.headers.get('content-type')).toBe('application/json')
    expect(reply.headers.get('access-control-allow-origin')).toBe(site)
    expect(reply.headers.get('vary')).toBe('origin')
    expect(reply.headers.get('cache-control')).toBe('public, max-age=86400')
    expect(await reply.json()).toEqual({ verses: kept['1 Kings 21'].verses })
    expect(asked).not.toHaveBeenCalled()
    // The player's address is never read: no limit keys on it since 04c, and nothing passes it on.
    expect(read.mock.calls.map(([name]) => name.toLowerCase())).toEqual(['origin'])
  })

  it('serves the dev server too, and a range', async () => {
    const reply = await handle(
      get('translation=ESV&book=1SA&chapter=17&from=17&to=18', 'http://localhost:5173'),
      env(),
    )
    expect(reply.status).toBe(200)
    expect(reply.headers.get('access-control-allow-origin')).toBe('http://localhost:5173')
    expect(await reply.json()).toEqual({ verses: kept['1 Samuel 17:17-18'].verses })
  })

  it('refuses another origin, or none, with no CORS header, and never reads the store', async () => {
    const store = kv(kept)
    for (const origin of ['https://elsewhere.example', null]) {
      const reply = await handle(get(chapter, origin), env({ STORE: store }))
      expect(reply.status).toBe(403)
      expect(reply.headers.get('access-control-allow-origin')).toBeNull()
      expect(await reply.json()).toEqual({ error: 'origin' })
    }
    expect(store.get).not.toHaveBeenCalled()
  })

  it('answers a preflight, and refuses a method that is not GET', async () => {
    const preflight = await handle(get(chapter, site, 'OPTIONS'), env())
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('access-control-allow-origin')).toBe(site)
    expect(preflight.headers.get('access-control-allow-methods')).toBe('GET')
    const post = await handle(get(chapter, site, 'POST'), env())
    expect(post.status).toBe(405)
    expect(await post.json()).toEqual({ error: 'method' })
  })

  it.each([
    ['another path', 'https://behold-esv.example.workers.dev/other?' + chapter, 404],
    [
      'another translation',
      'https://behold-esv.example.workers.dev/passage?translation=KJV&book=1KI&chapter=21',
      404,
    ],
    [
      'a book off the table',
      'https://behold-esv.example.workers.dev/passage?translation=ESV&book=1KG&chapter=21',
      400,
    ],
    [
      'a chapter the book lacks',
      'https://behold-esv.example.workers.dev/passage?translation=ESV&book=1KI&chapter=23',
      400,
    ],
    [
      'a range backwards',
      'https://behold-esv.example.workers.dev/passage?translation=ESV&book=1KI&chapter=21&from=9&to=2',
      400,
    ],
  ])('refuses %s without reading the store', async (_, url, status) => {
    const store = kv(kept)
    const request = new Request(url, { headers: { origin: site } })
    const reply = await handle(request, env({ STORE: store }))
    expect(reply.status).toBe(status)
    expect(await reply.json()).toEqual({ error: 'reference' })
    expect(store.get).not.toHaveBeenCalled()
  })

  // The Worker serves the game's passages and nothing else (the Gate 04 amendment): a reference no
  // case registers — another chapter, or a registered chapter asked as a range — is refused before
  // the store is read.
  it.each([
    ['another chapter', 'translation=ESV&book=1KI&chapter=20'],
    ['a registered chapter asked as a range', 'translation=ESV&book=1KI&chapter=21&from=1&to=29'],
    ['a range no case has', 'translation=ESV&book=1SA&chapter=17&from=17&to=19'],
  ])('refuses %s, which no case registers', async (_, q) => {
    const store = kv(kept)
    const reply = await handle(get(q), env({ STORE: store }))
    expect(reply.status).toBe(404)
    expect(await reply.json()).toEqual({ error: 'unregistered' })
    expect(reply.headers.get('access-control-allow-origin')).toBe(site)
    expect(store.get).not.toHaveBeenCalled()
  })

  // A registered passage the store doesn't hold yet — before the first fill, or a new case's in
  // the minutes after its deploy — is pending, and the reveal shows its unreachable line.
  it('answers a registered passage the store lacks as pending, and asks no one', async () => {
    const asked = network()
    for (const store of [null, {}]) {
      const reply = await handle(get(chapter), env({ STORE: kv(store) }))
      expect(reply.status).toBe(503)
      expect(await reply.json()).toEqual({ error: 'pending' })
      expect(reply.headers.get('access-control-allow-origin')).toBe(site)
    }
    expect(asked).not.toHaveBeenCalled()
  })

  it('fills the store on the schedule, the one place the ESV is asked, at the schedule’s time', async () => {
    const asked = vi.fn((url: string, init: RequestInit) => {
      expect(init.headers).toEqual({ authorization: 'Token the-token' })
      const q = new URL(url).searchParams.get('q')
      return Promise.resolve(Response.json({ passages: [`[1] Made up for ${q}.`] }))
    })
    vi.stubGlobal('fetch', asked)
    const store = kv(null)
    await worker.scheduled({ scheduledTime: 1_700_000_000_000 }, env({ STORE: store }))
    expect(asked).toHaveBeenCalled()
    const written = JSON.parse(String(store.put.mock.calls[0][1])) as Store
    expect(written['1 Kings 21']).toEqual({
      at: 1_700_000_000_000,
      verses: [{ number: 1, text: 'Made up for 1 Kings 21.' }],
    })
  })
})
