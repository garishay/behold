/**
 * How a tap finds its spot (#27), one module for the player and the validator, so the check holds
 * the pictures to the rule the phone plays by. A tap inside boxes takes the one drawn on top; a
 * tap on no box takes the nearest within a fingertip's slip; and every spot keeps a square of its
 * own for the finger to land in.
 */
import type { Box, Spot } from './types.ts'

/** A tap on no spot goes to the nearest within this many CSS px (#27 [2]). */
export const slip = 16
/** The fingertip every spot keeps for itself, a square this many CSS px on a side (#27 [1]). */
export const fingertip = 44
/**
 * The picture's width, in CSS px, on the smallest phone the game supports: 360 wide, less the case
 * screen's 20 px inset each side. The check lays every picture out at it; a layout that changes
 * the width changes this (#27, ruling on Gate 06 [1]; #24).
 */
export const smallestPicture = 320

const area = ([, , w, h]: Box) => w * h

/**
 * A moment's spots in draw order: largest first, so where two boxes overlap the smaller is on top
 * and takes the tap, whatever the file's order (#26 [7]); equal areas keep the file's order.
 */
export const drawOrder = <S extends Spot>(spots: readonly S[]): S[] =>
  [...spots].sort((a, b) => area(b.box) - area(a.box))

/**
 * A box in pixels, from its percent — left, top, width, height — with the picture laid out `at`
 * pixels wide, its own width by default. Each is one product over one quotient, so a box that is
 * exactly a fingertip tall comes out 44, not a hair under.
 */
const pixels = ([l, t, w, h]: Box, [width, height]: readonly [number, number], at = width) => {
  const across = (v: number) => (v * at) / 100
  const down = (v: number) => (v * height * at) / (100 * width)
  return [across(l), down(t), across(w), down(h)] as const
}

/**
 * The spot a tap that landed on none goes to: the nearest whose box lies within `reach` of the
 * point, all in the picture's pixels — the one on top where two are as near — or none.
 */
export function nearest<S extends Spot>(
  spots: readonly S[],
  size: readonly [number, number],
  [x, y]: readonly [number, number],
  reach: number,
): S | undefined {
  let found: S | undefined
  let best = reach
  for (const s of drawOrder(spots)) {
    const [l, t, w, h] = pixels(s.box, size)
    const d = Math.hypot(Math.max(l - x, 0, x - l - w), Math.max(t - y, 0, y - t - h))
    if (d <= best) [found, best] = [s, d]
  }
  return found
}

/**
 * The spots that keep no fingertip of their own: with the picture `smallestPicture` CSS px wide,
 * no square `fingertip` px on a side fits inside the spot's box clear of every box drawn over it.
 * Where one fits, it can be slid up and left until its corner meets the box's edge or an
 * overlying box's far edge, so those corners are the only places to try.
 */
export function crowded<S extends Spot>(spots: readonly S[], size: readonly [number, number]): S[] {
  const order = drawOrder(spots)
  return order.filter((s, i) => {
    const px = (b: Box) => pixels(b, size, smallestPicture)
    const [L, T, W, H] = px(s.box)
    const over = order.slice(i + 1).map((o) => px(o.box))
    const clear = (x: number, y: number) =>
      x + fingertip <= L + W &&
      y + fingertip <= T + H &&
      over.every(
        ([l, t, w, h]) => x + fingertip <= l || l + w <= x || y + fingertip <= t || t + h <= y,
      )
    const xs = [L, ...over.map(([l, , w]) => l + w)].filter((x) => x >= L)
    const ys = [T, ...over.map(([, t, , h]) => t + h)].filter((y) => y >= T)
    return !xs.some((x) => ys.some((y) => clear(x, y)))
  })
}
