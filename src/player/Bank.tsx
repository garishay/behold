import type { CaseStructure, CaseText, Kind } from '../cases/types.ts'
import { strings } from '../strings/en.ts'
import { kindOf, type Progress, type Selection } from './state.ts'

interface BankProps {
  structure: CaseStructure
  text: CaseText<CaseStructure>
  progress: Progress
  selection: Selection
  /** The words found on Look since Solve was last left, ringed. */
  fresh: readonly string[]
  /** The kind a waiting slot refused a word for; its line takes the bank's head. */
  refused: Kind | undefined
  onWord: (id: string) => void
}

const kinds: readonly Kind[] = ['name', 'noun', 'action', 'number']

/**
 * The word bank (#6), docked on Solve above the bar, where it is used (#24): the words found so far
 * as chips, each with its kind's dot, the ones new since Solve was last open ringed, and all but the kind a waiting slot takes dimmed. A word
 * refused by a slot says so in the bank's head, where the player is looking.
 */
export function Bank(props: BankProps) {
  const { structure, text, progress, selection, fresh, refused, onWord } = props
  const wants = selection.target === null ? undefined : kindOf(structure, selection.target)
  return (
    <footer className="bank">
      <div className="bank-head" role="status">
        {refused !== undefined ? (
          <span className="refused">{strings.blankWants(refused)}</span>
        ) : (
          <span className="legend">
            {kinds.map((k) => (
              <span key={k}>
                <i className={'dot ' + k} />
                {strings.legend[k]}
              </span>
            ))}
          </span>
        )}
      </div>
      <div className="chips">
        {progress.bank.length === 0 && <span className="empty">{strings.bankEmpty}</span>}
        {progress.bank.map((id) => {
          const kind = structure.words[id]
          const state =
            (selection.word === id ? ' is-on' : '') +
            (fresh.includes(id) ? ' is-new' : '') +
            (wants !== undefined && kind !== wants ? ' is-dim' : '')
          return (
            <button
              key={id}
              type="button"
              className={'chip' + state}
              data-word={id}
              onClick={() => onWord(id)}
            >
              <i className={'dot ' + kind} />
              {text.words[id]}
            </button>
          )
        })}
      </div>
    </footer>
  )
}
