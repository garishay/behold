// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { fetchedPassages } from './proxy.ts'

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

describe('the passage service through the proxy (#3)', () => {
  it('asks the Worker for a whole chapter, and for a range, and returns the verses', async () => {
    const asked = worker(200, { verses })
    await expect(fetchedPassages({ book: '1KI', chapter: 21 }, 'ESV')).resolves.toEqual({ verses })
    await fetchedPassages({ book: '1SA', chapter: 17, from: 17, to: 18 }, 'ESV')
    expect(asked).toEqual([
      'https://behold-esv.garishay.workers.dev/passage?translation=ESV&book=1KI&chapter=21',
      'https://behold-esv.garishay.workers.dev/passage?translation=ESV&book=1SA&chapter=17&from=17&to=18',
    ])
  })

  it('rejects on an error reply, and on a reply in another shape', async () => {
    worker(502, { error: 'upstream' })
    await expect(fetchedPassages({ book: '1KI', chapter: 21 }, 'ESV')).rejects.toThrow('502')
    worker(200, { text: 'not verses' })
    await expect(fetchedPassages({ book: '1KI', chapter: 21 }, 'ESV')).rejects.toThrow('shape')
    worker(200, { verses: [{ number: 'one', text: 'x' }] })
    await expect(fetchedPassages({ book: '1KI', chapter: 21 }, 'ESV')).rejects.toThrow('shape')
  })
})
