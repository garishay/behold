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

/** The boxes a target scrolls in: the account, a zoomed picture, the bank's words (07c, #24). */
const scrollers = '.solve, .stage, .chips'

/** A target's scroll box, if it sits in one. */
export const scroller = (el: Element) => el.parentElement?.closest<HTMLElement>(scrollers) ?? null

/**
 * Brings a target to the middle of its own scroll box, and never scrolls the page: the case
 * screen does not scroll, and a target outside a scroll box is always in view (07c, #24 [1]).
 * The scroll box's `scroll-behavior` is the stylesheet's, so reduced motion jumps. Both axes move
 * in one scroll: a second, even by nothing, would abort the first while it glides (#47).
 */
export function bring(el: Element | null) {
  const box = el && scroller(el)
  if (!el || !box) return
  const r = el.getBoundingClientRect()
  const b = box.getBoundingClientRect()
  box.scrollBy({
    top: r.top + r.height / 2 - (b.top + b.height / 2),
    left: r.left + r.width / 2 - (b.left + b.width / 2),
  })
}
