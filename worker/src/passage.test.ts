// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { books } from './books.ts'
import { bibleUrl, cite, parse, reference } from './passage.ts'

const params = (q: string) => new URLSearchParams(q)

describe('the book table (#3)', () => {
  it('holds the sixty-six books by their USFM codes, with their chapters', () => {
    expect(Object.keys(books)).toHaveLength(66)
    for (const code of Object.keys(books)) expect(code).toMatch(/^[1-3A-Z][A-Z]{2}$/)
    expect(Object.values(books).reduce((n, [, chapters]) => n + chapters, 0)).toBe(1189)
    expect(books['1KI']).toEqual(['1 Kings', 22])
    expect(books.SNG).toEqual(['Song of Solomon', 8])
  })
})

describe('a reference read from a query', () => {
  it('reads a whole chapter, and a range', () => {
    expect(reference(params('book=1KI&chapter=21'))).toEqual({ book: '1KI', chapter: 21 })
    expect(reference(params('book=1SA&chapter=17&from=17&to=18'))).toEqual({
      book: '1SA',
      chapter: 17,
      from: 17,
      to: 18,
    })
    expect(reference(params('book=OBA&chapter=1&from=3&to=3'))).toEqual({
      book: 'OBA',
      chapter: 1,
      from: 3,
      to: 3,
    })
  })

  it.each([
    ['a book off the table', 'book=1KG&chapter=21'],
    ['a code that is a prototype property', 'book=constructor&chapter=1'],
    ['a chapter the book lacks', 'book=1KI&chapter=23'],
    ['no chapter', 'book=1KI'],
    ['a chapter that is not a count', 'book=1KI&chapter=0'],
    ['a chapter with a fraction', 'book=1KI&chapter=2.5'],
    ['a range backwards', 'book=1KI&chapter=21&from=5&to=2'],
    ['half a range', 'book=1KI&chapter=21&from=5'],
    ['a verse that is not a count', 'book=1KI&chapter=21&from=a&to=2'],
  ])('refuses %s', (_, q) => {
    expect(reference(params(q))).toBeUndefined()
  })
})

describe('API.Bible asked (Gate 33 A1)', () => {
  it('names a passage as the store keys it', () => {
    expect(cite({ book: '1KI', chapter: 21 })).toBe('1 Kings 21')
    expect(cite({ book: '1SA', chapter: 17, from: 17, to: 18 })).toBe('1 Samuel 17:17-18')
  })

  it('asks for a whole chapter by its ID, and a range as a passage of two verse IDs', () => {
    const path = (r: Parameters<typeof bibleUrl>[0]) => new URL(bibleUrl(r, 'the-bible')).pathname
    expect(path({ book: '1KI', chapter: 21 })).toBe('/v1/bibles/the-bible/chapters/1KI.21')
    expect(path({ book: '1SA', chapter: 17, from: 17, to: 18 })).toBe(
      '/v1/bibles/the-bible/passages/1SA.17.17-1SA.17.18',
    )
    expect(path({ book: '1SA', chapter: 17, from: 4, to: 4 })).toBe(
      '/v1/bibles/the-bible/passages/1SA.17.4-1SA.17.4',
    )
    expect(new URL(bibleUrl({ book: '1KI', chapter: 21 }, 'the-bible')).origin).toBe(
      'https://rest.api.bible',
    )
  })

  it('asks for the text with its verse numbers, no titles, notes, or chapter numbers, and a FUMS token', () => {
    const url = new URL(bibleUrl({ book: '1KI', chapter: 21 }, 'the-bible'))
    expect(Object.fromEntries(url.searchParams)).toEqual({
      'content-type': 'text',
      'include-verse-numbers': 'true',
      'include-titles': 'false',
      'include-notes': 'false',
      'include-chapter-numbers': 'false',
      'fums-version': '3',
    })
  })
})

// API.Bible's text shape around made-up sentences — never a verse (CLAUDE.md, Guardrails).
describe('the text parsed into verses', () => {
  it('splits at each bracketed number, and folds whitespace, a paragraph’s indent included', () => {
    expect(parse('     [1] One thing\nhappened.  [2] Another\n\n     [3] A third. \n')).toEqual([
      { number: 1, text: 'One thing happened.' },
      { number: 2, text: 'Another' },
      { number: 3, text: 'A third.' },
    ])
  })

  it('gives nothing for text with no verse, and skips a number with no words', () => {
    expect(parse('')).toEqual([])
    expect(parse('no markers here')).toEqual([])
    expect(parse('[4] [5] Words.')).toEqual([{ number: 5, text: 'Words.' }])
  })

  // API.Bible's NIV sets a narrow no-break space, U+202F, between nested quotation marks, and
  // JavaScript's `\s` and trim() both take it for whitespace (#12 [Q27]).
  it('folds and trims only spaces, tabs, and line breaks, and keeps every other space as given', () => {
    const nested = '\u201c\u202f\u2018Made up.\u2019\u202f\u201d'
    expect(parse(`     [6] He said, ${nested}\n     [7]\t\u00a0Made\u2009up.\u202f`)).toEqual([
      { number: 6, text: `He said, ${nested}` },
      { number: 7, text: '\u00a0Made\u2009up.\u202f' },
    ])
  })
})
