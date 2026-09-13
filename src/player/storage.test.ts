import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cases } from '../cases/index.ts'
import { valley } from '../cases/valley/case.ts'
import { vineyard } from '../cases/vineyard/case.ts'
import { fresh } from './state.ts'
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
  // than crashing the title screen (review round 1, #20).
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
    const guided = { ...fresh(valley), step: 3 }
    localStorage.setItem(key, JSON.stringify({ valley: guided, ghost: fresh(valley) }))
    expect(load(cases)).toEqual({ valley: guided })
    localStorage.setItem(key, JSON.stringify({ valley: { ...guided, step: 4 } }))
    expect(load(cases)).toEqual({})
  })
})
