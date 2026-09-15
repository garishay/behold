/**
 * A passage, from the request to the ESV and back: the reference read from a query, the ESV's
 * URL for it, and its text parsed into verses — the reply side of the app's contract (Gate 03
 * [2]). Pure functions, so the test drives them without a Worker.
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

/** The ESV's own name for a reference: `1 Kings 21`, `1 Samuel 17:17-18`. */
export const query = (r: Reference) =>
  `${books[r.book][0]} ${r.chapter}` + (r.from === undefined ? '' : `:${r.from}-${r.to}`)

/**
 * The text endpoint's URL for a reference: verse numbers on, and everything else off — the
 * reference line, the headings, the footnotes and their bodies, the short copyright, the
 * horizontal lines, every indent, and the line wrapping — so the text is the verses alone,
 * each behind its bracketed number, and nothing needs stripping after.
 */
export function esvUrl(r: Reference): string {
  const url = new URL('https://api.esv.org/v3/passage/text/')
  url.search = new URLSearchParams({
    q: query(r),
    'include-passage-references': 'false',
    'include-verse-numbers': 'true',
    'include-first-verse-numbers': 'true',
    'include-footnotes': 'false',
    'include-footnote-body': 'false',
    'include-headings': 'false',
    'include-short-copyright': 'false',
    'include-copyright': 'false',
    'include-passage-horizontal-lines': 'false',
    'include-heading-horizontal-lines': 'false',
    'indent-paragraphs': '0',
    'indent-poetry': 'false',
    'indent-poetry-lines': '0',
    'indent-declares': '0',
    'indent-psalm-doxology': '0',
    'line-length': '0',
  }).toString()
  return url.toString()
}

/**
 * The verses in the ESV's text: each begins at its bracketed number — `[16]`, or `[21:1]` where
 * a chapter starts — and runs to the next. Whitespace inside a verse, a line break included, is
 * one space; a verse left with no words is not one.
 */
export function parse(text: string): Verse[] {
  const starts = [...text.matchAll(/\[(?:\d+:)?(\d+)\]/g)]
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
