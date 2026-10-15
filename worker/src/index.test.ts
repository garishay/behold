// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import worker, { handle, type Context, type Env } from './index.ts'
import type { KV, Store } from './store.ts'

const site = 'https://play.beholdgame.com'
const at = 'https://behold-passages.example.workers.dev'

/** A store holding what it is given, as KV would; what it was asked is kept. */
const kv = (store: Store | null) => ({
  get: vi.fn<KV['get']>(() => Promise.resolve(store)),
  put: vi.fn<KV['put']>(() => Promise.resolve()),
})

// Made-up sentences and tokens in the store's shape — never a verse (CLAUDE.md, Guardrails).
const kept: Store = {
  '1 Kings 21': {
    asked: 0,
    copy: {
      at: 0,
      verses: [
        { number: 1, text: 'One thing.' },
        { number: 2, text: 'Another.' },
      ],
      token: 't-1KI.21',
    },
  },
  '1 Samuel 17:17-18': {
    asked: 0,
    copy: {
      at: 0,
      verses: [
        { number: 17, text: 'One.' },
        { number: 18, text: 'Two.' },
      ],
      token: 't-1SA.17.17-1SA.17.18',
    },
  },
}

const env = (over: Partial<Env> = {}): Env => ({
  API_BIBLE_KEY: 'the-key',
  BIBLE_ID: 'the-bible',
  ORIGINS: `${site} https://garishay.github.io`,
  STORE: kv(kept),
  ...over,
})

/** A request's context: the work it leaves running after its reply, kept for the test to await. */
const context = () => {
  const work: Promise<unknown>[] = []
  return { work, waitUntil: vi.fn<Context['waitUntil']>((p) => void work.push(p)) }
}

/** A request as the browser sends it, with the address Cloudflare adds. */
const get = (query: string, origin: string | null = site, method = 'GET') =>
  new Request(`${at}/passage?${query}`, {
    method,
    headers: { ...(origin === null ? {} : { origin }), 'cf-connecting-ip': '203.0.113.9' },
  })

const chapter = 'translation=NIV&book=1KI&chapter=21'

/** The network, answering any request with an empty reply; what was asked is kept. */
const network = () => {
  const asked = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(() =>
    Promise.resolve(new Response(null)),
  )
  vi.stubGlobal('fetch', asked)
  return asked
}
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('the passage service (#138)', () => {
  it('answers a registered passage from the store, with its origin, and cached nowhere', async () => {
    network()
    const request = get(chapter)
    const read = vi.spyOn(request.headers, 'get')
    const reply = await handle(request, env(), context())
    expect(reply.status).toBe(200)
    expect(reply.headers.get('content-type')).toBe('application/json')
    expect(reply.headers.get('access-control-allow-origin')).toBe(site)
    expect(reply.headers.get('vary')).toBe('origin')
    // Every reveal reaches the service, so every view is reported (Gate 33 A2).
    expect(reply.headers.get('cache-control')).toBe('no-store')
    expect(await reply.json()).toEqual({ verses: kept['1 Kings 21'].copy?.verses })
    // The player's address is never read: no limit keys on it since 04c, and nothing passes it on.
    expect(read.mock.calls.map(([name]) => name.toLowerCase())).toEqual(['origin'])
  })

  // API.Bible's Terms §14 (Gate 33 A1): each passage answered is a view, reported from the Worker
  // to fums.api.bible with the token its copy came with, and a device and a session made for it.
  it('reports each view to fums.api.bible alone, after the reply, with its token and two new IDs', async () => {
    const asked = network()
    const one = context()
    const two = context()
    await handle(get(chapter), env(), one)
    await worker.fetch(get(chapter), env(), two)
    expect(one.waitUntil).toHaveBeenCalledTimes(1)
    expect(two.waitUntil).toHaveBeenCalledTimes(1)
    await Promise.all([...one.work, ...two.work])
    expect(asked).toHaveBeenCalledTimes(2)
    const urls = asked.mock.calls.map(([url]) => new URL(url))
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    for (const url of urls) {
      expect(url.origin + url.pathname).toBe('https://fums.api.bible/f3')
      expect([...url.searchParams.keys()]).toEqual(['t', 'dId', 'sId'])
      expect(url.searchParams.get('t')).toBe('t-1KI.21')
      expect(url.searchParams.get('dId')).toMatch(uuid)
      expect(url.searchParams.get('sId')).toMatch(uuid)
    }
    // Made for that one view: no ID is shared by two views, or by a view's device and session.
    const ids = urls.flatMap((u) => [u.searchParams.get('dId'), u.searchParams.get('sId')])
    expect(new Set(ids).size).toBe(4)
  })

  // Cloudflare would put the player's address on a request their own request sets off to a host
  // outside it (Gate 19 A2); the report names the Worker's address there instead.
  it('sends nothing of the player’s with a report: the Worker’s address stands in theirs', async () => {
    const asked = network()
    const c = context()
    await handle(get(chapter), env(), c)
    await Promise.all(c.work)
    const [, init] = asked.mock.calls[0]
    expect(init?.headers).toEqual({
      'cf-connecting-ip': '2a06:98c0:3600::103',
      'x-real-ip': '2a06:98c0:3600::103',
    })
    expect(JSON.stringify(asked.mock.calls)).not.toContain('203.0.113.9')
  })

  it('answers without waiting on the report, and lets a report that fails go', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {})),
    )
    expect((await handle(get(chapter), env(), context())).status).toBe(200)
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('down'))),
    )
    const c = context()
    await handle(get(chapter), env(), c)
    await expect(Promise.all(c.work)).resolves.toEqual([undefined])
  })

  it('serves the game’s old address too, and a range', async () => {
    const reply = await handle(
      get('translation=NIV&book=1SA&chapter=17&from=17&to=18', 'https://garishay.github.io'),
      env(),
      context(),
    )
    expect(reply.status).toBe(200)
    expect(reply.headers.get('access-control-allow-origin')).toBe('https://garishay.github.io')
    expect(await reply.json()).toEqual({ verses: kept['1 Samuel 17:17-18'].copy?.verses })
  })

  // The dev server is not an origin the service answers (Gate 33 A9).
  it('refuses another origin, the dev server’s, or none, with no CORS header, and never reads the store', async () => {
    const store = kv(kept)
    for (const origin of ['https://elsewhere.example', 'http://localhost:5173', null]) {
      const c = context()
      const reply = await handle(get(chapter, origin), env({ STORE: store }), c)
      expect(reply.status).toBe(403)
      expect(reply.headers.get('access-control-allow-origin')).toBeNull()
      expect(await reply.json()).toEqual({ error: 'origin' })
      expect(c.waitUntil).not.toHaveBeenCalled()
    }
    expect(store.get).not.toHaveBeenCalled()
  })

  it('answers a preflight, and refuses a method that is not GET', async () => {
    const preflight = await handle(get(chapter, site, 'OPTIONS'), env(), context())
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('access-control-allow-origin')).toBe(site)
    expect(preflight.headers.get('access-control-allow-methods')).toBe('GET')
    const post = await handle(get(chapter, site, 'POST'), env(), context())
    expect(post.status).toBe(405)
    expect(await post.json()).toEqual({ error: 'method' })
  })

  it.each([
    ['another path', `${at}/other?${chapter}`, 404],
    [
      'the ESV, which it no longer serves',
      `${at}/passage?translation=ESV&book=1KI&chapter=21`,
      404,
    ],
    ['a book off the table', `${at}/passage?translation=NIV&book=1KG&chapter=21`, 400],
    ['a chapter the book lacks', `${at}/passage?translation=NIV&book=1KI&chapter=23`, 400],
    ['a range backwards', `${at}/passage?translation=NIV&book=1KI&chapter=21&from=9&to=2`, 400],
  ])('refuses %s without reading the store', async (_, url, status) => {
    const store = kv(kept)
    const request = new Request(url, { headers: { origin: site } })
    const reply = await handle(request, env({ STORE: store }), context())
    expect(reply.status).toBe(status)
    expect(await reply.json()).toEqual({ error: 'reference' })
    expect(store.get).not.toHaveBeenCalled()
  })

  // The Worker serves the game's passages and nothing else (the Gate 04 amendment): a reference no
  // case registers — another chapter, or a registered chapter asked as a range — is refused before
  // the store is read.
  it.each([
    ['another chapter', 'translation=NIV&book=1KI&chapter=20'],
    ['a registered chapter asked as a range', 'translation=NIV&book=1KI&chapter=21&from=1&to=29'],
    ['a range no case has', 'translation=NIV&book=1SA&chapter=17&from=17&to=19'],
  ])('refuses %s, which no case registers', async (_, q) => {
    const store = kv(kept)
    const reply = await handle(get(q), env({ STORE: store }), context())
    expect(reply.status).toBe(404)
    expect(await reply.json()).toEqual({ error: 'unregistered' })
    expect(reply.headers.get('access-control-allow-origin')).toBe(site)
    expect(store.get).not.toHaveBeenCalled()
  })

  // A registered passage the store has no copy of — before the first fill, a new case's in the
  // minutes after its deploy, or one asked of API.Bible in vain — is pending, and the reveal shows
  // its unreachable line. Nothing is reported, since nothing was shown.
  it('answers a registered passage the store has no copy of as pending, and asks no one', async () => {
    const asked = network()
    const stores: (Store | null)[] = [null, {}, { '1 Kings 21': { asked: 0 } }]
    for (const store of stores) {
      const c = context()
      const reply = await handle(get(chapter), env({ STORE: kv(store) }), c)
      expect(reply.status).toBe(503)
      expect(await reply.json()).toEqual({ error: 'pending' })
      expect(reply.headers.get('access-control-allow-origin')).toBe(site)
      expect(c.waitUntil).not.toHaveBeenCalled()
    }
    expect(asked).not.toHaveBeenCalled()
  })

  it('fills the store on the schedule, the one place API.Bible is asked, with the key and the Bible bound', async () => {
    const asked = vi.fn((url: string, init: RequestInit) => {
      expect(init.headers).toEqual({ 'api-key': 'the-key' })
      expect(new URL(url).pathname).toMatch(/^\/v1\/bibles\/the-bible\//)
      return Promise.resolve(
        Response.json({ data: { content: '[1] Made up.' }, meta: { fumsToken: 'made-up' } }),
      )
    })
    vi.stubGlobal('fetch', asked)
    const store = kv(null)
    await worker.scheduled({ scheduledTime: 1_700_000_000_000 }, env({ STORE: store }))
    expect(asked).toHaveBeenCalled()
    const written = JSON.parse(String(store.put.mock.calls[0][1])) as Store
    expect(written['1 Kings 21']).toEqual({
      asked: 1_700_000_000_000,
      copy: { at: 1_700_000_000_000, verses: [{ number: 1, text: 'Made up.' }], token: 'made-up' },
    })
  })
})
