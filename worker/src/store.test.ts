// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { cases } from '../../src/cases/index.ts'
import { bibleUrl, cite, type Reference } from './passage.ts'
import { BOUND, fill, registered, type Copy, type Fetcher, type KV, type Store } from './store.ts'

const now = 1_700_000_000_000
const hour = 60 * 60 * 1000
const day = 24 * hour

/** A store holding what it is given, as KV would; what was written is kept. */
const kv = (store: Store | null) => ({
  get: vi.fn<KV['get']>(() => Promise.resolve(store)),
  put: vi.fn<KV['put']>(() => Promise.resolve()),
})
const written = (store: ReturnType<typeof kv>) =>
  JSON.parse(String(store.put.mock.calls[0][1])) as Store

/** The last part of a URL's path: the chapter or passage API.Bible was asked for. */
const id = (url: string) => new URL(url).pathname.split('/').pop()

/**
 * API.Bible answering in its text shape around made-up sentences — never a verse (CLAUDE.md,
 * Guardrails) — `count` verses for each passage asked, with a made-up token that names it; what it
 * was asked is kept.
 */
const bible = (count = 1) => {
  const asked: { url: string; init: RequestInit }[] = []
  const fetcher: Fetcher = (url, init) => {
    asked.push({ url, init })
    const content = Array.from({ length: count }, (_, i) => `     [${i + 1}] Made up.`).join('\n')
    return Promise.resolve(
      Response.json({ data: { content }, meta: { fumsToken: `t-${id(url)}` } }),
    )
  }
  return { fetcher, asked }
}

/** A registry of made-up chapters, `Genesis 1` to `Genesis n`, by name. */
const chapters = (n: number) =>
  new Map(
    Array.from({ length: n }, (_, i): [string, Reference] => {
      const ref = { book: 'GEN', chapter: i + 1 }
      return [cite(ref), ref]
    }),
  )
const made = (at: number, count = 1, token = 't-GEN.1'): Copy => ({
  at,
  verses: Array.from({ length: count }, (_, i) => ({ number: i + 1, text: 'Made up.' })),
  token,
})

describe('the Worker’s store (#3, 04c; Gate 33 A1)', () => {
  it('fills an empty store with every registered case’s passage, asking API.Bible once for each', async () => {
    const store = kv(null)
    const { fetcher, asked } = bible()
    await fill(store, 'the-key', 'the-bible', now, fetcher)
    // The registry is the one source: the store's list is every registered case's passages.
    expect([...registered.values()]).toEqual(cases.flatMap((c) => c.structure.passages))
    expect(asked.map((a) => a.url)).toEqual(
      [...registered.values()].map((r) => bibleUrl(r, 'the-bible')),
    )
    for (const a of asked) expect(a.init.headers).toEqual({ 'api-key': 'the-key' })
    expect(store.put).toHaveBeenCalledTimes(1)
    expect(Object.keys(written(store))).toEqual([...registered.keys()])
    // Each copy keeps the token its reply came with, which each view of it is reported with.
    expect(written(store)['1 Kings 21']).toEqual({ asked: now, copy: made(now, 1, 't-1KI.21') })
  })

  it('asks again for a copy a week old, and not for one a moment younger', async () => {
    const store = kv({
      'Genesis 1': { asked: now - 7 * day, copy: made(now - 7 * day, 2, 'old') },
      'Genesis 2': { asked: now - 7 * day + 1, copy: made(now - 7 * day + 1, 2, 'old') },
    })
    const { fetcher, asked } = bible()
    await fill(store, 'the-key', 'the-bible', now, fetcher, chapters(2))
    expect(asked.map((a) => id(a.url))).toEqual(['GEN.1'])
    expect(written(store)).toEqual({
      'Genesis 1': { asked: now, copy: made(now) },
      'Genesis 2': { asked: now - 7 * day + 1, copy: made(now - 7 * day + 1, 2, 'old') },
    })
  })

  it.each<[string, Fetcher]>([
    ['refuses the key', () => Promise.resolve(new Response('no', { status: 401 }))],
    ['is down', () => Promise.reject(new Error('down'))],
    ['answers what is not JSON', () => Promise.resolve(new Response('not json'))],
    ['answers in another shape', () => Promise.resolve(Response.json({ passages: ['[1] A.'] }))],
    [
      'answers no verse',
      () => Promise.resolve(Response.json({ data: { content: '' }, meta: { fumsToken: 't' } })),
    ],
    [
      'answers with no token to report a view with',
      () => Promise.resolve(Response.json({ data: { content: '[1] Made up.' }, meta: {} })),
    ],
    [
      'answers with an empty token',
      () =>
        Promise.resolve(
          Response.json({ data: { content: '[1] Made up.' }, meta: { fumsToken: '' } }),
        ),
    ],
  ])(
    'keeps a passage’s last copy when API.Bible %s, and notes when it asked',
    async (_, fetcher) => {
      const store = kv({ 'Genesis 1': { asked: now - 8 * day, copy: made(now - 8 * day, 2) } })
      await fill(store, 'the-key', 'the-bible', now, fetcher, chapters(1))
      expect(written(store)).toEqual({ 'Genesis 1': { asked: now, copy: made(now - 8 * day, 2) } })
    },
  )

  // A failing key asks for each passage four times a day, not at every fill (Gate 33 A1).
  it('asks no sooner than six hours after an ask that failed, whether a copy is kept or not', async () => {
    const store = kv({
      'Genesis 1': { asked: now - 6 * hour + 1 },
      'Genesis 2': { asked: now - 6 * hour + 1, copy: made(now - 8 * day) },
      'Genesis 3': { asked: now - 6 * hour },
    })
    const { fetcher, asked } = bible()
    await fill(store, 'the-key', 'the-bible', now, fetcher, chapters(3))
    expect(asked.map((a) => id(a.url))).toEqual(['GEN.3'])
    expect(written(store)['Genesis 3']).toEqual({ asked: now, copy: made(now, 1, 't-GEN.3') })
  })

  // API.Bible's Terms §11: a stored copy is checked at least every thirty days, and what is shown
  // is never more than thirty days out of date.
  it('drops a copy API.Bible hasn’t given again in thirty days, and asks for it still', async () => {
    const store = kv({
      'Genesis 1': { asked: now - hour, copy: made(now - 30 * day, 2) },
      'Genesis 2': { asked: now - hour, copy: made(now - 30 * day + 1) },
    })
    await fill(store, 'the-key', 'the-bible', now, bible().fetcher, chapters(2))
    expect(written(store)).toEqual({
      'Genesis 1': { asked: now - hour },
      'Genesis 2': { asked: now - hour, copy: made(now - 30 * day + 1) },
    })
    const later = kv(written(store))
    const { fetcher, asked } = bible()
    await fill(later, 'the-key', 'the-bible', now + 5 * hour, fetcher, chapters(2))
    expect(asked.map((a) => id(a.url))).toEqual(['GEN.1', 'GEN.2'])
  })

  it('drops a passage no longer registered', async () => {
    const store = kv({
      'Genesis 1': { asked: now, copy: made(now) },
      'Genesis 9': { asked: now, copy: made(now) },
    })
    const { fetcher, asked } = bible()
    await fill(store, 'the-key', 'the-bible', now, fetcher, chapters(1))
    expect(asked).toHaveLength(0)
    expect(written(store)).toEqual({ 'Genesis 1': { asked: now, copy: made(now) } })
  })

  it('writes nothing and asks no one while every copy is less than a week old', async () => {
    const store = kv({
      'Genesis 1': { asked: now - 1000, copy: made(now - 1000) },
      'Genesis 2': { asked: now - 7 * day + 1, copy: made(now - 7 * day + 1) },
    })
    const { fetcher, asked } = bible()
    await fill(store, 'the-key', 'the-bible', now, fetcher, chapters(2))
    expect(asked).toHaveLength(0)
    expect(store.put).not.toHaveBeenCalled()
  })

  // Until the key is put, a fill asks no one, so the first fill after it fills the store (#138).
  it('asks no one, and leaves the store as it is, with no key', async () => {
    const store = kv(null)
    const { fetcher, asked } = bible()
    await fill(store, undefined, 'the-bible', now, fetcher, chapters(2))
    expect(asked).toHaveLength(0)
    expect(store.get).not.toHaveBeenCalled()
    expect(store.put).not.toHaveBeenCalled()
  })

  // Biblica's 500 verses, held where the store is written as well as in CI.
  it('keeps no more than 500 verses: a copy that would pass them is not kept', async () => {
    const store = kv(null)
    await fill(store, 'the-key', 'the-bible', now, bible(200).fetcher, chapters(3))
    const entries = Object.values(written(store))
    expect(entries.map((e) => e.copy !== undefined)).toEqual([true, true, false])
    const total = entries.reduce((n, e) => n + (e.copy?.verses.length ?? 0), 0)
    expect(total).toBeLessThanOrEqual(BOUND)
  })

  it('asks API.Bible at most twenty times in a fill, and the next fill asks for the rest', async () => {
    const first = kv(null)
    const one = bible()
    await fill(first, 'the-key', 'the-bible', now, one.fetcher, chapters(25))
    expect(one.asked).toHaveLength(20)
    const second = kv(written(first))
    const two = bible()
    await fill(second, 'the-key', 'the-bible', now + 600_000, two.fetcher, chapters(25))
    expect(two.asked.map((a) => id(a.url))).toEqual([21, 22, 23, 24, 25].map((n) => `GEN.${n}`))
    expect(Object.keys(written(second))).toHaveLength(25)
  })

  // The Starter plan's 5,000 calls a month, with no overage (#138): a month of fills, every ten
  // minutes, over 31 days.
  it('asks well under 5,000 times a month: weekly when well, and four a day a passage when failing', async () => {
    const month = async (fetcher: Fetcher, passages: number) => {
      let calls = 0
      const counted: Fetcher = (url, init) => {
        calls++
        return fetcher(url, init)
      }
      let store: Store | null = null
      for (let t = now; t < now + 31 * day; t += 10 * 60 * 1000) {
        const at = kv(store)
        await fill(at, 'the-key', 'the-bible', t, counted, chapters(passages))
        if (at.put.mock.calls.length > 0) store = written(at)
      }
      return calls
    }
    const failing: Fetcher = () => Promise.resolve(new Response('no', { status: 401 }))
    expect(await month(bible().fetcher, 6)).toBe(6 * 5)
    expect(await month(failing, 6)).toBe(6 * 4 * 31)
    expect(await month(failing, 20)).toBe(20 * 4 * 31)
  })
})
