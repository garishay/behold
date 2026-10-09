import { describe, expect, it } from 'vitest'
import { valley } from '../cases/valley/case.ts'
import { vineyard } from '../cases/vineyard/case.ts'
import {
  advance,
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
  owed,
  read,
  step,
  submit,
  tap,
  total,
  wrong,
  wrongs,
  type Progress,
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
    const p = tap(valley, tap(valley, fresh(valley), 'boy').progress, 'giant').progress
    const picked = chooseWord(valley, p, nothing, 'goliath')
    const placed = chooseSlot(valley, picked.progress, picked.selection, 'd2')
    expect(placed.progress.faces).toEqual({ d2: 'goliath' })
    expect(placed.selection).toEqual(nothing)
    const emptied = chooseSlot(valley, placed.progress, nothing, 'd2')
    expect(emptied.progress.faces).toEqual({})
    const waiting = chooseSlot(valley, p, nothing, 't4')
    const filledIn = chooseWord(valley, p, waiting.selection, 'sling')
    expect(filledIn.progress.fills).toEqual({ t4: 'sling' })
  })

  // Playtest 2's paid round (#77): the sword's ✓ was emptied three times by a tap. A slot showing
  // its ✓ keeps its word, a word picked up stays picked up, and one wrong there still empties.
  it('a slot showing its ✓ keeps its word, and a word picked up stays picked up', () => {
    const p = tap(valley, tap(valley, fresh(valley), 'boy').progress, 'giant').progress
    const right = chooseSlot(valley, p, chooseWord(valley, p, nothing, 'david').selection, 'd1')
    expect(chooseSlot(valley, right.progress, nothing, 'd1').progress).toBe(right.progress)
    const sling = chooseWord(valley, right.progress, nothing, 'sling').selection
    expect(chooseSlot(valley, right.progress, sling, 'd1')).toEqual({
      progress: right.progress,
      selection: sling,
    })
    const asked = { ...p, fills: { t5: 'goliath' } }
    expect(chooseSlot(valley, asked, nothing, 't5', ['t5']).progress).toBe(asked)
    expect(chooseSlot(valley, asked, nothing, 't5').progress.fills).toEqual({})
    const wrongName = chooseSlot(
      valley,
      p,
      chooseWord(valley, p, nothing, 'goliath').selection,
      'd1',
    )
    expect(chooseSlot(valley, wrongName.progress, nothing, 'd1').progress.faces).toEqual({})
  })

  it('names the faces and blanks a close would find wrong', () => {
    const p = {
      ...fresh(valley),
      faces: { d1: 'david', d2: 'saul' },
      fills: { t1: 'brothers', t3: 'five' },
    }
    expect(wrongs(valley, p)).toEqual(['d2', 't3', 't2', 't4', 't5'])
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
    const answers = { d2: 'goliath', t1: 'brothers', t2: 'saul', t3: 'six', t5: 'goliath' }
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
    const fills = { d1: 'david', t4: 'sling', d2: 'goliath', t1: 'brothers', t2: 'saul', t3: 'six' }
    for (const [slot, word] of Object.entries(fills))
      p = chooseSlot(valley, p, chooseWord(valley, p, nothing, word).selection, slot).progress
    expect([step(valley, p)?.id, closable(valley, p)]).toEqual(['step6', false])
    p = chooseSlot(valley, p, chooseWord(valley, p, nothing, 'david').selection, 't5').progress
    // Everything filled meets the sweep, wrong sword and all: the question waits for a miss (#77).
    expect([step(valley, p)?.id, closable(valley, p)]).toEqual(['step7', true])
  })

  // The paid round's second session (#23, 2026-10-05): sword went into sling's blank at step 5, so
  // the step was never met, and with every slot filled there was no close and no word. Everything
  // filled meets every step, so a full account reaches the last, which offers the close (#77).
  it('a full account reaches the last step from any step, and is offered the close', () => {
    const kept = {
      ...fresh(valley),
      tapped: ['armor', 'giant', 'boy'],
      bank: ['saul', 'king', 'sword', 'goliath', 'six', 'spear', 'david', 'sling'],
      faces: { d1: 'david', d2: 'goliath' },
      fills: { t4: 'sword', t1: 'six', t2: 'king', t3: 'six', t5: 'saul' },
      step: 4,
    }
    expect([step(valley, kept)?.id, closable(valley, kept)]).toEqual(['step5', false])
    const moved = advance(valley, kept)
    expect([step(valley, moved)?.id, closable(valley, moved)]).toEqual(['step7', true])
    const emptied = chooseSlot(valley, moved, nothing, 't4').progress
    expect([step(valley, emptied)?.id, closable(valley, emptied)]).toEqual(['step7', true])
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

  // #107: the reveal leads with what the closes found wrong, so a failed close keeps each word put
  // where it doesn't fit, and the order as put, each once and the first found first; a close that
  // closes the case adds nothing.
  it('a failed close keeps what it found wrong, each word once, for the reveal', () => {
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
    /** The progress given, every slot holding its answer but the ones changed. */
    const off = (p: Progress, faces: object, order: string[], fills: object) => ({
      ...p,
      faces: { ...right.faces, ...faces },
      order,
      fills: { ...right.fills, ...fills },
    })
    const swapped = ['gate', 'bedchamber', 'vineyard']
    let p = submit(vineyard, off(fresh(vineyard), { p1: 'naboth' }, swapped, { s4: 'ahab' }))
    expect(p.misses).toEqual({ p1: ['naboth'], order: ['gate bedchamber vineyard'], s4: ['ahab'] })
    p = submit(vineyard, off(p, {}, right.order, { s4: 'ahab', v1: 'stoned' }))
    p = submit(vineyard, off(p, {}, right.order, { s4: 'jezebel', v1: 'stoned' }))
    p = submit(vineyard, off(p, {}, right.order, { s4: 'naboth', v1: 'stoned' }))
    const kept = { p1: ['naboth'], order: ['gate bedchamber vineyard'], s4: ['ahab', 'naboth'] }
    expect(p.misses).toEqual({ ...kept, v1: ['stoned'] })
    p = submit(vineyard, { ...p, ...right })
    expect([p.solved, p.misses]).toEqual([true, { ...kept, v1: ['stoned'] }])
  })
})

describe('what is left once the account is full (#114)', () => {
  it('is nothing while a blank is empty, then each face in Solve’s order, then the order', () => {
    const fills = Object.fromEntries(vineyard.blocks.flatMap((b) => Object.entries(b.blanks)))
    const { v2, ...short } = fills
    const p = { ...fresh(vineyard), fills: short }
    expect([v2, owed(vineyard, p)]).toEqual(['taken-possession', undefined])
    const full = { ...p, fills }
    expect(owed(vineyard, full)).toBe('p1')
    expect(owed(vineyard, { ...full, faces: { p1: 'ahab', p3: 'naboth' } })).toBe('p2')
    const named = { ...full, faces: { p1: 'ahab', p2: 'jezebel', p3: 'naboth' } }
    expect(owed(vineyard, { ...named, order: ['bedchamber', null, 'vineyard'] })).toBe('order')
    expect(owed(vineyard, { ...named, order: [...vineyard.order!] })).toBeUndefined()
  })
})
