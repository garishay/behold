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

/** A stretch of the screen from top to bottom, in CSS px: the account's lines on show. */
export interface Span {
  readonly top: number
  readonly bottom: number
}

/**
 * Where a mark's words sit (#25): below a target in the top half of their room, above one in its
 * bottom half, wherever that side leaves them their room, and else at the room's foot, over the
 * ring, as a hint's ring on half the picture needs. On Look the room ends at the dock, so the
 * words never cover its caption, and a target below the dock's top, in the bar, has its words
 * above the dock (#77). On Solve the account's lines on show split the room, so the words of a
 * target above them or below them stay that side, and a target among them has its words just
 * under them: no words cover the account (#77).
 */
export function labelAt(ring: Box, floor: number, height: number, lines?: Span) {
  const mid = (ring.top + ring.bottom) / 2
  if (lines && mid >= lines.top && mid <= lines.bottom) return { top: lines.bottom + 8 }
  const [lo, hi] = !lines ? [0, floor] : mid < lines.top ? [0, lines.top] : [lines.bottom, floor]
  if (mid - lo < (hi - lo) / 2 && ring.bottom + 8 + words <= hi) return { top: ring.bottom + 8 }
  const top = Math.min(ring.top, hi)
  return { bottom: height - (top - 8 - words >= lo ? top : hi) + 8 }
}

/** The boxes a target scrolls in: the account, a zoomed picture, the bank's words (07c, #24). */
const scrollers = '.solve, .stage, .chips'

/** A target's scroll box, if it sits in one. */
export const scroller = (el: Element) => el.parentElement?.closest<HTMLElement>(scrollers) ?? null

/**
 * Scrolls a target's scroll box the least it takes to show the target whole, or from its top when
 * it is taller than the box: a waiting blank's sentence (#24, Solve's room).
 */
export function show(el: Element | null | undefined) {
  const box = el && scroller(el)
  if (!el || !box) return
  const r = el.getBoundingClientRect()
  const b = box.getBoundingClientRect()
  const off =
    r.top < b.top || r.height > b.height ? r.top - b.top : Math.max(0, r.bottom - b.bottom)
  if (off !== 0) box.scrollBy({ top: off })
}

/**
 * While Solve still has empty slots and none of them is in view, brings one into view whole — its
 * face, the order, or its sentence — so a short count shows where it is short (#23, the next
 * round's second tester): the nearest below the view, since the account reads downward, and the
 * nearest above only when none is left below (#104, the next round's first tester).
 */
export function showEmpty() {
  const box = document.querySelector('.solve')
  if (!box) return
  const b = box.getBoundingClientRect()
  const empty = [...box.querySelectorAll('[data-slot]:not(.is-filled), .oslot:not(.is-filled)')]
  const away = (e: Element) => {
    const r = e.getBoundingClientRect()
    return r.bottom < b.top ? b.top - r.bottom : Math.max(0, r.top - b.bottom)
  }
  if (empty.length === 0 || empty.some((e) => away(e) === 0)) return
  const below = empty.filter((e) => e.getBoundingClientRect().top > b.bottom)
  const near = (below.length > 0 ? below : empty).reduce((x, y) => (away(y) < away(x) ? y : x))
  show(near.closest('.face, .order, .sentence') ?? near)
}

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
