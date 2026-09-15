// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { books } from './books.ts'
import { esvUrl, parse, query, reference } from './passage.ts'

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

describe('the ESV asked', () => {
  it('names the passage as the ESV does', () => {
    expect(query({ book: '1KI', chapter: 21 })).toBe('1 Kings 21')
    expect(query({ book: '1SA', chapter: 17, from: 17, to: 18 })).toBe('1 Samuel 17:17-18')
  })

  it('asks the text endpoint for verse numbers and nothing else', () => {
    const url = new URL(esvUrl({ book: '1KI', chapter: 21 }))
    expect(url.origin + url.pathname).toBe('https://api.esv.org/v3/passage/text/')
    expect(url.searchParams.get('q')).toBe('1 Kings 21')
    expect(url.searchParams.get('include-verse-numbers')).toBe('true')
    expect(url.searchParams.get('include-first-verse-numbers')).toBe('true')
    const off = [
      'include-passage-references',
      'include-footnotes',
      'include-footnote-body',
      'include-headings',
      'include-short-copyright',
      'include-copyright',
      'include-passage-horizontal-lines',
      'include-heading-horizontal-lines',
      'indent-poetry',
    ]
    for (const name of off) expect(url.searchParams.get(name), name).toBe('false')
    const zero = [
      'indent-paragraphs',
      'indent-poetry-lines',
      'indent-declares',
      'indent-psalm-doxology',
      'line-length',
    ]
    for (const name of zero) expect(url.searchParams.get(name), name).toBe('0')
  })
})

// The ESV's shape around made-up sentences — never a verse (CLAUDE.md, Guardrails).
describe('the text parsed into verses', () => {
  it('splits at each bracketed number, a chapter start included, and folds whitespace', () => {
    expect(parse('[21:1] One thing\nhappened.  [2] Another\n\n[3] A third. ')).toEqual([
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
})
