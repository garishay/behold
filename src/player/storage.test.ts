import { beforeEach, describe, expect, it, vi } from 'vitest'
import { carmel } from '../cases/carmel/case.ts'
import { cases } from '../cases/index.ts'
import { valley } from '../cases/valley/case.ts'
import { vineyard } from '../cases/vineyard/case.ts'
import { fresh, wrongs } from './state.ts'
import { load, save } from './storage.ts'

const key = 'behold.progress'

beforeEach(() => localStorage.clear())

describe('progress on the device (#6, A6)', () => {
  it('round-trips every case’s progress', () => {
    const all = { valley: fresh(valley), vineyard: { ...fresh(vineyard), bank: ['ahab'] } }
    save(all)
    expect(load(cases)).toEqual(all)
  })

  // Private mode, or a full store: the write is refused, the session goes on, and what was
  // stored stays (review round 4, #20).
  it('a refused write keeps the session going and the store as it was', () => {
    const all = { valley: fresh(valley) }
    save(all)
    const refuse = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    })
    try {
      expect(() => save({ ...all, vineyard: fresh(vineyard) })).not.toThrow()
      expect(load(cases)).toEqual(all)
    } finally {
      refuse.mockRestore()
    }
  })

  it('starts empty with nothing stored, or with a store that is not JSON', () => {
    expect(load(cases)).toEqual({})
    localStorage.setItem(key, '{not json')
    expect(load(cases)).toEqual({})
  })

  // A store that parses but is not progress is unreadable as progress: it starts empty rather
  // than crashing the cases page (review round 1, #20).
  it('starts empty with a store that is JSON but not a record of progress', () => {
    localStorage.setItem(key, 'null')
    expect(load(cases)).toEqual({})
    localStorage.setItem(key, '[1, 2]')
    expect(load(cases)).toEqual({})
  })

  it('drops an entry that is not progress and keeps the ones that are', () => {
    const whole = fresh(vineyard)
    localStorage.setItem(key, JSON.stringify({ valley: { moment: 'valley' }, vineyard: whole }))
    expect(load(cases)).toEqual({ vineyard: whole })
    localStorage.setItem(key, JSON.stringify({ valley: null, vineyard: 'done' }))
    expect(load(cases)).toEqual({})
  })

  // The shape reaches into each list and record: an entry whose members are not ids is not
  // progress either, and would crash the screen that reads the case text by them (round 3, #20).
  it('drops an entry whose lists or records hold anything but ids', () => {
    const whole = fresh(vineyard)
    for (const broken of [
      { ...whole, papers: [null] },
      { ...whole, bank: ['ahab', 7] },
      { ...whole, order: [1, null, null] },
      { ...whole, faces: { p1: 1 } },
      { ...whole, fills: { s1: ['garden'] } },
    ]) {
      localStorage.setItem(key, JSON.stringify({ vineyard: broken }))
      expect(load(cases), JSON.stringify(broken)).toEqual({})
    }
  })

  // The store never trusts an id the case lacks: an entry the case no longer fits starts fresh,
  // and so does one for a case the registry no longer has (#12 [Q4]).
  it('drops an entry whose ids its case no longer has, and one for a case not registered', () => {
    const played = {
      ...fresh(vineyard),
      tapped: ['seal'],
      bank: ['ahab', 'seal'],
      papers: ['seal'],
      faces: { p1: 'ahab' },
      fills: { s2: 'silver' },
      order: ['bedchamber', null, null],
    }
    localStorage.setItem(key, JSON.stringify({ vineyard: played }))
    expect(load(cases)).toEqual({ vineyard: played })
    for (const stale of [
      { ...played, moment: 'nowhere' },
      { ...played, tapped: ['seal', 'ghost'] },
      { ...played, bank: ['ahab', 'ghost'] },
      { ...played, papers: ['ghost'] },
      { ...played, faces: { p9: 'ahab' } },
      { ...played, faces: { p1: 'ghost' } },
      { ...played, fills: { s9: 'silver' } },
      { ...played, fills: { s2: 'ghost' } },
      { ...played, order: ['bedchamber', null] },
      { ...played, order: ['nowhere', null, null] },
      { ...played, step: 1 },
    ]) {
      localStorage.setItem(key, JSON.stringify({ vineyard: stale }))
      expect(load(cases), JSON.stringify(stale)).toEqual({})
    }
    // The last step is kept, and a step past it is not, however many steps the tutorial has (#77).
    const guided = { ...fresh(valley), step: valley.steps.length - 1 }
    localStorage.setItem(key, JSON.stringify({ valley: guided, ghost: fresh(valley) }))
    expect(load(cases)).toEqual({ valley: guided })
    localStorage.setItem(key, JSON.stringify({ valley: { ...guided, step: valley.steps.length } }))
    expect(load(cases)).toEqual({})
  })

  // The tutorial's question moved from a step to the retry, and the dock's line read joined the
  // steps after the boy's tap (#77). Progress kept at the old question's place is on the sweep now,
  // which it has met, so it loads on the last step, wrong sword and all.
  it('moves kept progress past every step it has met', () => {
    const tapped = ['boy', 'giant', 'brook', 'armor', 'basket', 'bearer']
    const kept = {
      ...fresh(valley),
      tapped,
      faces: { d1: 'david' },
      fills: { t4: 'sling', t5: 'david' },
      step: 5,
    }
    localStorage.setItem(key, JSON.stringify({ valley: kept }))
    expect(load(cases).valley.step).toBe(6)
  })

  // Each blank asks what the story turns on (#96, B5 as ruled): a valley kept from before keeps the
  // loaves' count and the commander in the blanks they filled, now misses, and a mountain that
  // found one of its numbers, which have left its bank, starts fresh (#12 [Q4]).
  it('keeps a valley stored before #96 with its words as misses, and starts a mountain with a number fresh', () => {
    const before = {
      ...fresh(valley),
      tapped: ['basket'],
      bank: ['ten', 'brothers', 'commander'],
      fills: { t1: 'ten', t2: 'commander' },
    }
    const numbered = { ...fresh(carmel), tapped: ['pourers'], bank: ['four', 'jars'] }
    localStorage.setItem(key, JSON.stringify({ valley: before, carmel: numbered }))
    const kept = load(cases)
    expect(kept).toEqual({ valley: before })
    expect(wrongs(valley, kept.valley).filter((id) => kept.valley.fills[id])).toEqual(['t1', 't2'])
  })

  // A valley closed before #96 holds the loaves' count and the commander. A closed case that would
  // now find something wrong loads unsolved, its slots filled, and one that wouldn't stays closed
  // (#12 [Q13]).
  it('reopens a closed case that would now find something wrong, and keeps one that would not', () => {
    const spots = valley.moments.flatMap((m) => m.spots)
    const closed = {
      ...fresh(valley),
      tapped: spots.map((x) => x.id),
      bank: [...new Set(spots.flatMap((x) => x.words))],
      faces: { d1: 'david', d2: 'goliath' },
      fills: { t1: 'ten', t2: 'commander', t3: 'six', t4: 'sling', t5: 'goliath' },
      step: valley.steps.length - 1,
      solved: true,
    }
    localStorage.setItem(key, JSON.stringify({ valley: closed }))
    expect(load(cases).valley).toEqual({ ...closed, solved: false })
    const right = { ...closed, fills: { ...closed.fills, t1: 'brothers', t2: 'saul' } }
    localStorage.setItem(key, JSON.stringify({ valley: right }))
    expect(load(cases).valley).toEqual(right)
  })

  // Progress gained the hints used (#29). An entry kept before them has used none and keeps its
  // place, where the shape check alone would start it fresh; a tier that is not one is dropped.
  it('reads an entry kept before hints as none used, and drops a tier that is not one', () => {
    const played = { ...fresh(vineyard), tapped: ['seal'], bank: ['ahab', 'seal'] }
    const before: Partial<typeof played> = { ...played }
    delete before.hints
    localStorage.setItem(key, JSON.stringify({ vineyard: before }))
    expect(load(cases)).toEqual({ vineyard: played })
    localStorage.setItem(key, JSON.stringify({ vineyard: { ...played, hints: [1, 3] } }))
    expect(load(cases)).toEqual({})
  })

  // Progress gained what the closes found wrong (#107), so a reload or a return keeps the reveal's
  // misses. An entry kept before them has none and keeps its place; a miss naming a slot, a word,
  // or a moment its case lacks is not trusted, and the case starts fresh (#12 [Q4]).
  it('keeps what the closes found wrong, reads an entry kept before as none, and drops a stranger', () => {
    const order = ['gate bedchamber vineyard']
    const kept = { ...fresh(vineyard), misses: { s4: ['ahab', 'naboth'], order } }
    localStorage.setItem(key, JSON.stringify({ vineyard: kept }))
    expect(load(cases)).toEqual({ vineyard: kept })
    const before: Partial<typeof kept> = { ...kept }
    delete before.misses
    localStorage.setItem(key, JSON.stringify({ vineyard: before }))
    expect(load(cases)).toEqual({ vineyard: { ...kept, misses: {} } })
    const strangers = [{ s9: ['ahab'] }, { s4: ['goliath'] }, { order: ['gate pool vineyard'] }]
    for (const misses of [...strangers, { s4: [1] }]) {
      localStorage.setItem(key, JSON.stringify({ vineyard: { ...kept, misses } }))
      expect(load(cases), JSON.stringify(misses)).toEqual({})
    }
  })
})
