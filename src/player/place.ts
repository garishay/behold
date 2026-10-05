/** A box on screen, in CSS px: a mark's ring, its target's, or a scroll box's. */
export interface Box {
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

/**
 * The room a mark's words are given, in CSS px: two lines of the stylesheet's `.coach .label`, 15
 * px at 1.3, and the one more a phone may set them in, inside its 8 px of padding (#77).
 */
export const words = 16 + 3 * 19.5

/**
 * Where a mark's words sit (#25): below a target in the top half of their room, above one in its
 * bottom half, wherever that side leaves them their room, and else at the room's foot, over the
 * ring, as a hint's ring on half the picture needs. On Look the room ends at the dock, so the
 * words never cover its caption, and a target below the dock's top, in the bar, has its words
 * above the dock (#77).
 */
export function labelAt(ring: Box, floor: number, height: number) {
  const below = (ring.top + ring.bottom) / 2 < floor / 2
  if (below && ring.bottom + 8 + words <= floor) return { top: ring.bottom + 8 }
  const top = Math.min(ring.top, floor)
  return { bottom: height - (top - 8 - words >= 0 ? top : floor) + 8 }
}
