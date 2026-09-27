import type { CaseStructure, CaseText } from '../cases/types.ts'
import { strings } from '../strings/en.ts'

interface PapersProps {
  text: CaseText<CaseStructure>
  papers: readonly string[]
  onClose: () => void
}

/**
 * Papers (#6), opened from Solve (#24): every document opened so far, a copy of each, in the order
 * opened, in a sheet over the screen until closed.
 */
export function PapersSheet({ text, papers, onClose }: PapersProps) {
  return (
    <div className="modal sheet" onClick={onClose}>
      <div
        className="papers"
        role="dialog"
        aria-label={strings.papers}
        onClick={(e) => e.stopPropagation()}
      >
        {papers.map((id) => (
          <div key={id} className="paper">
            <h3>{text.papers[id].title}</h3>
            <p>{text.papers[id].body}</p>
          </div>
        ))}
        <button type="button" className="close" onClick={onClose}>
          {strings.close}
        </button>
      </div>
    </div>
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
