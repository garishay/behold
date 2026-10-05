import { useEffect, useRef, useState } from 'react'
import { strings } from '../strings/en.ts'
import { labelAt, type Box } from './place.ts'

interface CoachMarkProps {
  /** The target's selector: a spot, a view's button, a word, a slot, or Close the case. */
  at: string
  /** The step's words, eight or fewer; none once a step's words have left. */
  label: string
  /** Any tap while the mark shows: the last step's words leave on it (#24, ruling [3]). */
  onTap?: () => void
  /** The found line's step carries Open Solve under its words, which opens Solve (#77). */
  onNext?: () => void
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

/** Where the room for a mark's words ends: the top of the dock's caption, open or not, else the screen's foot. */
const floorOf = () =>
  Math.min(
    innerHeight,
    ...[...document.querySelectorAll('.dock, .dock .whole')].map(
      (e) => e.getBoundingClientRect().top,
    ),
  )

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
 * The scroll box's `scroll-behavior` is the stylesheet's, so reduced motion jumps. Both axes move
 * in one scroll: a second, even by nothing, would abort the first while it glides (#47).
 */
function bring(el: Element | null) {
  const box = el && scroller(el)
  if (!el || !box) return
  const r = el.getBoundingClientRect()
  const b = box.getBoundingClientRect()
  box.scrollBy({
    top: r.top + r.height / 2 - (b.top + b.height / 2),
    left: r.left + r.width / 2 - (b.left + b.width / 2),
  })
}

/**
 * A tutorial step shown at its target (#25): the target ringed, the rest of the screen dimmed,
 * and the step's words beside it, where `labelAt` places them, clear of the dock's caption on
 * Look (#77), and never past the gutter at either side. It blocks nothing: every tap still
 * reaches the game, and one anywhere but the target lifts the dim while the ring stays until the
 * step is done. Where a step's words have gone, its dim goes with them (#24, addendum (b)). The
 * mark shows only where its target can be seen (07c). A screen reader hears the words from a
 * live region; the ring takes no focus and never pulses. Open Solve, where a step carries it, is
 * the one part of a mark that takes a tap, and a button a keyboard reaches (#77).
 */
export function CoachMark({ at, label, onTap, onNext }: CoachMarkProps) {
  const [ring, setRing] = useState<Box | null>(null)
  const [floor, setFloor] = useState(innerHeight)
  const [dim, setDim] = useState({ at, on: true })
  const next = useRef<HTMLButtonElement>(null)
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
      setFloor(floorOf())
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
      // Open Solve takes its own tap: met on the press, the step would take the button away before
      // its click, and the click would fall to the picture under it (#77).
      if (next.current?.contains(e.target as Node)) return
      if (!document.querySelector(at)?.contains(e.target as Node)) setDim({ at, on: false })
      onTap?.()
    }
    addEventListener('pointerdown', tap, true)
    return () => removeEventListener('pointerdown', tap, true)
  }, [at, onTap])
  const centre =
    ring &&
    Math.min(Math.max((ring.left + ring.right) / 2, half + gutter), innerWidth - half - gutter)
  return (
    <div className="coach" data-at={at}>
      {ring && (
        <>
          <div
            aria-hidden
            className={'ring' + (dim.on && label ? ' dim' : '')}
            style={{
              left: ring.left,
              top: ring.top,
              width: ring.right - ring.left,
              height: ring.bottom - ring.top,
            }}
          />
          {label && (
            <div
              className="label"
              style={{ left: centre ?? 0, ...labelAt(ring, floor, innerHeight) }}
            >
              <span aria-hidden>{label}</span>
              {onNext && (
                <button ref={next} type="button" className="next" onClick={onNext}>
                  {strings.openSolve}
                </button>
              )}
            </div>
          )}
        </>
      )}
      <p className="sr" role="status">
        {label}
      </p>
    </div>
  )
}
