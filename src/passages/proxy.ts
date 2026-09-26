import type { PassageService, PassageText, Verse } from './service.ts'

/**
 * The passage service through the proxy (#3): one GET to the Worker with the reference as its
 * query, and the verses back as the contract has them. Anything but a good reply of that shape
 * rejects, and the reveal shows its unreachable line. The Worker's address is its workers.dev
 * name; a dev shell may point at a local one — `VITE_PASSAGES_URL=http://localhost:8787`.
 */
const proxy = import.meta.env.VITE_PASSAGES_URL ?? 'https://behold-esv.garishay.workers.dev'

const verse = (v: unknown): v is Verse =>
  typeof v === 'object' &&
  v !== null &&
  'text' in v &&
  typeof v.text === 'string' &&
  (!('number' in v) || typeof v.number === 'number')

const passageText = (x: unknown): x is PassageText =>
  typeof x === 'object' &&
  x !== null &&
  'verses' in x &&
  Array.isArray(x.verses) &&
  x.verses.every(verse)

export const fetchedPassages: PassageService = async (passage, translation) => {
  const query = new URLSearchParams({
    translation,
    book: passage.book,
    chapter: String(passage.chapter),
  })
  if (passage.from !== undefined && passage.to !== undefined) {
    query.set('from', String(passage.from))
    query.set('to', String(passage.to))
  }
  const reply = await fetch(`${proxy}/passage?${query}`)
  if (!reply.ok) throw new Error(`the proxy answered ${reply.status}`)
  const body: unknown = await reply.json()
  if (!passageText(body)) throw new Error('the proxy answered in another shape')
  return body
}
