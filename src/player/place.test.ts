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
})
