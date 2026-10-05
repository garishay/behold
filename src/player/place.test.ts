import { describe, expect, it } from 'vitest'
import { labelAt } from './place.ts'

// jsdom lays nothing out, so where a mark's words go is held here on the floor's numbers, 360 ×
// 548: on Look the dock's top is at 365, with the bar under it; on Solve there is no dock (#77).
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

  it('on Solve, with no dock, either side of the screen’s middle, as before', () => {
    expect(labelAt(ring(471, 523), 548, 548)).toEqual({ bottom: 548 - 471 + 8 })
    expect(labelAt(ring(100, 200), 548, 548)).toEqual({ top: 208 })
  })

  // A hint's first tier may ring the left or right half: its ring runs the picture's height, so
  // neither side leaves the words their room with a line to spare (74.5 px), and they sit at the
  // room's foot, over the ring, above the dock, for one moment's picture and for several.
  it('at the room’s foot, over a ring that leaves them no room on either side', () => {
    expect(labelAt(ring(0, 365), 365, 548)).toEqual({ bottom: 548 - 365 + 8 })
    expect(labelAt(ring(56, 365), 365, 548)).toEqual({ bottom: 548 - 365 + 8 })
    expect(labelAt(ring(50, 290), 365, 548)).toEqual({ bottom: 548 - 365 + 8 })
  })

  // The paid round's second session (#23, 2026-10-05): step 5's words sat under sling's blank,
  // over the account's lines, the whole time she was stuck there. On Solve the account's lines on
  // show split the room: the valley's at the floor run from 232 to the scroll's foot at 319, with
  // the faces above them and the bank and the bar below (#77).
  it('on Solve, never over the account’s lines: beside a target clear of them, else just under them', () => {
    const lines = { top: 232, bottom: 319 }
    // Sling's blank, among the lines: its words go just under them.
    expect(labelAt(ring(144.5, 182.5), 548, 548, { top: 0, bottom: 319 })).toEqual({ top: 327 })
    // The slot under the boy, above them: its words keep above them, where they have room.
    expect(labelAt(ring(133.2, 185.2), 548, 548, lines)).toEqual({ bottom: 548 - 133.2 + 8 })
    // A word in the bank, below them, low in its room: its words stay below the lines.
    expect(labelAt(ring(431, 471), 548, 548, lines)).toEqual({ bottom: 548 - 431 + 8 })
    // Close the case, just under them: its words go below it, over the bank.
    expect(labelAt(ring(257, 315), 548, 548, { top: 0, bottom: 253 })).toEqual({ top: 323 })
  })
})
