import { describe, expect, it } from 'vitest'
import { valley } from '../cases/valley/case.ts'
import { vineyard } from '../cases/vineyard/case.ts'
import {
  chooseMoment,
  chooseOrderSlot,
  chooseSlot,
  chooseWord,
  closable,
  filled,
  fresh,
  kindOf,
  marked,
  nothing,
  opened,
  read,
  step,
  submit,
  tap,
  total,
  wrong,
} from './state.ts'

describe('the model (#6)', () => {
  it('starts on the first moment with nothing found', () => {
    const p = fresh(vineyard)
    expect(p.moment).toBe('vineyard')
    expect(p.order).toEqual([null, null, null])
    expect(filled(vineyard, p)).toBe(0)
    expect(total(vineyard)).toBe(3 + 1 + 7)
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
    expect(wrong(vineyard, p)).toBe(2 + 0 + 7)
    // A partial order is nothing filled and one thing wrong — never a thing filled at the first
    // tile, or the submit could open with the order half done (the owner's note at 03a's open).
    const partial = { ...fresh(vineyard), order: ['bedchamber', null, null] }
    expect(filled(vineyard, partial)).toBe(0)
    expect(wrong(vineyard, partial)).toBe(3 + 1 + 7)
    p = { ...p, order: ['gate', 'bedchamber', 'vineyard'] }
    expect(wrong(vineyard, p)).toBe(2 + 1 + 7)
  })

  // The tutorial goes all the way to rule 5 (#26 [4]): it steps on as each until is met, marks
  // only the slots its steps name, sends the player back to the picture until every spot is found
  // (#25), and — all right — waits for the submit like any other case.
  it('the guided case steps on as each until is met, then closes only on the submit', () => {
    let p = fresh(valley)
    expect(step(valley, p)?.id).toBe('step1')
    expect(opened(valley, p, 'solve')).toBe(p)
    p = tap(valley, p, 'boy').progress
    // The boy's tap found two words, and the dock's line says so until the next tap (#77).
    expect(step(valley, p)?.id).toBe('step2')
    p = read(valley, p)
    expect(step(valley, p)?.id).toBe('step3')
    expect(opened(valley, p, 'look')).toBe(p)
    p = opened(valley, p, 'solve')
    expect(step(valley, p)?.id).toBe('step4')
    p = chooseSlot(valley, p, chooseWord(valley, p, nothing, 'david').selection, 'd1').progress
    expect(step(valley, p)?.id).toBe('step5')
    expect(closable(valley, p)).toBe(false)
    p = chooseSlot(valley, p, chooseWord(valley, p, nothing, 'sling').selection, 't4').progress
    expect(step(valley, p)?.id).toBe('step6')
    expect(closable(valley, p)).toBe(false)
    // The sword's blank is asked about only on a miss, so no step names it (#77).
    expect(['d1', 't4', 't5', 'd2', 't1'].map((slot) => marked(valley, slot))).toEqual([
      true,
      true,
      false,
      false,
      false,
    ])
    for (const spot of ['giant', 'brook', 'armor', 'basket']) p = tap(valley, p, spot).progress
    expect(step(valley, p)?.id).toBe('step6')
    p = tap(valley, p, 'bearer').progress
    expect([step(valley, p)?.id, closable(valley, p)]).toEqual(['step7', true])
    const answers = { d2: 'goliath', t1: 'ten', t2: 'commander', t3: 'six', t5: 'goliath' }
    for (const [slot, word] of Object.entries(answers))
      p = chooseSlot(valley, p, chooseWord(valley, p, nothing, word).selection, slot).progress
    expect(wrong(valley, p)).toBe(0)
    expect(p.solved).toBe(false)
    expect([step(valley, p)?.id, closable(valley, p)]).toEqual(['step7', true])
    p = submit(valley, p)
    expect(p.solved).toBe(true)
    expect(step(valley, p)).toBeUndefined()
  })

  // The step that sends the player to the picture is met by everything filled too, whichever comes
  // first: the shield bearer's one word fills no blank, so all seven can be filled without him, and
  // Close the case must not wait on him (Gate 20 A1 as ruled).
  it('the sweep is met by every spot found or everything filled, whichever comes first', () => {
    const spots = ['boy', 'giant', 'brook', 'armor', 'basket']
    let p = opened(
      valley,
      spots.reduce((q, id) => tap(valley, q, id).progress, fresh(valley)),
      'solve',
    )
    const fills = { d1: 'david', t4: 'sling', d2: 'goliath', t1: 'ten', t2: 'commander', t3: 'six' }
    for (const [slot, word] of Object.entries(fills))
      p = chooseSlot(valley, p, chooseWord(valley, p, nothing, word).selection, slot).progress
    expect([step(valley, p)?.id, closable(valley, p)]).toEqual(['step6', false])
    p = chooseSlot(valley, p, chooseWord(valley, p, nothing, 'david').selection, 't5').progress
    // Everything filled meets the sweep, wrong sword and all: the question waits for a miss (#77).
    expect([step(valley, p)?.id, closable(valley, p)]).toEqual(['step7', true])
  })

  // A step already done never shows (#25): sling in its blank before David is named, and the
  // tutorial goes from David's slot straight to Close the case. Opening Solve reads the dock's line
  // first, as any move does, so a player who opens it from the keyboard is never held there (#77).
  it('skips a step whose until is already met', () => {
    let p = opened(valley, tap(valley, fresh(valley), 'boy').progress, 'solve')
    expect(step(valley, p)?.id).toBe('step4')
    p = chooseSlot(valley, p, chooseWord(valley, p, nothing, 'sling').selection, 't4').progress
    expect(step(valley, p)?.id).toBe('step4')
    p = chooseSlot(valley, p, chooseWord(valley, p, nothing, 'david').selection, 'd1').progress
    expect(step(valley, p)?.id).toBe('step6')
    const found = tap(valley, tap(valley, fresh(valley), 'boy').progress, 'giant').progress
    expect(step(valley, found)?.id).toBe('step3')
  })

  it('a case without steps closes only on a submit with nothing wrong', () => {
    let p = fresh(vineyard)
    const right = {
      faces: { p1: 'ahab', p2: 'jezebel', p3: 'naboth' },
      order: ['bedchamber', 'gate', 'vineyard'],
      fills: {
        s1: 'garden',
        s2: 'vineyard',
        s3: 'inheritance',
        s4: 'jezebel',
        s5: 'the-king',
        v1: 'killed',
        v2: 'taken-possession',
      },
    }
    p = { ...p, ...right, fills: { ...right.fills, s2: 'garden' } }
    expect(filled(vineyard, p)).toBe(total(vineyard))
    expect(p.solved).toBe(false)
    expect(submit(vineyard, p).solved).toBe(false)
    p = { ...p, fills: right.fills }
    expect(p.solved).toBe(false)
    expect(submit(vineyard, p).solved).toBe(true)
  })
})
