import { useEffect, useRef, useState } from 'react'
import { strings } from '../strings/en.ts'
import { bring, labelAt, scroller, type Box, type Span } from './place.ts'

interface CoachMarkProps {
  /** The target's selector: a spot, a view's button, a word, a slot, or Close the case. */
  at: string
  /** The step's words, eight or fewer; none once a step's words have left. */
  label: string
  /** Any tap while the mark shows: the last step's words leave on it (#24, ruling [3]). */
  onTap?: () => void
  /** The found line's step carries Open Solve under its words, which opens Solve (#77). */
  onNext?: () => void
  /**
   * Whether the mark holds the case screen, as the guided steps do (#77): a tap anywhere in its
   * ring is its target's, even on a spot drawn over it, and a tap outside, its words included,
   * plays nothing and pulses the ring once.
   */
  hold?: boolean
}

/** Half a label's widest, and the gutter it keeps from the screen's edge. */
const half = 150
const gutter = 16
/** Frames a target holds still before the mark stops following it, about half a second. */
const settle = 30
/** What wakes a mark that has stopped following ([Q6]). */
const wakers = ['pointerdown', 'scroll', 'resize'] as const

/**
 * Where the room for a mark's words ends, and a ring on the picture with it (#104): the top of the
 * dock's caption, open or not, else the screen's foot.
 */
const floorOf = () =>
  Math.min(
    innerHeight,
    ...[...document.querySelectorAll('.dock, .dock .whole')].map(
      (e) => e.getBoundingClientRect().top,
    ),
  )

/** The account's lines on show: its blocks, as far as Solve's scroll shows them (#77). */
function linesOf(): Span | undefined {
  const view = document.querySelector('.solve')?.getBoundingClientRect()
  const blocks = [...document.querySelectorAll('.solve .scroll')].map((e) =>
    e.getBoundingClientRect(),
  )
  const top = Math.max(view?.top ?? 0, Math.min(...blocks.map((b) => b.top)))
  const bottom = Math.min(view?.bottom ?? 0, Math.max(...blocks.map((b) => b.bottom)))
  return top < bottom ? { top, bottom } : undefined
}

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

/** Whether a tap landed in a box. */
const within = (b: Box, e: MouseEvent) =>
  e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom

/**
 * The ring's box: the target's own, 4 px wider all round, cut to what its scroll box and the
 * screen show, and on the picture where a caption opened over its foot begins, as its words' room
 * is (#104) — or null while the target is out of view, so the mark never floats over the bank, the
 * bar, or a caption being read (07c, #24 [2]).
 */
function ringFor(el: Element | null): Box | null {
  if (!el) return null
  const r = el.getBoundingClientRect()
  const box = scroller(el)?.getBoundingClientRect()
  const bottom = el.closest('.stage') ? floorOf() : innerHeight
  const screen = { left: 0, top: 0, right: innerWidth, bottom }
  const view = box ? overlap(box, screen) : screen
  if (!view || !overlap(r, view)) return null
  const grown = { left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 }
  return overlap(grown, view)
}

/**
 * A tutorial step shown at its target (#25): the target ringed, the rest of the screen dimmed,
 * and the step's words beside it, where `labelAt` places them, clear of the dock's caption on
 * Look (#77), and never past the gutter at either side. Through the guided steps it holds the
 * screen to its ring (#77); after them it blocks nothing: every tap still reaches the game, and
 * one anywhere but the target lifts the dim while the ring stays until the step is done. Where a
 * step's words have gone, its dim goes with them (#24, addendum (b)). The mark shows only where
 * its target can be seen (07c). A screen reader hears the words from a live region; the ring
 * takes no focus, and pulses only to answer a tap its hold refuses (#77). Open Solve, where a step
 * carries it, is the one part of a mark that takes a tap, and a button a keyboard reaches (#77).
 */
export function CoachMark({ at, label, onTap, onNext, hold }: CoachMarkProps) {
  const [ring, setRing] = useState<Box | null>(null)
  const [floor, setFloor] = useState(innerHeight)
  const [lines, setLines] = useState<Span>()
  const [dim, setDim] = useState({ at, on: true })
  // A tap the hold refuses pulses the ring once, so it still answers with where to tap (#77).
  const [pulse, setPulse] = useState(0)
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
      const span = linesOf()
      setLines((old) => (JSON.stringify(old) === JSON.stringify(span) ? old : span))
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
    if (hold) return
    const tap = (e: Event) => {
      // Open Solve takes its own tap: met on the press, the step would take the button away before
      // its click, and the click would fall to the picture under it (#77).
      if (next.current?.contains(e.target as Node)) return
      if (!document.querySelector(at)?.contains(e.target as Node)) setDim({ at, on: false })
      onTap?.()
    }
    addEventListener('pointerdown', tap, true)
    return () => removeEventListener('pointerdown', tap, true)
  }, [at, onTap, hold])
  useEffect(() => {
    if (!hold) return
    // A mark that holds the screen hears a tap on its click, where it lands (#77): in the target,
    // it plays; in the ring, it goes to the target; elsewhere on the case screen it plays nothing,
    // and its dim stays, but the ring pulses. Open Solve and the menu take their own taps, and a
    // tap while the ring is out of view brings the target back.
    const click = (e: MouseEvent) => {
      const t = e.target as Element
      const el = document.querySelector(at)
      if (!el || next.current?.contains(t) || !t.closest('.app') || t.closest('.menu-btn')) return
      if (el.contains(t)) return onTap?.()
      e.stopPropagation()
      if (!ring) bring(el)
      if (ring && e.detail > 0 && within(ring, e))
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      else setPulse((n) => n + 1)
    }
    addEventListener('click', click, true)
    return () => removeEventListener('click', click, true)
  }, [at, onTap, hold, ring])
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
          >
            {pulse > 0 && <i key={pulse} className="pulse" onAnimationEnd={() => setPulse(0)} />}
          </div>
          {label && (
            <div
              className="label"
              style={{ left: centre ?? 0, ...labelAt(ring, floor, innerHeight, lines) }}
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
