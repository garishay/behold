import { useEffect, useEffectEvent, useId, useRef, useState } from 'react'

interface QuestionProps {
  /** The dialog's name, as the menu's sheet has its own: the button it was asked from. */
  readonly name: string
  readonly question: string
  /** The answer that does what was asked, and the one that leaves everything as it is. */
  readonly yes: string
  readonly no: string
  readonly onAnswer: (yes: boolean) => void
}

/**
 * The game's own question (#153), in place of the browser's `confirm()`: over the screen, which
 * takes nothing until it's answered, with the yes over the no. The focus starts on the no, which
 * changes nothing, as WAI-ARIA's guide has it where the yes can't be undone. Tab keeps to the two
 * answers, Escape or a tap on the dim answers no, and the focus goes back where it was.
 */
export function Question({ name, question, yes, no, onAnswer }: QuestionProps) {
  const words = useId()
  // Where the focus was when the question was asked, read before the screen under it turns inert.
  const [opener] = useState(() => document.activeElement)
  const first = useRef<HTMLButtonElement>(null)
  const last = useRef<HTMLButtonElement>(null)
  const answer = useEffectEvent(onAnswer)
  useEffect(() => {
    last.current?.focus()
    const keys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') answer(false)
      if (e.key !== 'Tab') return
      e.preventDefault()
      ;(document.activeElement === last.current ? first : last).current?.focus()
    }
    document.addEventListener('keydown', keys)
    return () => {
      document.removeEventListener('keydown', keys)
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [opener])
  return (
    <div className="modal" onClick={() => onAnswer(false)}>
      <div
        className="question"
        role="alertdialog"
        aria-modal="true"
        aria-label={name}
        aria-describedby={words}
        onClick={(e) => e.stopPropagation()}
      >
        <p id={words}>{question}</p>
        <button type="button" className="yes" ref={first} onClick={() => onAnswer(true)}>
          {yes}
        </button>
        <button type="button" ref={last} onClick={() => onAnswer(false)}>
          {no}
        </button>
      </div>
    </div>
  )
}
