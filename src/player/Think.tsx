import { useEffect } from 'react'
import type { CaseStructure, CaseText, Part } from '../cases/types.ts'
import { strings } from '../strings/en.ts'
import { picture } from './pictures.ts'
import { show } from './place.ts'
import { checked, kindOf } from './state.ts'
import type { Progress, Selection } from './state.ts'

interface ThinkProps {
  structure: CaseStructure
  text: CaseText<CaseStructure>
  progress: Progress
  selection: Selection
  onSlot: (target: string) => void
  onMoment: (id: string) => void
  onOrderSlot: (index: number) => void
  /** The slot the tutorial's question has asked about, which takes its ✓ from then on (#77). */
  asked?: string
  /** The slots a failed close in the valley found wrong, ringed until each is changed (#77). */
  ringed?: readonly string[]
}

/**
 * The Solve view (#6; Think until #24), scrolling as one so the account has room on the smallest
 * phone (#24, ruling [4]): who is who, what happened first when the case asks, and the blocks with
 * their blanks. A ✓ lands only on the slots a guided step names, and on the one the question has
 * asked about; everything else is checked on Close the case, docked below the account (07d). In
 * the valley a failed close rings what it found wrong, and a screen reader hears the ring (#77).
 */
export function Think(props: ThinkProps) {
  const { structure: s, text, progress: p, selection } = props
  // A blank that starts waiting brings its whole sentence into view (#24, Solve's room).
  useEffect(() => {
    if (selection.target === null) return
    show(document.querySelector(`[data-slot="${selection.target}"]`)?.closest('.sentence'))
  }, [selection.target])
  const slot = (target: string, value: string | undefined, placeholder: string) => {
    const kind = kindOf(s, target)
    const wrong = props.ringed?.includes(target) ?? false
    const state =
      (value ? ' is-filled' : '') +
      (selection.target === target ? ' is-target' : '') +
      (checked(s, p, target, props.asked) ? ' is-right' : '') +
      (wrong ? ' is-wrong' : '') +
      (selection.word !== null && s.words[selection.word] !== kind ? ' is-dim' : '')
    return (
      <button
        type="button"
        className={'slot ' + kind + state}
        data-slot={target}
        onClick={() => props.onSlot(target)}
      >
        {value ? text.words[value] : placeholder}
        {wrong && <span className="sr">{strings.ringedNoMatch}</span>}
      </button>
    )
  }
  return (
    <>
      <section className="blk">
        <h2>{strings.whoIsWho}</h2>
        <div className={'faces' + (s.faces.length === 2 ? ' two' : '')}>
          {s.faces.map((f) => (
            <div key={f.id} className="face" data-face={f.id}>
              <img src={picture(s.id, f.picture)} alt="" />
              <div className="who">{text.faces[f.id]}</div>
              {slot(f.id, p.faces[f.id], strings.who)}
            </div>
          ))}
        </div>
      </section>
      {s.order && <Order {...props} />}
      {s.blocks.map((b) => (
        <section key={b.id} className="blk">
          <h2>{text.blocks[b.id].heading}</h2>
          <div className="scroll">
            {sentences(text.blocks[b.id].parts).map((parts, i) => (
              <span key={i} className="sentence">
                {parts.map((part, j) =>
                  part.t !== undefined ? (
                    <span key={j}>{part.t}</span>
                  ) : (
                    <span key={j} className="blank-wrap">
                      {slot(part.b, p.fills[part.b], '')}
                    </span>
                  ),
                )}
              </span>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

/**
 * A block's parts as its sentences: a text is cut at each stop, with the quote that may close it
 * and the space after, which ends its sentence (no lookbehind, which older Safari can't parse).
 */
function sentences<B extends string>(parts: readonly Part<B>[]) {
  const out: Part<B>[][] = [[]]
  for (const part of parts) {
    if (part.t === undefined) out[out.length - 1].push(part)
    else
      part.t.split(/([.!?][”’]?\s)/).forEach((t, i) => {
        if (t) out[out.length - 1].push({ t })
        if (i % 2 === 1) out.push([])
      })
  }
  return out.filter((s) => s.length > 0)
}

/** The order block: a slot per position, first to last, and the moments as tiles to place. */
function Order({ structure: s, text, progress: p, selection, onMoment, onOrderSlot }: ThinkProps) {
  const label = (i: number) =>
    i === 0 ? strings.first : i === p.order.length - 1 ? strings.last : strings.then
  const name = (id: string) => text.moments[id]
  return (
    <section className="blk">
      <h2>{strings.whatHappenedFirst}</h2>
      <p className="hint">{strings.orderHint}</p>
      <div className="order">
        {p.order.map((id, i) => (
          <div key={i}>
            <div className="step">{label(i)}</div>
            <button
              type="button"
              className={
                'oslot' +
                (id !== null ? ' is-filled' : '') +
                (selection.slot === i ? ' is-target' : '')
              }
              onClick={() => onOrderSlot(i)}
            >
              {id === null ? strings.emptySlot : <Thumb structure={s} id={id} name={name(id)} />}
            </button>
          </div>
        ))}
      </div>
      <div className="tiles">
        {s.moments.map((m) => (
          <button
            key={m.id}
            type="button"
            className={
              'tile' +
              (selection.moment === m.id ? ' is-on' : '') +
              (p.order.includes(m.id) ? ' is-used' : '')
            }
            onClick={() => onMoment(m.id)}
          >
            <Thumb structure={s} id={m.id} name={name(m.id)} />
          </button>
        ))}
      </div>
    </section>
  )
}

function Thumb({ structure: s, id, name }: { structure: CaseStructure; id: string; name: string }) {
  const m = s.moments.find((x) => x.id === id)
  return (
    <>
      {m && <img src={picture(s.id, m.picture)} alt="" />}
      {name}
    </>
  )
}
