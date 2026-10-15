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
 * prompt before one, and right under it a line of what it found (ruling [2]), which wraps only
 * between its parts (#131). A caption longer than the dock shows More, which opens it whole,
 * rising over the picture's foot from where the caption ends.
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
  // A tap that finds nothing new says what its spot holds, so a second tap names who is there (#102).
  const held = caption?.added.length ? caption.added : (spot?.words ?? [])
  const words = held.map((w) => text.words[w]).join(', ')
  // A person's tap says they are a face in Solve. From the vineyard on, a name comes from what
  // bears it, so one that gives none says so in that part; and in a case with an order, what dates
  // a moment says it is a clue to the order (#131).
  const named = spot?.words.some((w) => structure.words[w] === 'name')
  const late = !structure.steps && !structure.marks
  const notes = [
    words && `${strings.found} ${words}`,
    caption?.paper !== undefined && strings.copiedToPapers,
    spot?.person !== undefined && (late && !named ? strings.aFaceNoName : strings.aFace),
    structure.order?.some((m) => structure.evidence[m] === spot?.id) && strings.clueToOrder,
  ].filter(Boolean)
  // Each part kept whole, its dot with it, so a line that wraps breaks only between parts (#131).
  const parts = notes.flatMap((n, i) => [
    i > 0 && ' ',
    <span key={i}>{i < notes.length - 1 ? `${n} ·` : n}</span>,
  ])
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
      {offer ?? <span className="found">{parts}</span>}
    </div>
  )
}
