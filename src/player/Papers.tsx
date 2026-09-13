import type { CaseStructure, CaseText } from '../cases/types.ts'
import { strings } from '../strings/en.ts'

interface PapersProps {
  text: CaseText<CaseStructure>
  papers: readonly string[]
}

/** The Papers view (#6): every document opened so far, a copy of each, in the order opened. */
export function Papers({ text, papers }: PapersProps) {
  if (papers.length === 0) return <p className="hint">{strings.papersEmpty}</p>
  return (
    <>
      {papers.map((id) => (
        <div key={id} className="paper">
          <h3>{text.papers[id].title}</h3>
          <p>{text.papers[id].body}</p>
        </div>
      ))}
    </>
  )
}

interface PaperModalProps {
  text: CaseText<CaseStructure>
  paper: string
  onClose: () => void
}

/** A document opened by a tap, over the screen until closed. */
export function PaperModal({ text, paper, onClose }: PaperModalProps) {
  return (
    <div className="modal" onClick={onClose}>
      <div
        className="paper"
        role="dialog"
        aria-label={text.papers[paper].title}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{text.papers[paper].title}</h3>
        <p>{text.papers[paper].body}</p>
        <button type="button" className="close" onClick={onClose}>
          {strings.close}
        </button>
      </div>
    </div>
  )
}
