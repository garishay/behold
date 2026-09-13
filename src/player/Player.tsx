import { useEffect, useState } from 'react'
import type { CaseEntry } from '../cases/index.ts'
import { strings } from '../strings/en.ts'
import { Bank, type Caption } from './Bank.tsx'
import { Papers, PaperModal } from './Papers.tsx'
import { prefetch } from './pictures.ts'
import { Stage } from './Stage.tsx'
import { chooseWord, nothing, step, tap, type Outcome, type Progress } from './state.ts'

type View = 'moments' | 'papers'

interface PlayerProps {
  entry: CaseEntry
  progress: Progress
  onProgress: (p: Progress) => void
  onCases: () => void
  onRestart: () => void
}

/**
 * The case screen (#6): the brief as its title, the tabs — Moments and Papers here; Think, the
 * close, and the reveal arrive with 03c — the tutorial's banner, the view, the word bank at the
 * foot, and a paper over it when one opens. What the player has done is `progress`, kept by the
 * app; what they are in the middle of — the view, a word picked up, the last caption — is this
 * screen's.
 */
export function Player({ entry, progress, onProgress, onCases, onRestart }: PlayerProps) {
  const { structure: s } = entry
  const text = entry.text.en
  const [view, setView] = useState<View>('moments')
  const [selection, setSelection] = useState(nothing)
  const [caption, setCaption] = useState<Caption | null>(null)
  const [paper, setPaper] = useState<string | null>(null)
  // Every picture of the case is requested as it opens, so the whole case is cached for offline.
  useEffect(() => prefetch(s), [s])

  const apply = (o: Outcome) => {
    setSelection(o.selection)
    onProgress(o.progress)
  }
  const onTap = (spotId: string) => {
    const { progress: next, added } = tap(s, progress, spotId)
    const spot = s.moments.flatMap((m) => m.spots).find((x) => x.id === spotId)
    setCaption({ spot: spotId, added })
    if (spot?.paper !== undefined) setPaper(spot.paper)
    onProgress(next)
  }
  const current = step(s, progress)
  const moment = s.moments.find((m) => m.id === progress.moment) ?? s.moments[0]
  const tab = (id: View, label: string, count?: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={view === id}
      className={'tab' + (view === id ? ' is-on' : '')}
      onClick={() => setView(id)}
    >
      {label}
      {count && <span className="n">{count}</span>}
    </button>
  )
  return (
    <div className="app">
      <header className="top">
        <div className="title">
          <h1>{text.brief}</h1>
          <div className="hdr-btns">
            <button type="button" className="hdr-btn" onClick={onCases}>
              {strings.cases}
            </button>
            <button type="button" className="hdr-btn" onClick={onRestart}>
              {strings.restart}
            </button>
          </div>
        </div>
        <nav className="tabs" role="tablist">
          {tab('moments', strings.moments)}
          {tab(
            'papers',
            strings.papers,
            progress.papers.length ? String(progress.papers.length) : '',
          )}
        </nav>
      </header>
      {current && <div className="steps">{text.steps?.[current.id]}</div>}
      <main>
        {view === 'moments' && (
          <Stage
            structure={s}
            text={text}
            moment={moment}
            onMoment={(id) => {
              setCaption(null)
              onProgress({ ...progress, moment: id })
            }}
            onTap={onTap}
          />
        )}
        {view === 'papers' && <Papers text={text} papers={progress.papers} />}
      </main>
      <Bank
        structure={s}
        text={text}
        progress={progress}
        selection={selection}
        console={view === 'moments' ? caption : undefined}
        onWord={(id) => apply(chooseWord(s, progress, selection, id))}
      />
      {paper !== null && <PaperModal text={text} paper={paper} onClose={() => setPaper(null)} />}
    </div>
  )
}
