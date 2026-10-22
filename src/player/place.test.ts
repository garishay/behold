import { afterEach, describe, expect, it, vi } from 'vitest'
import { inside, labelAt, show, showEmpty } from './place.ts'

// A short count with no empty slot in view (#23, the next round's second tester): the nearest
// empty slot below what the account shows is brought into view, and the nearest above only when
// none is left below (#104); one in view is enough.
describe('an empty slot brought into view (#24)', () => {
  afterEach(() => document.body.replaceChildren())
  const account = (...slots: [number, boolean][]) => {
    document.body.replaceChildren()
    const box = document.body.appendChild(document.createElement('div'))
    box.className = 'solve'
    vi.spyOn(box, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 100, 360, 300))
    for (const [top, full] of slots) {
      const slot = box.appendChild(document.createElement('button'))
      slot.dataset.slot = `s${top}`
      if (full) slot.className = 'is-filled'
      vi.spyOn(slot, 'getBoundingClientRect').mockReturnValue(new DOMRect(40, top, 72, 30))
    }
    const scroll = vi.spyOn(box, 'scrollBy')
    showEmpty()
    return scroll.mock.calls.map(([o]) => (o as ScrollToOptions).top)
  }

  // The next round's first tester (#104): with the loaves' blank just above the view and the
  // sword's below it, his fill of Saul's blank sent the account up: "why are going upward? I
  // thought we were going downward." The account reads downward, so a fill goes on down.
  it('brings the nearest empty slot below, above only when none is below, and none while one is in view', () => {
    expect(account([0, false], [520, false], [200, true])).toEqual([150])
    expect(account([0, false], [-100, false], [200, true])).toEqual([-100])
    expect(account([-200, false], [430, false])).toEqual([60])
    expect(account([0, false], [250, false])).toEqual([])
    expect(account([0, true], [250, true])).toEqual([])
  })
})

// A waiting blank's sentence, shown whole in the account (#24, Solve's room): the account here is
// the valley's at the tester's 360 × 645, 301 px from 0, and the sentence three lines, 92 px.
describe('a target shown whole in its scroll box (#24)', () => {
  const at = (top: number, height: number) => {
    const box = document.createElement('div')
    box.className = 'solve'
    const el = box.appendChild(document.createElement('span'))
    vi.spyOn(box, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 360, 301))
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(new DOMRect(20, top, 320, height))
    const scroll = vi.spyOn(box, 'scrollBy')
    show(el)
    return scroll.mock.calls.map(([o]) => (o as ScrollToOptions).top)
  }

  it('scrolls the least it takes: down past the foot, up past the top, or not at all', () => {
    expect(at(270, 92)).toEqual([61])
    expect(at(-40, 92)).toEqual([-40])
    expect(at(100, 92)).toEqual([])
  })

  it('shows one taller than the box from its top', () => {
    expect(at(150, 320)).toEqual([150])
  })
})

// jsdom lays nothing out, so where a mark's words go is held here on the floor's numbers, 360 ×
// 548: on Look the dock's top is at 365, with the bar under it (#77). On Solve the words take a
// row of their own (#159).
describe('where a mark’s words sit (#25, #77)', () => {
  const ring = (top: number, bottom: number) => ({ left: 100, right: 200, top, bottom })

  it('below a target in the top half of their room, above one in its bottom half', () => {
    expect(labelAt(ring(10, 210), 365, 548)).toEqual({ top: 218 })
    expect(labelAt(ring(230, 290), 365, 548)).toEqual({ bottom: 548 - 230 + 8 })
  })

  // The paid round's first session: on a short screen the words above Solve's button sat on the
  // caption. On Look their room ends at the dock, so a target in the bar has its words above it.
  it('on Look, clear of the dock: a target in the bar has its words above the dock', () => {
    expect(labelAt(ring(471, 523), 365, 548)).toEqual({ bottom: 548 - 365 + 8 })
  })

  // A hint's first tier may ring the left or right half: its ring runs the picture's height, so
  // neither side leaves the words their room with a line to spare (74.5 px), and they sit at the
  // room's foot, over the ring, above the dock, for one moment's picture and for several.
  it('at the room’s foot, over a ring that leaves them no room on either side', () => {
    expect(labelAt(ring(0, 365), 365, 548)).toEqual({ bottom: 548 - 365 + 8 })
    expect(labelAt(ring(56, 365), 365, 548)).toEqual({ bottom: 548 - 365 + 8 })
    expect(labelAt(ring(50, 290), 365, 548)).toEqual({ bottom: 548 - 365 + 8 })
  })

  // The owner's phone check of version code 2, at the largest font: a mark's words, set twice as
  // large, take more than the room kept for them (#152). Placed by their height as drawn, they keep
  // to the screen.
  it('by their height as drawn, at a phone’s larger text, and never past the screen’s top', () => {
    // Below a target in the top half, where they fit; too tall for that, at the room's foot.
    expect(labelAt(ring(10, 150), 365, 548)).toEqual({ top: 158 })
    expect(labelAt(ring(10, 150), 365, 548, 220)).toEqual({ bottom: 548 - 365 + 8 })
    // Above a target, they stop where they would run past the top.
    expect(labelAt(ring(300, 360), 365, 548, 400)).toEqual({ bottom: 548 - 400 })
  })
})

// The owner's phone check of version code 2: at the largest font the valley's card ran past the
// screen's top, and its Start lay under the dock (#152). It moves to keep 12 px from either edge.
describe('the brief’s card kept on the screen (#152)', () => {
  it('moves down past the top, up past the foot, and not at all where it fits', () => {
    expect(inside({ top: -118, bottom: 568 }, 700)).toBe(130)
    expect(inside({ top: 120, bottom: 720 }, 700)).toBe(-32)
    expect(inside({ top: 78, bottom: 372 }, 700)).toBe(0)
  })
})
