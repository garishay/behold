/**
 * A passage, from the request to API.Bible and back: the reference read from a query, its name,
 * API.Bible's URL for it, and its text parsed into verses — the reply side of the app's contract
 * (Gate 03 [2]). Pure functions, so the test drives them without a Worker.
 */
import { books } from './books.ts'

/** The request side of the contract: a book code, a chapter, and a verse range within it or none. */
export interface Reference {
  readonly book: string
  readonly chapter: number
  readonly from?: number
  readonly to?: number
}

/** One verse of the reply: its number, and its words. */
export interface Verse {
  readonly number: number
  readonly text: string
}

/** A whole number of one or more, or nothing. */
const count = (s: string | null) => (s !== null && /^[1-9]\d*$/.test(s) ? Number(s) : undefined)

/**
 * The reference a query carries, or nothing when it is not one: a book in the table, a chapter
 * the book has, and either no range or one from one verse to a later or the same verse.
 */
export function reference(params: URLSearchParams): Reference | undefined {
  const book = params.get('book') ?? ''
  const chapter = count(params.get('chapter'))
  if (!Object.hasOwn(books, book) || chapter === undefined || chapter > books[book][1])
    return undefined
  if (params.get('from') === null && params.get('to') === null) return { book, chapter }
  const from = count(params.get('from'))
  const to = count(params.get('to'))
  if (from === undefined || to === undefined || from > to) return undefined
  return { book, chapter, from, to }
}

/** A reference's name, the store's key for its passage: `1 Kings 21`, `1 Samuel 17:17-18`. */
export const cite = (r: Reference) =>
  `${books[r.book][0]} ${r.chapter}` + (r.from === undefined ? '' : `:${r.from}-${r.to}`)

/**
 * API.Bible's URL for a reference in one of its Bibles (Gate 33 A1): a whole chapter by its chapter
 * ID, `1KI.21`, and a range as a passage from one verse ID to another, `1SA.17.17-1SA.17.18`. The
 * text comes plain, with its verse numbers and no titles, notes, or chapter numbers, so nothing
 * needs stripping after; and FUMS's third version puts in the reply the token that each view of
 * the passage is reported with (`fums.ts`).
 */
export function bibleUrl(r: Reference, bible: string): string {
  const chapter = `${r.book}.${r.chapter}`
  const path =
    r.from === undefined
      ? `chapters/${chapter}`
      : `passages/${chapter}.${r.from}-${chapter}.${r.to}`
  const url = new URL(`https://rest.api.bible/v1/bibles/${bible}/${path}`)
  url.search = new URLSearchParams({
    'content-type': 'text',
    'include-verse-numbers': 'true',
    'include-titles': 'false',
    'include-notes': 'false',
    'include-chapter-numbers': 'false',
    'fums-version': '3',
  }).toString()
  return url.toString()
}

/**
 * The verses in API.Bible's text: each begins at its bracketed number, `[16]`, and runs to the
 * next. Whitespace inside a verse, a line break or a paragraph's indent included, is one space; a
 * verse left with no words is not one. No word is changed.
 */
export function parse(text: string): Verse[] {
  const starts = [...text.matchAll(/\[(\d+)\]/g)]
  const verses: Verse[] = []
  starts.forEach((m, i) => {
    const end = starts[i + 1]?.index ?? text.length
    const words = text
      .slice(m.index + m[0].length, end)
      .replace(/\s+/g, ' ')
      .trim()
    if (words !== '') verses.push({ number: Number(m[1]), text: words })
  })
  return verses
}
