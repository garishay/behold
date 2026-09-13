import { beforeEach, describe, expect, it } from 'vitest'
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
    expect(load()).toEqual(all)
  })

  it('starts empty with nothing stored, or with a store that is not JSON', () => {
    expect(load()).toEqual({})
    localStorage.setItem(key, '{not json')
    expect(load()).toEqual({})
  })

  // A store that parses but is not progress is unreadable as progress: it starts empty rather
  // than crashing the title screen (review round 1, #20).
  it('starts empty with a store that is JSON but not a record of progress', () => {
    localStorage.setItem(key, 'null')
    expect(load()).toEqual({})
    localStorage.setItem(key, '[1, 2]')
    expect(load()).toEqual({})
  })

  it('drops an entry that is not progress and keeps the ones that are', () => {
    const whole = fresh(vineyard)
    localStorage.setItem(key, JSON.stringify({ valley: { moment: 'valley' }, vineyard: whole }))
    expect(load()).toEqual({ vineyard: whole })
    localStorage.setItem(key, JSON.stringify({ valley: null, vineyard: 'done' }))
    expect(load()).toEqual({})
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
      expect(load(), JSON.stringify(broken)).toEqual({})
    }
  })
})
