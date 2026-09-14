import { useEffect, useState } from 'react'
import type { CaseEntry } from '../cases/index.ts'
import type { PassageService } from '../passages/service.ts'
import { strings } from '../strings/en.ts'
import { Bank, type Caption } from './Bank.tsx'
import { Papers, PaperModal } from './Papers.tsx'
import { prefetch } from './pictures.ts'
import { Reveal } from './Reveal.tsx'
import { Stage } from './Stage.tsx'
import {
  chooseMoment,
  chooseOrderSlot,
  chooseSlot,
  chooseWord,
  filled,
  nothing,
  step,
  submit,
  tap,
  thinkStep,
  total,
  wrong,
  type Outcome,
  type Progress,
} from './state.ts'
import { sting } from './sting.ts'
import { Think } from './Think.tsx'

type View = 'moments' | 'think' | 'papers' | 'reveal'

interface PlayerProps {
  entry: CaseEntry
  progress: Progress
  onProgress: (p: Progress) => void
  onCases: () => void
  onRestart: () => void
  passages: PassageService
}

/** Whether a history state is the reveal's entry (Gate 03 [1]). */
const onReveal = (state: unknown) =>
  typeof state === 'object' && state !== null && 'view' in state && state.view === 'reveal'

/**
 * The case screen (#6): the brief as its title, the tabs — Moments, Think, Papers — the
 * tutorial's banner, the view, the word bank at the foot, a paper over it when one opens, and the
 * reveal once the case is closed. The reveal is its own history entry, so the system's back
 * returns from it to the case (Gate 03 [1]). What the player has done is `progress`, kept by the
 * app; what they are in the middle of — the view, a word picked up, the last caption — is this
 * screen's.
 */
export function Player({ entry, progress, onProgress, onCases, onRestart, passages }: PlayerProps) {
  const { structure: s } = entry
  const text = entry.text.en
  // A solved case mounts on its reveal when that is the entry on top, else on Think, where its
  // answers are; a case still open mounts on Moments (review round 1, #21).
  const [view, setView] = useState<View>(() =>
    progress.solved ? (onReveal(history.state) ? 'reveal' : 'think') : 'moments',
  )
  const [selection, setSelection] = useState(nothing)
  const [caption, setCaption] = useState<Caption | null>(null)
  const [paper, setPaper] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  // Every picture of the case is requested as it opens, so the whole case is cached for offline.
  useEffect(() => prefetch(s), [s])
  // Back from the reveal returns to Think; forward to the reveal's entry returns to the reveal
  // while the case is solved. A reveal entry left ahead by a restart names a solution the case no
  // longer has, so it is made a case entry instead (review round 1, #21).
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (!onReveal(e.state)) setView((v) => (v === 'reveal' ? 'think' : v))
      else if (progress.solved) setView('reveal')
      else history.replaceState({ case: s.id }, '')
    }
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [progress.solved, s.id])

  /** Progress after a move; the case closing on it plays the sting and opens the reveal. */
  const close = (next: Progress) => {
    onProgress(next)
    if (next.solved && !progress.solved) {
      sting()
      history.pushState({ case: s.id, view: 'reveal' }, '')
      setView('reveal')
    }
  }
  const apply = (o: Outcome) => {
    setSelection(o.selection)
    setMessage(o.wants === undefined ? '' : strings.blankWants(o.wants))
    close(o.progress)
  }
  const onTap = (spotId: string) => {
    const { progress: next, added } = tap(s, progress, spotId)
    const spot = s.moments.flatMap((m) => m.spots).find((x) => x.id === spotId)
    // The note says "copied to Papers" only when this tap added the paper (review round 3, #20).
    const opened = next.papers.length > progress.papers.length ? spot?.paper : undefined
    setCaption({ spot: spotId, added, paper: opened })
    if (spot?.paper !== undefined) setPaper(spot.paper)
    onProgress(next)
  }
  const onSubmit = () => {
    const off = wrong(s, progress)
    setMessage(off === 0 ? '' : off <= 2 ? strings.oneOrTwoWrong : strings.severalWrong)
    close(submit(s, progress))
  }
  const current = step(s, progress)
  const moment = s.moments.find((m) => m.id === progress.moment) ?? s.moments[0]
  const tab = (id: View, label: string, count?: string, pulse = false) => (
    <button
      type="button"
      role="tab"
      aria-selected={view === id}
      className={'tab' + (view === id ? ' is-on' : '') + (pulse ? ' pulse' : '')}
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
        {view !== 'reveal' && (
          <nav className="tabs" role="tablist">
            {tab('moments', strings.moments)}
            {tab(
              'think',
              strings.think,
              `${filled(s, progress)}/${total(s)}`,
              thinkStep(s, progress) && view !== 'think',
            )}
            {tab(
              'papers',
              strings.papers,
              progress.papers.length ? String(progress.papers.length) : '',
            )}
          </nav>
        )}
      </header>
      {current && view !== 'reveal' && <div className="steps">{text.steps?.[current.id]}</div>}
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
        {view === 'think' && (
          <Think
            structure={s}
            text={text}
            progress={progress}
            selection={selection}
            message={message}
            onSlot={(t) => apply(chooseSlot(s, progress, selection, t))}
            onMoment={(id) => apply(chooseMoment(s, progress, selection, id))}
            onOrderSlot={(i) => apply(chooseOrderSlot(s, progress, selection, i))}
            onSubmit={onSubmit}
          />
        )}
        {view === 'papers' && <Papers text={text} papers={progress.papers} />}
        {view === 'reveal' && (
          <Reveal structure={s} text={text} passages={passages} onBack={onCases} />
        )}
      </main>
      {view !== 'reveal' && (
        <Bank
          structure={s}
          text={text}
          progress={progress}
          selection={selection}
          console={view === 'moments' ? caption : undefined}
          onWord={(id) => apply(chooseWord(s, progress, selection, id))}
        />
      )}
      {paper !== null && <PaperModal text={text} paper={paper} onClose={() => setPaper(null)} />}
    </div>
  )
}
