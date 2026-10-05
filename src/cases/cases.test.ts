// The test reads the pictures from disk under Vitest, which runs on Node; the app project declares
// no Node types, so this file brings them in itself rather than widening tsconfig.app.json.
/// <reference types="node" />
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { books } from '../../worker/src/books.ts'
import { strings } from '../strings/en.ts'
import { cases } from './index.ts'
import { validate } from './validate.ts'

/** A JPEG's pixel size — width, height — read from its start-of-frame marker. */
function jpegSize(file: Buffer): [number, number] {
  expect(file.readUInt16BE(0)).toBe(0xffd8)
  for (let at = 2; at < file.length; at += 2 + file.readUInt16BE(at + 2)) {
    expect(file[at]).toBe(0xff)
    const marker = file[at + 1]
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
      return [file.readUInt16BE(at + 7), file.readUInt16BE(at + 5)]
  }
  throw new Error('no start-of-frame marker')
}

const each = cases.map((c) => [c.structure.id, c.structure] as const)

describe('the case registry (Gate 02 A1, A5)', () => {
  it('lists each case once', () => {
    const ids = cases.map((c) => c.structure.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  // The player's first case is the tutorial — a behaviour, held here. The full sequence is
  // content, and the registry is its source of truth (review round 3, #16, the owner's ruling).
  it('opens with the guided case', () => {
    expect(cases[0].structure.steps?.length ?? 0).toBeGreaterThan(0)
  })

  it.each(each)('%s: every moment’s picture is in its folder at the declared size', (id, c) => {
    for (const m of c.moments)
      expect(jpegSize(readFileSync(`public/cases/${id}/${m.picture}`)), m.id).toEqual([...m.size])
  })

  it.each(each)('%s: every face’s portrait is in its folder', (id, c) => {
    for (const f of c.faces) {
      const [width, height] = jpegSize(readFileSync(`public/cases/${id}/${f.picture}`))
      expect(width, f.id).toBeGreaterThan(0)
      expect(height, f.id).toBeGreaterThan(0)
    }
  })

  // A moment's picture is generated from its scene brief, written from its spots (world rules §6,
  // #30). Every case has its briefs, so a case whose `scenes.md` is missing fails here ([Q9], #33);
  // each moment has one, and each spot is named in it with the box the structure holds, so a
  // re-fitted box re-writes its line.
  it.each(each)('%s: every spot is named in its moment’s scene brief, with its box', (id, c) => {
    const file = `src/cases/${id}/scenes.md`
    expect(existsSync(file), file).toBe(true)
    const briefs = readFileSync(file, 'utf8').split('\n## ').slice(1)
    for (const m of c.moments) {
      const brief = briefs.find((b) => b.startsWith(`${m.id} `))
      expect(brief, m.id).toBeDefined()
      for (const s of m.spots) expect(brief, s.id).toContain(`\`${s.id}\` [${s.box.join(', ')}]`)
    }
  })

  // Every passage is one the Worker can serve: its book in the one table, its chapter one the
  // book has (#3, from 02b's closure) — so a reference the reveal could not show fails here, in
  // CI, and never on a phone. The app itself carries no copy of the table.
  it.each(each)('%s: every passage is in the Worker’s book table', (_, c) => {
    for (const p of c.passages) {
      expect(Object.hasOwn(books, p.book), p.book).toBe(true)
      expect(p.chapter, `${p.book} ${p.chapter}`).toBeLessThanOrEqual(books[p.book][1])
    }
  })

  // Layer 2 (Gate 02 A6): the validator's list is empty for every registered case, in each of
  // its languages.
  it.each(cases.map((c) => [c.structure.id, c] as const))('%s: validates', (_, c) => {
    for (const [language, text] of Object.entries(c.text))
      expect(validate(c.structure, text), language).toEqual([])
  })

  // The paid round's second session (#23, 2026-10-05): she spoke of knowledge, not clues. A failed
  // close's miss is the picture's, never the player's (#77): no word a player reads calls an answer
  // wrong, in any case's text or in the app's copy, the close's count included in all its forms.
  it('no text the player reads calls an answer wrong', () => {
    const counts = [false, true].flatMap((several) =>
      [1, 3].map((n) => strings.noMatch(several, n)),
    )
    const read = [...cases.flatMap((c) => Object.values(c.text)), strings, counts]
    expect(JSON.stringify(read)).not.toMatch(/\bwrong\b/i)
  })

  // The vineyard turns on the seal: it must be the smallest box it overlaps, so it is drawn on top
  // and takes the tap (#28 [1]). Its box hugs her hand, the ring, and the clay (#27 [3]).
  it('the bedchamber’s seal is smaller than every box it overlaps', () => {
    const vineyard = cases.find((c) => c.structure.id === 'vineyard')!.structure
    const spots = vineyard.moments.find((m) => m.id === 'bedchamber')!.spots
    const seal = spots.find((s) => s.id === 'seal')!
    const area = ([, , w, h]: readonly number[]) => w * h
    const overlaps = ([l, t, w, h]: readonly number[], [L, T, W, H]: readonly number[]) =>
      l < L + W && L < l + w && t < T + H && T < t + h
    const over = spots.filter((s) => s.id !== 'seal' && overlaps(s.box, seal.box))
    expect(over.map((s) => s.id).sort()).toEqual(['sheets', 'woman'])
    for (const s of over) expect(area(s.box), s.id).toBeGreaterThan(area(seal.box))
  })
})
