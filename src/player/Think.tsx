import type { CaseStructure, CaseText } from '../cases/types.ts'
import { strings } from '../strings/en.ts'
import { picture } from './pictures.ts'
import { answer, filled, guided, kindOf, total, type Progress, type Selection } from './state.ts'

interface ThinkProps {
  structure: CaseStructure
  text: CaseText<CaseStructure>
  progress: Progress
  selection: Selection
  /** The result line under the submit: a kind refused, or how far off the case was. */
  message: string
  onSlot: (target: string) => void
  onMoment: (id: string) => void
  onOrderSlot: (index: number) => void
  onSubmit: () => void
}

/**
 * The Think view (#6): who is who, what happened first when the case asks, the blocks with their
 * blanks, and — in a case the player closes — the submit. A guided case marks each right answer
 * as it lands and closes itself; a case without steps shows nothing until the submit.
 */
export function Think(props: ThinkProps) {
  const { structure: s, text, progress: p, selection, message, onSubmit } = props
  const marks = guided(s)
  const slot = (target: string, value: string | undefined, placeholder: string) => {
    const kind = kindOf(s, target)
    const state =
      (value ? ' is-filled' : '') +
      (selection.target === target ? ' is-target' : '') +
      (marks && value === answer(s, target) ? ' is-right' : '') +
      (selection.word !== null && s.words[selection.word] !== kind ? ' is-dim' : '')
    return (
      <button
        type="button"
        className={'slot ' + kind + state}
        data-slot={target}
        onClick={() => props.onSlot(target)}
      >
        {value ? text.words[value] : placeholder}
      </button>
    )
  }
  const done = filled(s, p)
  const all = total(s)
  return (
    <>
      <section className="blk">
        <h2>{strings.whoIsWho}</h2>
        <p className="hint">{strings.facesHint}</p>
        <div className={'faces' + (s.faces.length === 2 ? ' two' : '')}>
          {s.faces.map((f) => (
            <div key={f.id} className="face">
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
            {text.blocks[b.id].parts.map((part, i) =>
              part.t !== undefined ? (
                <span key={i}>{part.t}</span>
              ) : (
                <span key={i} className="blank-wrap">
                  {slot(part.b, p.fills[part.b], '')}
                </span>
              ),
            )}
          </div>
        </section>
      ))}
      {!marks && (
        <div className="submit-row">
          <button
            type="button"
            className="submit"
            disabled={done < all || p.solved}
            onClick={onSubmit}
          >
            {done < all ? strings.closeCaseProgress(done, all) : strings.closeCase}
          </button>
        </div>
      )}
      <p className="result" role="status">
        {message}
      </p>
    </>
  )
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
                (selection.slot === i ? ' is-target' : '') +
                (guided(s) && id !== null && id === s.order?.[i] ? ' is-right' : '')
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
