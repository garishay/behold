import { useRef, useState, type ReactNode } from 'react'
import type { CaseStructure, CaseText } from '../cases/types.ts'
import { strings } from '../strings/en.ts'

/** What the last tap said: the spot, the words it added to the bank, and the paper it opened for the first time. */
export interface Caption {
  readonly spot: string
  readonly added: readonly string[]
  readonly paper?: string
}

interface DockProps {
  structure: CaseStructure
  text: CaseText<CaseStructure>
  caption: Caption | null
  /** A hint on offer (#29): it takes the line of finds' place, and the caption gives it room. */
  offer?: ReactNode
  /** A caption opened whole over the picture's foot, or closed: no stay is timed while one is open. */
  onMore: (open: boolean) => void
}

/**
 * The caption, docked under the picture at a fixed height (#24): the last tap's caption, or the
 * prompt before one, and right under it a line of what it found (ruling [2]). A caption longer
 * than the dock shows More, which opens it whole, rising over the picture's foot from where the
 * caption ends.
 */
export function Dock({ structure, text, caption, offer, onMore }: DockProps) {
  // Opened for one caption, from the line where it ends; the next tap's caption opens closed.
  const [openAt, setOpenAt] = useState<{ caption: Caption | null; end: number } | null>(null)
  const [long, setLong] = useState(false)
  const open = openAt !== null && openAt.caption === caption
  const box = useRef<HTMLDivElement>(null)
  // Whether the caption overflows the dock, read each time it is laid out.
  const said = (p: HTMLParagraphElement | null) => {
    if (p && !open) setLong(p.scrollHeight > p.clientHeight + 1)
  }
  const toggle = () => {
    const b = box.current
    const next = open || !b ? null : { caption, end: b.offsetTop + b.offsetHeight }
    setOpenAt(next)
    onMore(next !== null)
  }
  const spot = structure.moments.flatMap((m) => m.spots).find((x) => x.id === caption?.spot)
  const words = caption?.added.map((w) => text.words[w]).join(', ')
  const notes = [
    words && `${strings.found} ${words}`,
    caption?.paper !== undefined && strings.copiedToPapers,
    spot?.person !== undefined && strings.oneOfTheFaces,
  ].filter(Boolean)
  const line = caption ? text.captions[caption.spot] : strings.tapPrompt
  const more = (
    <button type="button" className="more" aria-expanded={open} onClick={toggle}>
      <span>{open ? strings.less : strings.more}</span>
    </button>
  )
  return (
    <div className={'dock' + (open ? ' is-open' : '')}>
      <div className="said" ref={box}>
        <p ref={said}>{line}</p>
        {long && !open && more}
      </div>
      {open && (
        <div className="whole" style={{ bottom: `calc(100% - ${openAt.end}px)` }}>
          <p>{line}</p>
          {more}
        </div>
      )}
      {offer ?? <span className="found">{notes.join(' · ')}</span>}
    </div>
  )
}
