import { describe, expect, it } from 'vitest'
import { valley } from '../cases/valley/case.ts'
import { vineyard } from '../cases/vineyard/case.ts'
import {
  chooseMoment,
  chooseOrderSlot,
  chooseSlot,
  chooseWord,
  filled,
  fresh,
  kindOf,
  nothing,
  step,
  submit,
  tap,
  thinkStep,
  total,
  wrong,
} from './state.ts'

describe('the model (#6)', () => {
  it('starts on the first moment with nothing found', () => {
    const p = fresh(vineyard)
    expect(p.moment).toBe('vineyard')
    expect(p.order).toEqual([null, null, null])
    expect(filled(vineyard, p)).toBe(0)
    expect(total(vineyard)).toBe(3 + 1 + 9)
    expect(total(valley)).toBe(2 + 5)
  })

  it('a tap adds each word once, and the paper once', () => {
    const first = tap(vineyard, fresh(vineyard), 'seal')
    expect(first.added).toEqual(['ahab', 'seal'])
    expect(first.progress.papers).toEqual(['seal'])
    const again = tap(vineyard, first.progress, 'seal')
    expect(again.added).toEqual([])
    expect(again.progress.bank).toEqual(['ahab', 'seal'])
    expect(again.progress.papers).toEqual(['seal'])
    expect(again.progress.tapped).toEqual(['seal'])
  })

  it('a face takes a name and a blank its answer’s kind', () => {
    expect(kindOf(valley, 'd1')).toBe('name')
    expect(kindOf(valley, 't3')).toBe('number')
    expect(kindOf(valley, 'nowhere')).toBeUndefined()
  })

  it('a word of the wrong kind is refused by a waiting slot, and names the kind wanted', () => {
    const p = tap(valley, fresh(valley), 'boy').progress
    const waiting = chooseSlot(valley, p, nothing, 't3')
    expect(waiting.selection.target).toBe('t3')
    const refused = chooseWord(valley, p, waiting.selection, 'sling')
    expect(refused.wants).toBe('number')
    expect(refused.progress.fills).toEqual({})
    expect(refused.selection).toEqual({ ...nothing, word: 'sling' })
  })

  it('a word then a slot, or a slot then a word, fills it; a filled slot tapped alone empties', () => {
    const p = tap(valley, fresh(valley), 'boy').progress
    const picked = chooseWord(valley, p, nothing, 'david')
    const placed = chooseSlot(valley, picked.progress, picked.selection, 'd1')
    expect(placed.progress.faces).toEqual({ d1: 'david' })
    expect(placed.selection).toEqual(nothing)
    const emptied = chooseSlot(valley, placed.progress, nothing, 'd1')
    expect(emptied.progress.faces).toEqual({})
    const waiting = chooseSlot(valley, p, nothing, 't4')
    const filledIn = chooseWord(valley, p, waiting.selection, 'sling')
    expect(filledIn.progress.fills).toEqual({ t4: 'sling' })
  })

  it('a moment placed in a second order slot leaves the first', () => {
    const p = fresh(vineyard)
    const one = chooseOrderSlot(
      vineyard,
      p,
      chooseMoment(vineyard, p, nothing, 'gate').selection,
      0,
    )
    expect(one.progress.order).toEqual(['gate', null, null])
    const moved = chooseMoment(
      vineyard,
      one.progress,
      chooseOrderSlot(vineyard, one.progress, nothing, 2).selection,
      'gate',
    )
    expect(moved.progress.order).toEqual([null, null, 'gate'])
    expect(chooseOrderSlot(vineyard, moved.progress, nothing, 2).progress.order).toEqual([
      null,
      null,
      null,
    ])
  })

  it('counts what is filled and what is wrong, the order as one', () => {
    let p = fresh(vineyard)
    p = {
      ...p,
      order: ['bedchamber', 'gate', 'vineyard'],
      faces: { p1: 'ahab' },
      fills: { s1: 'silver' },
    }
    expect(filled(vineyard, p)).toBe(3)
    expect(wrong(vineyard, p)).toBe(2 + 0 + 9)
    p = { ...p, order: ['gate', 'bedchamber', 'vineyard'] }
    expect(wrong(vineyard, p)).toBe(2 + 1 + 9)
  })

  it('the guided case steps on as each until is met, and closes itself when all is right', () => {
    let p = fresh(valley)
    expect(step(valley, p)?.id).toBe('step1')
    expect(thinkStep(valley, p)).toBe(false)
    p = tap(valley, p, 'boy').progress
    expect(step(valley, p)?.id).toBe('step2')
    expect(thinkStep(valley, p)).toBe(true)
    p = chooseSlot(valley, p, chooseWord(valley, p, nothing, 'david').selection, 'd1').progress
    expect(step(valley, p)?.id).toBe('step3')
    p = chooseSlot(valley, p, chooseWord(valley, p, nothing, 'sling').selection, 't4').progress
    expect(step(valley, p)?.id).toBe('step4')
    for (const spot of ['giant', 'brook', 'armor', 'basket']) p = tap(valley, p, spot).progress
    const answers = { d2: 'goliath', t1: 'cheeses', t2: 'armor', t3: 'five', t5: 'sword' }
    for (const [slot, word] of Object.entries(answers)) {
      expect(p.solved).toBe(false)
      p = chooseSlot(valley, p, chooseWord(valley, p, nothing, word).selection, slot).progress
    }
    expect(p.solved).toBe(true)
    expect(step(valley, p)).toBeUndefined()
  })

  it('a case without steps closes only on a submit with nothing wrong', () => {
    let p = fresh(vineyard)
    const right = {
      faces: { p1: 'ahab', p2: 'jezebel', p3: 'naboth' },
      order: ['bedchamber', 'gate', 'vineyard'],
      fills: {
        s1: 'garden',
        s2: 'silver',
        s3: 'inheritance',
        s4: 'would-not-eat',
        s5: 'jezebel',
        s6: 'two',
        s7: 'stoned',
        v1: 'killed',
        v2: 'taken-possession',
      },
    }
    p = { ...p, ...right, fills: { ...right.fills, s2: 'lamp' } }
    expect(filled(vineyard, p)).toBe(total(vineyard))
    expect(p.solved).toBe(false)
    expect(submit(vineyard, p).solved).toBe(false)
    p = { ...p, fills: right.fills }
    expect(p.solved).toBe(false)
    expect(submit(vineyard, p).solved).toBe(true)
  })
})
