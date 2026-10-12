// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { cases } from '../../src/cases/index.ts'
import { query, type Reference } from './passage.ts'
import { BOUND, fill, registered, type Fetcher, type KV, type Store } from './store.ts'

const now = 1_700_000_000_000
const day = 24 * 60 * 60 * 1000

/** A store holding what it is given, as KV would; what was written is kept. */
const kv = (store: Store | null) => ({
  get: vi.fn<KV['get']>(() => Promise.resolve(store)),
  put: vi.fn<KV['put']>(() => Promise.resolve()),
})
const written = (store: ReturnType<typeof kv>) =>
  JSON.parse(String(store.put.mock.calls[0][1])) as Store

/**
 * An ESV answering in the text endpoint's shape around made-up sentences — never a verse
 * (CLAUDE.md, Guardrails) — `count` verses for each passage asked; what it was asked is kept.
 */
const esv = (count = 1) => {
  const asked: { q: string | null; init: RequestInit }[] = []
  const fetcher: Fetcher = (url, init) => {
    asked.push({ q: new URL(url).searchParams.get('q'), init })
    const text = Array.from({ length: count }, (_, i) => `[${i + 1}] Made up.`).join(' ')
    return Promise.resolve(Response.json({ passages: [text] }))
  }
  return { fetcher, asked }
}

/** A registry of made-up chapters, `Genesis 1` to `Genesis n`, by name. */
const chapters = (n: number) =>
  new Map(
    Array.from({ length: n }, (_, i): [string, Reference] => {
      const ref = { book: 'GEN', chapter: i + 1 }
      return [query(ref), ref]
    }),
  )
const made = (at: number, count = 1) => ({
  at,
  verses: Array.from({ length: count }, (_, i) => ({ number: i + 1, text: 'Made up.' })),
})

describe('the Worker’s store (#3, 04c)', () => {
  it('fills an empty store with every registered case’s passage, asking the ESV once for each', async () => {
    const store = kv(null)
    const { fetcher, asked } = esv()
    await fill(store, 'the-token', now, fetcher)
    // The registry is the one source: the store's list is every registered case's passages.
    expect([...registered.values()]).toEqual(cases.flatMap((c) => c.structure.passages))
    expect(asked.map((a) => a.q)).toEqual([...registered.keys()])
    for (const a of asked) expect(a.init.headers).toEqual({ authorization: 'Token the-token' })
    expect(store.put).toHaveBeenCalledTimes(1)
    expect(Object.keys(written(store))).toEqual([...registered.keys()])
    expect(written(store)['1 Kings 21']).toEqual(made(now))
  })

  it('asks again for a passage kept a day, and not for one kept less', async () => {
    const store = kv({ 'Genesis 1': made(now - day, 2), 'Genesis 2': made(now - day + 1, 2) })
    const { fetcher, asked } = esv()
    await fill(store, 'the-token', now, fetcher, chapters(2))
    expect(asked.map((a) => a.q)).toEqual(['Genesis 1'])
    expect(written(store)).toEqual({ 'Genesis 1': made(now), 'Genesis 2': made(now - day + 1, 2) })
  })

  it.each<[string, Fetcher]>([
    ['fails', () => Promise.resolve(new Response('no', { status: 500 }))],
    ['is down', () => Promise.reject(new Error('down'))],
    ['answers what is not JSON', () => Promise.resolve(new Response('not json'))],
    ['answers no verse', () => Promise.resolve(Response.json({ passages: [''] }))],
  ])('keeps a passage’s last copy when the ESV %s', async (_, fetcher) => {
    const store = kv({ 'Genesis 1': made(now - 2 * day, 2) })
    await fill(store, 'the-token', now, fetcher, chapters(1))
    // Nothing changed, so nothing is written: the copy stands until a fill gets an answer.
    expect(store.put).not.toHaveBeenCalled()
  })

  // The ESV asks that a cache be cleared now and then, and may end a key's access: a copy it hasn't
  // given again in thirty days goes, as a device's copy does after thirty days (Gate 04 A4).
  it('drops a copy the ESV hasn’t given again in thirty days', async () => {
    const store = kv({
      'Genesis 1': made(now - 30 * day, 2),
      'Genesis 2': made(now - 30 * day + 1),
    })
    await fill(store, 'the-token', now, () => Promise.reject(new Error('down')), chapters(2))
    expect(written(store)).toEqual({ 'Genesis 2': made(now - 30 * day + 1) })
  })

  it('drops a passage no longer registered', async () => {
    const store = kv({ 'Genesis 1': made(now), 'Genesis 9': made(now) })
    const { fetcher, asked } = esv()
    await fill(store, 'the-token', now, fetcher, chapters(1))
    expect(asked).toHaveLength(0)
    expect(written(store)).toEqual({ 'Genesis 1': made(now) })
  })

  it('writes nothing and asks no one while every passage is kept and less than a day old', async () => {
    const store = kv({ 'Genesis 1': made(now - 1000), 'Genesis 2': made(now - day + 1) })
    const { fetcher, asked } = esv()
    await fill(store, 'the-token', now, fetcher, chapters(2))
    expect(asked).toHaveLength(0)
    expect(store.put).not.toHaveBeenCalled()
  })

  // The ESV's fourth condition, held where the store is written as well as in CI.
  it('keeps no more than 500 verses: a passage that would pass them is not kept', async () => {
    const store = kv(null)
    await fill(store, 'the-token', now, esv(200).fetcher, chapters(3))
    expect(Object.keys(written(store))).toEqual(['Genesis 1', 'Genesis 2'])
    const total = Object.values(written(store)).reduce((n, k) => n + k.verses.length, 0)
    expect(total).toBeLessThanOrEqual(BOUND)
  })

  it('asks the ESV at most twenty times in a fill, and the next fill asks for the rest', async () => {
    const first = kv(null)
    const one = esv()
    await fill(first, 'the-token', now, one.fetcher, chapters(25))
    expect(one.asked).toHaveLength(20)
    const second = kv(written(first))
    const two = esv()
    await fill(second, 'the-token', now + 600_000, two.fetcher, chapters(25))
    expect(two.asked.map((a) => a.q)).toEqual([21, 22, 23, 24, 25].map((n) => `Genesis ${n}`))
    expect(Object.keys(written(second))).toHaveLength(25)
  })
})
