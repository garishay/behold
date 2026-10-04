import { describe, expect, it } from 'vitest'
import { carmel } from './carmel/case.ts'
import { en as carmelEn } from './carmel/en.ts'
import { micaiah } from './micaiah/case.ts'
import { en as micaiahEn } from './micaiah/en.ts'
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

  // A face declared twice would also leave the names one short of a rival for each (k), so the
  // step stands in for it here.
  it('(a) an id declared twice within its kind', () => {
    const twice: CaseStructure = { ...valley, steps: [valley.steps[0], ...valley.steps] }
    expect(validate(twice, en)).toEqual(['step "step1" is declared twice'])
  })

  // A face id that is also a blank id would make a step's `filled` name both (#6). The blank
  // is given its part, so only the collision is reported.
  it('(a) a face id that is also a blank id', () => {
    const collide: CaseStructure = {
      ...valley,
      blocks: [{ id: 'account', blanks: { ...valley.blocks[0].blanks, d1: 'david' } }],
    }
    expect(validate(collide, withParts([...account.parts, { b: 'd1' }]))).toEqual([
      'face "d1" is also a blank',
    ])
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
    // In the sky over the boy's head, clear of every box and each above the floor (l).
    const more = ['seven', 'eight', 'nine'].map((id, i) => ({
      id,
      box: [50 + 16 * i, 2, 14, 12] as const,
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
    // A box with no width has no room for a fingertip either (l).
    expect(validate(withSpot('brook', { box: [0, 80, 0, 20] }), en)).toEqual([
      'spot "brook" box [0, 80, 0, 20] does not lie inside the picture',
      'spot "brook" keeps no 44 px square of its own at 320 px wide',
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

  // The bank adds each word once, a promise about the data the validator holds (#12 [Q3]).
  it('(c) a spot yielding the same word twice', () => {
    const [brook] = moment.spots
    expect(validate(withSpot('brook', { words: [...brook.words, 'five'] }), en)).toEqual([
      'spot "brook" yields "five" twice',
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
    const [giant, basket, rest] = valley.passages
    const one: CaseStructure = { ...valley, passages: [giant, rest] }
    expect(basket).toEqual({ book: '1SA', chapter: 17, from: 17, to: 18 })
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

  it('(i) an empty caption, paper body, reveal paragraph, heading, or run of text', () => {
    const boy: Text = { ...en, captions: { ...en.captions, boy: ' ' } }
    expect(validate(valley, boy)).toEqual(['text.captions.boy is empty'])
    const heading: Text = { ...en, blocks: { account: { ...account, heading: ' ' } } }
    expect(validate(valley, heading)).toEqual(['text.blocks.account.heading is empty'])
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

  it('(i) a run of whitespace alone is empty unless it lies between two blanks', () => {
    // The run between the first two blanks made a space: the space between them, allowed.
    const between = account.parts.map((p, i) => (i === 2 ? { t: ' ' } : p))
    expect(validate(valley, withParts(between))).toEqual([])
    // Leading, trailing, and the only run of a block without blanks (review round 1, #17).
    expect(validate(valley, withParts([{ t: ' ' }, ...account.parts]))).toEqual([
      'text.blocks.account.parts.0.t is empty',
    ])
    expect(validate(valley, withParts([...account.parts, { t: '\n' }]))).toEqual([
      'text.blocks.account.parts.11.t is empty',
    ])
    const note: CaseStructure = {
      ...valley,
      blocks: [...valley.blocks, { id: 'note', blanks: {} }],
    }
    const noteText: Text = {
      ...en,
      blocks: { ...en.blocks, note: { heading: 'A note', parts: [{ t: '  ' }] } },
    }
    expect(validate(note, noteText)).toEqual(['text.blocks.note.parts.0.t is empty'])
  })

  // (j) and (k) are #26 [1]'s: a blank's kind has its answer and two rivals in the case, and the
  // names outnumber the faces.
  it('(j) a blank whose kind has fewer than three words in the case — the valley without five', () => {
    const words = Object.fromEntries(Object.entries(valley.words).filter(([w]) => w !== 'five'))
    const noFive: CaseStructure = { ...withSpot('brook', { words: ['stones'] }), words }
    expect(validate(noFive, en)).toEqual([
      'blank "t1" takes a "number" word, and the case has 2, not three',
      'blank "t3" takes a "number" word, and the case has 2, not three',
    ])
  })

  it('(k) no more names than faces — the vineyard without Elijah', () => {
    const [first, ...others] = vineyard.moments
    const spots = first.spots.map((s) => (s.id === 'prophet' ? { ...s, words: ['killed'] } : s))
    const words = Object.fromEntries(Object.entries(vineyard.words).filter(([w]) => w !== 'elijah'))
    const noElijah: CaseStructure = {
      ...vineyard,
      words,
      moments: [{ ...first, spots }, ...others],
    }
    expect(validate(noElijah, vineyardEn)).toEqual([
      'the case has 3 names for 3 faces, not one more',
    ])
  })

  // (l) is #27 [1]'s: the fingertip every spot keeps for itself. The basket, smaller than the boy,
  // laid over his upper body down to the giant's box, which already covers his legs where he stands
  // astride the giant's head (#35): drawn on top, the two leave the boy nowhere a fingertip lands on
  // him alone.
  it('(l) a spot with no fingertip of its own — the boy under the basket', () => {
    expect(validate(withSpot('basket', { box: [55, 3, 36, 37] }), en)).toEqual([
      'spot "boy" keeps no 44 px square of its own at 320 px wide',
    ])
  })

  // #27's floor, a tenth of the width on a side, is 32 px at 320: a box under it fails (l) alone.
  it('(l) a box under the floor — the basket 9% wide, 28.8 px at 320', () => {
    expect(validate(withSpot('basket', { box: [80, 40, 9, 14] }), en)).toEqual([
      'spot "basket" keeps no 44 px square of its own at 320 px wide',
    ])
  })

  // The Zoom pill is drawn over every picture, so (l) counts it (#24, ruling [1]): a spot in the
  // valley's top left corner, 48 × 46.9 px at 320, keeps its square only where the pill sits.
  it('(l) a spot under the Zoom pill — a patch of sky in the valley’s corner', () => {
    const sky = { id: 'sky', box: [0, 0, 15, 11], words: [] } as const
    expect(validate(withSpots([...moment.spots, sky]), en)).toEqual([
      'spot "sky" keeps no 44 px square of its own at 320 px wide',
    ])
  })

  // (m) is #25's: a step's words sit beside its target, eight at most.
  it('(m) a step of nine words — step 3 with a second "tap"', () => {
    const long: Text = {
      ...en,
      steps: { ...en.steps, step3: 'Tap David, then tap the slot under the boy.' },
    }
    expect(validate(valley, long)).toEqual(['step "step3" says 9 words, not eight or fewer'])
  })

  // The last step's retry sits beside its mark too (#25).
  it('(m) a retry of nine words — "Some answers are wrong" in full', () => {
    const long: Text = { ...en, retry: 'Some answers are wrong. Look closer, then try again.' }
    expect(validate(valley, long)).toEqual(['the retry says 9 words, not eight or fewer'])
  })

  // So does the question the tutorial asks on a miss, and it asks about a face or a blank (#77).
  it('(m) a question of nine words, and one asked about a spot', () => {
    const long: Text = { ...en, ask: 'Whose sword was it? Look closer at the picture.' }
    expect(validate(valley, long)).toEqual(['the question says 9 words, not eight or fewer'])
    expect(validate({ ...valley, ask: 'boy' }, en)).toEqual([
      'the case asks about "boy", not a face or a blank of a guided case',
    ])
  })

  // (n) is #30's: a case that teaches the order has one, and the lesson is eight words at most.
  it('(n) a lesson on the order in a case without one — Carmel with its order cut', () => {
    expect(validate({ ...carmel, order: undefined }, carmelEn)).toEqual([
      'the case teaches an order it lacks',
    ])
  })

  it('(n) a lesson of nine words — Carmel’s with a "one"', () => {
    const long: Text = {
      ...carmelEn,
      teach: 'These are out of order. Which one happened first?',
    }
    expect(validate(carmel, long)).toEqual(["the case's lesson says 9 words, not eight or fewer"])
  })

  // #53 adds the face the battle teaches at: it must be one of the case's faces.
  it('(n) a lesson on a face the case lacks — the battle’s on "m3"', () => {
    expect(validate({ ...micaiah, teach: { face: 'm3' } }, micaiahEn)).toEqual([
      'the case teaches face "m3", not a face',
    ])
  })

  // (o) is #29's: a hint points at evidence, so each face and blank names a spot that settles it,
  // and each moment of an order one of its own spots, the one that tells when it happened.
  it('(o) a blank with no evidence, a face with a spot the case lacks, a moment with another’s', () => {
    const evidence = Object.fromEntries(
      Object.entries(valley.evidence).filter(([id]) => id !== 't5'),
    )
    expect(validate({ ...valley, evidence: { ...evidence, d2: 'sky' } }, en)).toEqual([
      'face "d2" names no spot as its evidence',
      'blank "t5" names no spot as its evidence',
    ])
    const water: CaseStructure = { ...carmel, evidence: { ...carmel.evidence, water: 'praying' } }
    expect(validate(water, carmelEn)).toEqual([
      'moment "water" names none of its own spots as its evidence',
    ])
  })

  // (p) is #77's: playtest 2's testers read the order as shown, straight down, and a case whose
  // pictures came in the order they happened would mark that reading right.
  it('(p) pictures shown in the order they happened — Carmel with Baal’s altar first', () => {
    const [water, fire, baal] = carmel.moments
    expect(validate({ ...carmel, moments: [baal, water, fire] }, carmelEn)).toEqual([
      'the moments are shown in the order they happened, [baal, water, fire]',
    ])
  })
})
