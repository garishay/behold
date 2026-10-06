import { describe, expect, it } from 'vitest'
import { cases } from '../cases/index.ts'
import { carmel } from '../cases/carmel/case.ts'
import { valley } from '../cases/valley/case.ts'
import { vineyard } from '../cases/vineyard/case.ts'
import type { Box, CaseStructure } from '../cases/types.ts'
import { aim, firstWrong, half, stranded } from './hints.ts'
import { fresh, tap, type Progress } from './state.ts'

/** A case with every spot tapped. */
const swept = (s: CaseStructure) =>
  s.moments.flatMap((m) => m.spots).reduce((p: Progress, x) => tap(s, p, x.id).progress, fresh(s))

describe('what a hint points at (#29)', () => {
  // Small things are what a sweep misses, so a hint on the unfound starts with the smallest.
  it('the smallest thing unfound on the moment on stage, then on the first moment with one', () => {
    expect(aim(vineyard, fresh(vineyard), null)).toEqual({ spot: 'stain', why: 'unfound' })
    const first = vineyard.moments[0].spots.map((x) => x.id)
    const done = first.reduce((p, id) => tap(vineyard, p, id).progress, fresh(vineyard))
    expect(aim(vineyard, done, null)).toEqual({ spot: 'seal', why: 'unfound' })
  })

  it('after a failed close, the evidence for what it found wrong; then the first empty thing’s', () => {
    const p = swept(valley)
    expect(aim(valley, p, 't5')).toEqual({ spot: 'giant', why: 'evidence' })
    expect(aim(valley, p, null)).toEqual({ spot: 'boy', why: 'evidence' })
    const faces = { d1: 'david', d2: 'goliath' }
    expect(aim(valley, { ...p, faces }, null)).toEqual({ spot: 'basket', why: 'evidence' })
  })

  it('Close the case once everything is found and filled', () => {
    const fills = { t1: 'brothers', t2: 'saul', t3: 'six', t4: 'sling', t5: 'goliath' }
    const p = { ...swept(valley), faces: { d1: 'david', d2: 'goliath' }, fills }
    expect(aim(valley, p, null)).toEqual({ why: 'close' })
  })

  // A close's hint is kept from the close, by the first thing it found wrong in Solve's order: the
  // faces, then the order, named by the moment that belongs where it isn't, then the blanks.
  it('the first thing wrong: a face, then the order’s first place by its moment, then a blank', () => {
    const faces = { c1: 'elijah', c2: 'ahab' }
    const p = { ...fresh(carmel), faces, order: ['water', 'baal', 'fire'] }
    const evidence: CaseStructure['evidence'] = carmel.evidence
    expect(firstWrong(carmel, p)).toBe('baal')
    expect(evidence[firstWrong(carmel, p)!]).toBe('mocker')
    expect(firstWrong(carmel, { ...p, faces: { c1: 'ahab', c2: 'ahab' } })).toBe('c1')
    expect(firstWrong(carmel, { ...p, order: ['baal', 'water', 'fire'] })).toBe('a1')
  })
})

describe('a player with nothing left to place (#65)', () => {
  /** The valley with these spots tapped and these words placed. */
  const played = (ids: string[], placed: Pick<Progress, 'faces' | 'fills'>) => ({
    ...ids.reduce((p, id) => tap(valley, p, id).progress, fresh(valley)),
    ...placed,
  })

  // Playtest 2's valley (#23): the boy's two words placed, and five slots no word can fill. Before
  // any word is found the bank says to tap the picture, so nobody is stranded yet.
  it('is stranded while no empty face or blank has a loose word of its kind, and names the kinds', () => {
    const p = played(['boy'], { faces: { d1: 'david' }, fills: { t4: 'sling' } })
    expect(stranded(valley, p)).toEqual(new Set(['name', 'noun', 'number']))
    expect(stranded(valley, tap(valley, p, 'basket').progress).size).toBe(0)
    expect(stranded(valley, fresh(valley)).size).toBe(0)
  })

  // The smallest thing unfound is the shield bearer, whose one word is a thing, and no thing is
  // empty: the hint passes it for the armor, which yields a name.
  it('points a stranded player at the smallest unfound thing that yields a word they are missing', () => {
    const faces = { d1: 'david' }
    const p = played(['boy', 'basket'], {
      faces,
      fills: { t1: 'brothers', t3: 'ten', t4: 'sling' },
    })
    expect(stranded(valley, p)).toEqual(new Set(['name']))
    expect(aim(valley, p, null)).toEqual({ spot: 'armor', why: 'stranded' })
    // With the cubits' blank empty, a loose word fits it, and the hint is the plain one.
    const q = played(['boy', 'basket'], { faces, fills: { t1: 'brothers', t4: 'sling' } })
    expect(aim(valley, q, null)).toEqual({ spot: 'bearer', why: 'unfound' })
  })
})

describe('the half of the picture (#29)', () => {
  it('holds the box, across the midline its middle lies farther from', () => {
    expect(half([61.5, 49.5, 15, 11])).toEqual([50, 0, 50, 100])
    expect(half([8, 17.1, 22.6, 11.6])).toEqual([0, 0, 50, 100])
    expect(half([67.5, 0, 32.5, 21])).toEqual([0, 0, 100, 50])
    expect(half([0, 83, 100, 17])).toEqual([0, 50, 100, 50])
  })

  // Tier 1's ring holds its whole thing (A3 as ruled): where a box crosses its half's midline, the
  // ring grows to take it in, as for the battle's horns held overhead and the mountain's burning
  // stones. 11 of the 51 registered spots cross.
  it('grows past the midline to hold every registered spot whole', () => {
    const eps = 1e-9
    const holds = ([l, t, w, h]: Box, [L, T, W, H]: Box) =>
      l >= L && t >= T && l + w <= L + W + eps && t + h <= T + H + eps
    const cut = cases
      .flatMap(({ structure: s }) =>
        s.moments.flatMap((m) => m.spots).map((x) => [s.id, x] as const),
      )
      .filter(([, x]) => !holds(x.box, half(x.box)))
      .map(([id, x]) => `${id}: ${x.id}`)
    expect(cut).toEqual([])
    expect(half([30, 28, 37, 63])).toEqual([0, 28, 100, 72])
    expect(half([31.5, 0, 40.5, 66])).toEqual([0, 0, 100, 66])
  })
})
