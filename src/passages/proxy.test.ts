// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { fetchedPassages, standIns } from './proxy.ts'

/** A Worker answering every request with one reply; the URLs it was asked are kept. */
const worker = (status: number, body: unknown) => {
  const asked: string[] = []
  vi.stubGlobal('fetch', (url: string) => {
    asked.push(url)
    return Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
    )
  })
  return asked
}

// Made-up words with verse numbers, never scripture.
const verses = [
  { number: 1, text: 'One thing.' },
  { number: 2, text: 'Another.' },
]

describe('the passage service through the proxy (#3, #138)', () => {
  it('asks the Worker for a whole chapter, and for a range, and returns the verses', async () => {
    const asked = worker(200, { verses })
    await expect(fetchedPassages({ book: '1KI', chapter: 21 }, 'NIV')).resolves.toEqual({ verses })
    await fetchedPassages({ book: '1SA', chapter: 17, from: 17, to: 18 }, 'NIV')
    expect(asked).toEqual([
      'https://behold-passages.garishay.workers.dev/passage?translation=NIV&book=1KI&chapter=21',
      'https://behold-passages.garishay.workers.dev/passage?translation=NIV&book=1SA&chapter=17&from=17&to=18',
    ])
  })

  it('rejects on an error reply, and on a reply in another shape', async () => {
    worker(502, { error: 'upstream' })
    await expect(fetchedPassages({ book: '1KI', chapter: 21 }, 'NIV')).rejects.toThrow('502')
    worker(200, { text: 'not verses' })
    await expect(fetchedPassages({ book: '1KI', chapter: 21 }, 'NIV')).rejects.toThrow('shape')
    worker(200, { verses: [{ number: 'one', text: 'x' }] })
    await expect(fetchedPassages({ book: '1KI', chapter: 21 }, 'NIV')).rejects.toThrow('shape')
  })
})

// The dev server's stand-ins (Gate 33 A9): the service answers the game's origins only.
describe('the dev server’s stand-in passages (Gate 33 A9)', () => {
  it('answers each verse with its own reference, a range as asked and a chapter as forty', async () => {
    const asked = worker(200, { verses })
    await expect(standIns({ book: '1SA', chapter: 17, from: 17, to: 18 }, 'NIV')).resolves.toEqual({
      verses: [
        { number: 17, text: '1SA 17:17' },
        { number: 18, text: '1SA 17:18' },
      ],
    })
    const chapter = await standIns({ book: '1KI', chapter: 21 }, 'NIV')
    expect(chapter.verses.map((v) => v.text)).toEqual(
      Array.from({ length: 40 }, (_, i) => `1KI 21:${i + 1}`),
    )
    expect(asked).toEqual([])
  })
})
