import { useEffect, useState } from 'react'

interface CoachMarkProps {
  /** The target's selector: a spot, a view's button, a word, a slot, or Close the case. */
  at: string
  /** The step's words, eight or fewer; none once a step's words have left. */
  label: string
  /** Any tap while the mark shows: the last step's words leave on it (#24, ruling [3]). */
  onTap?: () => void
}

interface Box {
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

/** Half a label's widest, and the gutter it keeps from the screen's edge. */
const half = 150
const gutter = 16
/** Frames a target holds still before the mark stops following it, about half a second. */
const settle = 30
/** What wakes a mark that has stopped following ([Q6]). */
const wakers = ['pointerdown', 'scroll', 'resize'] as const
/** The boxes a target scrolls in: the account, a zoomed picture, the bank's words (07c, #24). */
const scrollers = '.solve, .stage, .chips'

/** A target's scroll box, if it sits in one. */
const scroller = (el: Element) => el.parentElement?.closest<HTMLElement>(scrollers) ?? null

/** Where two boxes overlap, or null where they don't. */
function overlap(a: Box, b: Box): Box | null {
  const box = {
    left: Math.max(a.left, b.left),
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
  }
  return box.right > box.left && box.bottom > box.top ? box : null
}

/**
 * The ring's box: the target's own, 4 px wider all round, cut to what its scroll box and the
 * screen show — or null while the target is out of view, so the mark never floats over the bank
 * or the bar (07c, #24 [2]).
 */
function ringFor(el: Element | null): Box | null {
  if (!el) return null
  const r = el.getBoundingClientRect()
  const box = scroller(el)?.getBoundingClientRect()
  const screen = { left: 0, top: 0, right: innerWidth, bottom: innerHeight }
  const view = box ? overlap(box, screen) : screen
  if (!view || !overlap(r, view)) return null
  const grown = { left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 }
  return overlap(grown, view)
}

/**
 * Brings a target to the middle of its own scroll box, and never scrolls the page: the case
 * screen does not scroll, and a target outside a scroll box is always in view (07c, #24 [1]).
 * The scroll box's `scroll-behavior` is the stylesheet's, so reduced motion jumps.
 */
function bring(el: Element | null) {
  const box = el && scroller(el)
  if (!el || !box) return
  const r = el.getBoundingClientRect()
  const b = box.getBoundingClientRect()
  box.scrollTop += r.top + r.height / 2 - (b.top + b.height / 2)
  box.scrollLeft += r.left + r.width / 2 - (b.left + b.width / 2)
}

/**
 * A tutorial step shown at its target (#25): the target ringed, the rest of the screen dimmed,
 * and the step's words beside it — below a target in the screen's top half, above one in its
 * bottom half, and never past the gutter at either side. It blocks nothing: every tap still
 * reaches the game, and one anywhere but the target lifts the dim while the ring stays until the
 * step is done. Where a step's words have gone, its dim goes with them (#24, addendum (b)). The
 * mark shows only where its target can be seen (07c). A screen reader hears the words from a
 * live region; the ring takes no focus and never pulses.
 */
export function CoachMark({ at, label, onTap }: CoachMarkProps) {
  const [ring, setRing] = useState<Box | null>(null)
  const [dim, setDim] = useState({ at, on: true })
  // A new target dims again.
  if (dim.at !== at) setDim({ at, on: true })
  useEffect(() => {
    const target = () => document.querySelector(at)
    bring(target())
    // The target is followed as the account scrolls or the picture zooms. Once it has held still
    // for about half a second the following sleeps, and a tap, a scroll, or a resize wakes it:
    // every way the target moves starts with one of them ([Q6] on #12).
    let [frame, held, last] = [0, 0, '']
    const follow = () => {
      const r = ringFor(target())
      const now = JSON.stringify(r)
      held = now === last ? held + 1 : 0
      last = now
      setRing((old) => (JSON.stringify(old) === now ? old : r))
      frame = held < settle ? requestAnimationFrame(follow) : 0
    }
    const wake = () => {
      held = 0
      if (frame === 0) frame = requestAnimationFrame(follow)
    }
    frame = requestAnimationFrame(follow)
    for (const e of wakers) addEventListener(e, wake, true)
    return () => {
      cancelAnimationFrame(frame)
      for (const e of wakers) removeEventListener(e, wake, true)
    }
  }, [at])
  useEffect(() => {
    const tap = (e: Event) => {
      if (!document.querySelector(at)?.contains(e.target as Node)) setDim({ at, on: false })
      onTap?.()
    }
    addEventListener('pointerdown', tap, true)
    return () => removeEventListener('pointerdown', tap, true)
  }, [at, onTap])
  const below = ring !== null && (ring.top + ring.bottom) / 2 < innerHeight / 2
  const centre =
    ring &&
    Math.min(Math.max((ring.left + ring.right) / 2, half + gutter), innerWidth - half - gutter)
  return (
    <div className="coach" data-at={at}>
      {ring && (
        <div aria-hidden>
          <div
            className={'ring' + (dim.on && label ? ' dim' : '')}
            style={{
              left: ring.left,
              top: ring.top,
              width: ring.right - ring.left,
              height: ring.bottom - ring.top,
            }}
          />
          {label && (
            <p
              className="label"
              style={{
                left: centre ?? 0,
                ...(below ? { top: ring.bottom + 8 } : { bottom: innerHeight - ring.top + 8 }),
              }}
            >
              {label}
            </p>
          )}
        </div>
      )}
      <p className="sr" role="status">
        {label}
      </p>
    </div>
  )
}
