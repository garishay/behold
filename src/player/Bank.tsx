import { Fragment, type ReactNode } from 'react'
import type { CaseStructure, CaseText, Kind } from '../cases/types.ts'
import { strings } from '../strings/en.ts'
import { kindOf, type Progress, type Selection } from './state.ts'

/** What the last tap said: the spot, and the words it added to the bank. */
export interface Caption {
  readonly spot: string
  readonly added: readonly string[]
}

interface BankProps {
  structure: CaseStructure
  text: CaseText<CaseStructure>
  progress: Progress
  selection: Selection
  /** The console shows on the Moments view only; there, the last tap's caption or none yet. */
  console: Caption | null | undefined
  onWord: (id: string) => void
}

const kinds: readonly Kind[] = ['name', 'noun', 'action', 'number']

/**
 * The word bank (#6), fixed to the foot of the case screen: the console — where the player is,
 * what the last tap said and found — then the words found so far as chips, each with its kind's
 * dot, the last tap's new ones ringed, and all but the kind a waiting slot takes dimmed.
 */
export function Bank({ structure, text, progress, selection, console, onWord }: BankProps) {
  const wants = selection.target === null ? undefined : kindOf(structure, selection.target)
  return (
    <footer className="bank">
      {console !== undefined && (
        <Console structure={structure} text={text} progress={progress} caption={console} />
      )}
      <div className="bank-head">
        <span>
          {strings.wordsFound} <span className="count">{progress.bank.length}</span>
        </span>
        <span className="legend">
          {kinds.map((k) => (
            <span key={k}>
              <i className={'dot ' + k} />
              {strings.legend[k]}
            </span>
          ))}
        </span>
      </div>
      <div className="chips">
        {progress.bank.length === 0 && <span className="empty">{strings.bankEmpty}</span>}
        {progress.bank.map((id) => {
          const kind = structure.words[id]
          const state =
            (selection.word === id ? ' is-on' : '') +
            (console?.added.includes(id) ? ' is-new' : '') +
            (wants !== undefined && kind !== wants ? ' is-dim' : '')
          return (
            <button key={id} type="button" className={'chip' + state} onClick={() => onWord(id)}>
              <i className={'dot ' + kind} />
              {text.words[id]}
            </button>
          )
        })}
      </div>
    </footer>
  )
}

interface ConsoleProps {
  structure: CaseStructure
  text: CaseText<CaseStructure>
  progress: Progress
  caption: Caption | null
}

function Console({ structure, text, progress, caption }: ConsoleProps) {
  const moment = structure.moments.find((m) => m.id === progress.moment) ?? structure.moments[0]
  const found = moment.spots.filter((s) => progress.tapped.includes(s.id)).length
  const spot = caption && moment.spots.find((s) => s.id === caption.spot)
  const notes: ReactNode[] = []
  if (caption && caption.added.length > 0)
    notes.push(
      <>
        {strings.found}
        {caption.added.map((w, i) => (
          <Fragment key={w}>
            {i > 0 ? ', ' : ' '}
            <b>{text.words[w]}</b>
          </Fragment>
        ))}
      </>,
    )
  if (spot?.paper !== undefined) notes.push(strings.copiedToPapers)
  return (
    <div className="console">
      <div className="where">
        {strings.thingsFound(text.moments[moment.id], found, moment.spots.length)}
      </div>
      {caption ? text.captions[caption.spot] : strings.tapPrompt}
      {notes.length > 0 && (
        <span className="found">
          {notes.map((n, i) => (
            <Fragment key={i}>
              {i > 0 && ' · '}
              {n}
            </Fragment>
          ))}
        </span>
      )}
    </div>
  )
}
