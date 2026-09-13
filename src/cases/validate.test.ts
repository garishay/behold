import { describe, expect, it } from 'vitest'
import type { CaseStructure, CaseText, Spot } from './types.ts'
import { validate } from './validate.ts'
import { valley } from './valley/case.ts'
import { en } from './valley/en.ts'
import { vineyard } from './vineyard/case.ts'
import { en as vineyardEn } from './vineyard/en.ts'

/*
 * One broken fixture per check in A6 (Gate 02): a registered case with one thing changed, each
 * failing the check it names and no other — the list is the one sentence. The fixtures are typed
 * as the base structure and text, since a break here is the validator's to find, not the
 * typecheck's; the registry test holds that the unbroken cases pass.
 */

type Text = CaseText<CaseStructure>

const moment = valley.moments[0]
const account = en.blocks.account

/** The valley with its one moment's spots replaced. */
const withSpots = (spots: readonly Spot[]): CaseStructure => ({
  ...valley,
  moments: [{ ...moment, spots }],
})

/** The valley with one spot changed. */
const withSpot = (id: string, patch: Partial<Spot>): CaseStructure =>
  withSpots(moment.spots.map((s) => (s.id === id ? { ...s, ...patch } : s)))

/** The valley's text with the account's parts replaced. */
const withParts = (parts: Text['blocks'][string]['parts']): Text => ({
  ...en,
  blocks: { account: { ...account, parts } },
})

describe('validate (Gate 02 A6)', () => {
  it('(a) an id that is not a slug', () => {
    expect(validate({ ...valley, id: 'Valley' }, en)).toEqual(['case "Valley" is not a slug'])
  })

  it('(a) an id declared twice within its kind', () => {
    const twice: CaseStructure = { ...valley, faces: [...valley.faces, valley.faces[0]] }
    expect(validate(twice, en)).toEqual(['face "d1" is declared twice'])
  })

  it('(b) a thumb that is not a moment', () => {
    expect(validate({ ...valley, thumb: 'brook' }, en)).toEqual(['thumb "brook" is not a moment'])
  })

  it('(b) a passage without a book code, without a chapter, or with a reversed range', () => {
    const kings: CaseStructure = { ...vineyard, passages: [{ book: 'Kings', chapter: 21 }] }
    expect(validate(kings, vineyardEn)).toEqual(['passage Kings 21 has no book code'])
    const [passage] = vineyard.passages
    const zero: CaseStructure = { ...vineyard, passages: [passage, { book: '1KI', chapter: 0 }] }
    expect(validate(zero, vineyardEn)).toEqual(['passage 1KI 0 has no chapter'])
    const reversed = { book: '1KI', chapter: 22, from: 9, to: 5 }
    const range: CaseStructure = { ...vineyard, passages: [passage, reversed] }
    expect(validate(range, vineyardEn)).toEqual(['passage 1KI 22:9-5 is not a verse range'])
  })

  it('(c) a picture that is not a file name', () => {
    const png: CaseStructure = { ...valley, moments: [{ ...moment, picture: 'valley.png' }] }
    expect(validate(png, en)).toEqual(['moment "valley" picture "valley.png" is not a file name'])
  })

  it('(c) nine spots in a moment', () => {
    const more = ['seven', 'eight', 'nine'].map((id) => ({
      id,
      box: [0, 0, 1, 1] as const,
      words: [],
    }))
    expect(validate(withSpots([...moment.spots, ...more]), en)).toEqual([
      'moment "valley" has 9 spots, not one to eight',
    ])
  })

  it('(c) a box past the edge of the picture, and a box with no width', () => {
    expect(validate(withSpot('brook', { box: [80, 80, 30, 20] }), en)).toEqual([
      'spot "brook" box [80, 80, 30, 20] does not lie inside the picture',
    ])
    expect(validate(withSpot('brook', { box: [0, 80, 0, 20] }), en)).toEqual([
      'spot "brook" box [0, 80, 0, 20] does not lie inside the picture',
    ])
  })

  it('(c) a spot yielding a word the case does not declare', () => {
    const [brook] = moment.spots
    expect(validate(withSpot('brook', { words: [...brook.words, 'pebbles'] }), en)).toEqual([
      'spot "brook" yields "pebbles", not a word',
    ])
    // A key the object's prototype has: `in` would have let it through.
    expect(validate(withSpot('brook', { words: [...brook.words, 'constructor'] }), en)).toEqual([
      'spot "brook" yields "constructor", not a word',
    ])
  })

  it('(c) a spot showing a person who is not a face', () => {
    expect(validate(withSpot('boy', { person: 'd9' }), en)).toEqual([
      'spot "boy" shows "d9", not a face',
    ])
  })

  it('(c) a spot opening a paper whose id is not a slug', () => {
    expect(validate(withSpot('basket', { paper: 'The Note' }), en)).toEqual([
      'spot "basket" opens "The Note", not a slug',
    ])
  })

  it('(c) a cite that is not one', () => {
    expect(validate(withSpot('brook', { cites: 'v40' }), en)).toEqual([
      'spot "brook" cites "v40", not a cite',
    ])
    expect(validate(withSpot('brook', { cites: '17:41-40' }), en)).toEqual([
      'spot "brook" cites "17:41-40", not a cite',
    ])
  })

  it('(c) a cite outside the passages — the basket with the 17:17–18 range removed', () => {
    const one: CaseStructure = { ...valley, passages: [valley.passages[1]] }
    expect(validate(one, en)).toEqual(['spot "basket" cites "17:17-18", outside the passages'])
  })

  it('(c) the book in front of a cite exactly when the passages span more than one book', () => {
    expect(validate(withSpot('brook', { cites: '1SA 17:40' }), en)).toEqual([
      'spot "brook" cites "1SA 17:40" with its book in front, and the passages are one book',
    ])
    // Two books, every cite prefixed but the brook's.
    const prefixed = moment.spots.map((s) =>
      s.id === 'brook' ? s : { ...s, cites: `1SA ${s.cites}` },
    )
    const two: CaseStructure = {
      ...withSpots(prefixed),
      passages: [...valley.passages, { book: '2SA', chapter: 1 }],
    }
    expect(validate(two, en)).toEqual([
      'spot "brook" cites "17:40" without its book in front, and the passages span more than one book',
    ])
    // Prefixed with the wrong book: no passage of 2 Samuel has a chapter 17.
    const spots = prefixed.map((s) => (s.id === 'brook' ? { ...s, cites: '2SA 17:40' } : s))
    expect(validate({ ...two, moments: [{ ...moment, spots }] }, en)).toEqual([
      'spot "brook" cites "2SA 17:40", outside the passages',
    ])
  })

  it('(d) a word no spot yields', () => {
    const staff: CaseStructure = { ...valley, words: { ...valley.words, staff: 'noun' } }
    expect(validate(staff, en)).toEqual(['word "staff" is yielded by no spot'])
  })

  it('(e) a portrait that is not a file name, and an answer that is not a name word', () => {
    const [d1, d2] = valley.faces
    expect(validate({ ...valley, faces: [{ ...d1, picture: 'd1' }, d2] }, en)).toEqual([
      'face "d1" picture "d1" is not a file name',
    ])
    expect(validate({ ...valley, faces: [{ ...d1, answer: 'sling' }, d2] }, en)).toEqual([
      'face "d1" answers "sling", not a name word',
    ])
  })

  it('(f) a case with no block', () => {
    expect(validate({ ...vineyard, blocks: [] }, vineyardEn)).toEqual(['the case has no block'])
  })

  it('(f) a blank answered by a word the case does not declare', () => {
    const [block] = valley.blocks
    const bread: CaseStructure = {
      ...valley,
      blocks: [{ ...block, blanks: { ...block.blanks, t1: 'bread' } }],
    }
    expect(validate(bread, en)).toEqual(['blank "t1" answers "bread", not a word'])
  })

  it('(f) a blank appearing twice in its block, or not at all', () => {
    expect(validate(valley, withParts([...account.parts, { b: 't1' }]))).toEqual([
      'blank "t1" appears 2 times in block "account", not once',
    ])
    expect(validate(valley, withParts(account.parts.filter((p) => p.b !== 't1')))).toEqual([
      'blank "t1" appears 0 times in block "account", not once',
    ])
  })

  it('(g) an order that is not the moments in some order', () => {
    expect(validate({ ...vineyard, order: ['bedchamber', 'gate'] }, vineyardEn)).toEqual([
      'order [bedchamber, gate] is not the moments in some order',
    ])
    const twice = ['bedchamber', 'gate', 'gate']
    expect(validate({ ...vineyard, order: twice }, vineyardEn)).toEqual([
      'order [bedchamber, gate, gate] is not the moments in some order',
    ])
  })

  it('(h) a step before the last without an until, and a last step with one', () => {
    const [first, ...rest] = valley.steps
    expect(validate({ ...valley, steps: [{ id: 'step1' }, ...rest] }, en)).toEqual([
      'step "step1" is not last and lacks an until',
    ])
    const last = { id: 'step4', until: { tapped: 'boy' } }
    expect(validate({ ...valley, steps: [first, ...rest.slice(0, 2), last] }, en)).toEqual([
      'step "step4" is last and has an until',
    ])
  })

  it('(h) an until naming no spot, or no face and no blank', () => {
    const [, second, ...rest] = valley.steps
    const tap = { id: 'step1', until: { tapped: 'sling' } }
    expect(validate({ ...valley, steps: [tap, second, ...rest] }, en)).toEqual([
      'step "step1" waits on "sling", not a spot',
    ])
    const fill = { id: 'step2', until: { filled: 'boy' } }
    expect(validate({ ...valley, steps: [valley.steps[0], fill, ...rest] }, en)).toEqual([
      'step "step2" waits on "boy", not a face or a blank',
    ])
  })

  it('(i) an empty caption, paper body, reveal paragraph, or run of text', () => {
    const boy: Text = { ...en, captions: { ...en.captions, boy: ' ' } }
    expect(validate(valley, boy)).toEqual(['text.captions.boy is empty'])
    const seal = { ...vineyardEn.papers.seal, body: '' }
    const papers: Text = { ...vineyardEn, papers: { ...vineyardEn.papers, seal } }
    expect(validate(vineyard, papers)).toEqual(['text.papers.seal.body is empty'])
    expect(validate(valley, { ...en, reveal: [en.reveal[0], ''] })).toEqual([
      'text.reveal.1 is empty',
    ])
    expect(validate(valley, withParts([{ t: '' }, ...account.parts]))).toEqual([
      'text.blocks.account.parts.0.t is empty',
    ])
  })

  it('(i) a run of text that is one space between two blanks is not empty', () => {
    const [first, ...rest] = account.parts
    expect(validate(valley, withParts([first, { t: ' ' }, ...rest]))).toEqual([])
  })
})
