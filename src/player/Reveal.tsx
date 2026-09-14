import { useEffect, useState } from 'react'
import type { CaseStructure, CaseText, Passage } from '../cases/types.ts'
import type { PassageService, PassageText } from '../passages/service.ts'
import { strings } from '../strings/en.ts'

interface RevealProps {
  structure: CaseStructure
  text: CaseText<CaseStructure>
  passages: PassageService
  onBack: () => void
}

/**
 * The reveal (#6): the case told in the game's words, then the passage itself, each range fetched
 * through the service at display time — never from the bundle — under the label the text file
 * gives it.
 */
export function Reveal({ structure, text, passages, onBack }: RevealProps) {
  return (
    <div className="reveal">
      <h2>{strings.caseClosed}</h2>
      {text.reveal.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
      <h2>{strings.readWhatHappened}</h2>
      {structure.passages.map((passage, i) => (
        <PassageBlock key={i} passage={passage} label={text.passages[i]} service={passages} />
      ))}
      <button type="button" className="back" onClick={onBack}>
        {strings.backToCases}
      </button>
    </div>
  )
}

interface PassageBlockProps {
  passage: Passage
  label: string
  service: PassageService
}

type Loaded = 'loading' | 'failed' | PassageText

/**
 * One passage under its label: loading, the verses as the service returns them — a number set
 * as a superscript only when the verse carries one (Gate 03 [2]) — or the line for a service
 * that could not answer.
 */
function PassageBlock({ passage, label, service }: PassageBlockProps) {
  const [state, setState] = useState<Loaded>('loading')
  useEffect(() => {
    let live = true
    service(passage, 'ESV').then(
      (t) => live && setState(t),
      () => live && setState('failed'),
    )
    return () => {
      live = false
    }
  }, [passage, service])
  return (
    <section className="passage">
      <h3>{label}</h3>
      {state === 'loading' ? (
        <p className="muted">{strings.loadingPassage(label)}</p>
      ) : state === 'failed' ? (
        <p className="muted">{strings.passageUnavailable(label)}</p>
      ) : (
        state.verses.map((v, i) => (
          <p key={i}>
            {v.number !== undefined && <sup>{v.number}</sup>}
            {v.text}
          </p>
        ))
      )}
    </section>
  )
}
