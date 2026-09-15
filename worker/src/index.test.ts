// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { handle, type Env, type Fetcher } from './index.ts'

const site = 'https://garishay.github.io'
const limiter = (success = true) => ({ limit: vi.fn(() => Promise.resolve({ success })) })
const env = (over: Partial<Env> = {}): Env => ({
  ESV_TOKEN: 'the-token',
  ORIGINS: `${site} http://localhost:5173`,
  PER_IP: limiter(),
  ALL: limiter(),
  ...over,
})

/** A request as the browser sends it, with the address Cloudflare adds. */
const get = (query: string, origin: string | null = site, method = 'GET') =>
  new Request(`https://behold-esv.example.workers.dev/passage?${query}`, {
    method,
    headers: { ...(origin === null ? {} : { origin }), 'cf-connecting-ip': '203.0.113.9' },
  })

/**
 * An ESV answering in the text endpoint's shape around made-up sentences — never a verse
 * (CLAUDE.md, Guardrails) — or, given no text, with something that is not JSON. What it was
 * asked is kept.
 */
const esv = (status: number, text: string | undefined) => {
  const asked: { url: string; init: RequestInit }[] = []
  const fetcher: Fetcher = (url, init) => {
    asked.push({ url, init })
    const body =
      text === undefined
        ? 'not json'
        : JSON.stringify({
            query: 'q',
            canonical: 'q',
            parsed: [],
            passage_meta: [],
            passages: [text],
          })
    return Promise.resolve(new Response(body, { status }))
  }
  return { fetcher, asked }
}

const chapter = 'translation=ESV&book=1KI&chapter=21'

describe('the ESV proxy (#3)', () => {
  it('answers an allowed origin with the verses, its origin, and a day of caching', async () => {
    const { fetcher, asked } = esv(200, '[21:1] One thing.\n[2] Another.')
    const reply = await handle(get(chapter), env(), fetcher)
    expect(reply.status).toBe(200)
    expect(reply.headers.get('content-type')).toBe('application/json')
    expect(reply.headers.get('access-control-allow-origin')).toBe(site)
    expect(reply.headers.get('vary')).toBe('origin')
    expect(reply.headers.get('cache-control')).toBe('public, max-age=86400')
    expect(await reply.json()).toEqual({
      verses: [
        { number: 1, text: 'One thing.' },
        { number: 2, text: 'Another.' },
      ],
    })
    expect(asked).toHaveLength(1)
    expect(asked[0].url).toMatch(/^https:\/\/api\.esv\.org\/v3\/passage\/text\/\?q=1\+Kings\+21&/)
    expect(asked[0].init.headers).toEqual({ authorization: 'Token the-token' })
  })

  it('serves the dev server too, and a range', async () => {
    const { fetcher, asked } = esv(200, '[17] One. [18] Two.')
    const reply = await handle(
      get('translation=ESV&book=1SA&chapter=17&from=17&to=18', 'http://localhost:5173'),
      env(),
      fetcher,
    )
    expect(reply.status).toBe(200)
    expect(reply.headers.get('access-control-allow-origin')).toBe('http://localhost:5173')
    expect(new URL(asked[0].url).searchParams.get('q')).toBe('1 Samuel 17:17-18')
  })

  it('refuses another origin, or none, with no CORS header, and never asks the ESV', async () => {
    const { fetcher, asked } = esv(200, '[1] Words.')
    for (const origin of ['https://elsewhere.example', null]) {
      const reply = await handle(get(chapter, origin), env(), fetcher)
      expect(reply.status).toBe(403)
      expect(reply.headers.get('access-control-allow-origin')).toBeNull()
      expect(await reply.json()).toEqual({ error: 'origin' })
    }
    expect(asked).toHaveLength(0)
  })

  it('answers a preflight, and refuses a method that is not GET', async () => {
    const { fetcher, asked } = esv(200, '[1] Words.')
    const preflight = await handle(get(chapter, site, 'OPTIONS'), env(), fetcher)
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('access-control-allow-origin')).toBe(site)
    expect(preflight.headers.get('access-control-allow-methods')).toBe('GET')
    const post = await handle(get(chapter, site, 'POST'), env(), fetcher)
    expect(post.status).toBe(405)
    expect(await post.json()).toEqual({ error: 'method' })
    expect(asked).toHaveLength(0)
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
  ])('refuses %s without asking the ESV', async (_, url, status) => {
    const { fetcher, asked } = esv(200, '[1] Words.')
    const reply = await handle(new Request(url, { headers: { origin: site } }), env(), fetcher)
    expect(reply.status).toBe(status)
    expect(await reply.json()).toEqual({ error: 'reference' })
    expect(asked).toHaveLength(0)
  })

  it('refuses a request past a limit, keyed by the player’s address and by the whole', async () => {
    const perIp = limiter(false)
    const { fetcher, asked } = esv(200, '[1] Words.')
    const reply = await handle(get(chapter), env({ PER_IP: perIp }), fetcher)
    expect(reply.status).toBe(429)
    expect(await reply.json()).toEqual({ error: 'rate' })
    expect(perIp.limit).toHaveBeenCalledWith({ key: '203.0.113.9' })
    const all = limiter(false)
    expect((await handle(get(chapter), env({ ALL: all }), fetcher)).status).toBe(429)
    expect(all.limit).toHaveBeenCalledWith({ key: 'all' })
    expect(asked).toHaveLength(0)
  })

  it('turns an ESV that fails, is down, or answers nothing into a status, repeating none of its words', async () => {
    const failed = await handle(get(chapter), env(), esv(500, '[1] Words.').fetcher)
    expect(failed.status).toBe(502)
    expect(await failed.json()).toEqual({ error: 'upstream' })
    const down = await handle(get(chapter), env(), () => Promise.reject(new Error('down')))
    expect(down.status).toBe(502)
    expect(await down.json()).toEqual({ error: 'upstream' })
    const notJson = await handle(get(chapter), env(), esv(200, undefined).fetcher)
    expect(notJson.status).toBe(404)
    const empty = await handle(get(chapter), env(), esv(200, '').fetcher)
    expect(empty.status).toBe(404)
    expect(await empty.json()).toEqual({ error: 'empty' })
    expect(empty.headers.get('access-control-allow-origin')).toBe(site)
  })
})
