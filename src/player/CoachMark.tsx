import { useEffect, useState } from 'react'

interface CoachMarkProps {
  /** The target's selector: a spot, a view's button, a word, a slot, or Close the case. */
  at: string
  /** The step's words, eight or fewer; none once a step's words have left. */
  label: string
  /** Any tap while the mark shows: the last step's words leave on it (#24, ruling [3]). */
  onTap?: () => void
}

/** Half a label's widest, and the gutter it keeps from the screen's edge. */
const half = 150
const gutter = 16
/** Frames a target holds still before the mark stops following it, about half a second. */
const settle = 30
/** What wakes a mark that has stopped following ([Q6]). */
const wakers = ['pointerdown', 'scroll', 'resize'] as const

/**
 * A tutorial step shown at its target (#25): the target ringed, the rest of the screen dimmed,
 * and the step's words beside it — below a target in the screen's top half, above one in its
 * bottom half, and never past the gutter at either side. It blocks nothing: every tap still
 * reaches the game, and one anywhere but the target lifts the dim while the ring stays until the
 * step is done. Where a step's words have gone, its dim goes with them (#24, addendum (b)). A
 * screen reader hears the words from a live region; the ring takes no focus and never pulses.
 */
export function CoachMark({ at, label, onTap }: CoachMarkProps) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [dim, setDim] = useState({ at, on: true })
  // A new target dims again.
  if (dim.at !== at) setDim({ at, on: true })
  useEffect(() => {
    const target = () => document.querySelector(at)
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    target()?.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' })
    // The target is followed as the account scrolls or the picture zooms. Once it has held still
    // for about half a second the following sleeps, and a tap, a scroll, or a resize wakes it:
    // every way the target moves starts with one of them ([Q6] on #12).
    let [frame, held, last] = [0, 0, '']
    const follow = () => {
      const r = target()?.getBoundingClientRect() ?? null
      const now = JSON.stringify(r)
      held = now === last ? held + 1 : 0
      last = now
      setRect((old) => (JSON.stringify(old) === now ? old : r))
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
  const below = rect !== null && rect.top + rect.height / 2 < innerHeight / 2
  const centre =
    rect &&
    Math.min(Math.max(rect.left + rect.width / 2, half + gutter), innerWidth - half - gutter)
  return (
    <div className="coach" data-at={at}>
      {rect && (
        <div aria-hidden>
          <div
            className={'ring' + (dim.on && label ? ' dim' : '')}
            style={{
              left: rect.left - 4,
              top: rect.top - 4,
              width: rect.width + 8,
              height: rect.height + 8,
            }}
          />
          {label && (
            <p
              className="label"
              style={{
                left: centre ?? 0,
                ...(below ? { top: rect.bottom + 12 } : { bottom: innerHeight - rect.top + 12 }),
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
