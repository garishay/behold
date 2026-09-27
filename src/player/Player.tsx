import { useEffect, useState } from 'react'
import type { CaseEntry } from '../cases/index.ts'
import type { PassageService } from '../passages/service.ts'
import { strings } from '../strings/en.ts'
import { Bank } from './Bank.tsx'
import { CoachMark } from './CoachMark.tsx'
import { Dock, type Caption } from './Dock.tsx'
import { PaperModal, PapersSheet } from './Papers.tsx'
import { prefetch } from './pictures.ts'
import { Reveal } from './Reveal.tsx'
import { Stage } from './Stage.tsx'
import {
  answer,
  chooseMoment,
  chooseOrderSlot,
  chooseSlot,
  chooseWord,
  closable,
  filled,
  nothing,
  opened,
  step,
  submit,
  tap,
  total,
  wrong,
  type Outcome,
  type Progress,
} from './state.ts'
import { sting } from './sting.ts'
import { Think } from './Think.tsx'

type View = 'look' | 'solve' | 'reveal'
type Sheet = 'menu' | 'papers' | null

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
 * The case screen (#6, #24): one phone screen that never scrolls. Two views, Look and Solve,
 * switched from a bar at the foot, with the menu at its left end — the only chrome on both. Look is
 * the picture and its caption; Solve is who is who, the account, and the word bank. The brief
 * opens a fresh case as a card over the picture and lives in the menu after. The reveal is its own
 * history entry, so the system's back returns from it to the case (Gate 03 [1]); Look and Solve
 * are not entries, so back from either returns to the cards. What the player has done is
 * `progress`, kept by the app; what they are in the middle of is this screen's.
 */
export function Player({ entry, progress, onProgress, onCases, onRestart, passages }: PlayerProps) {
  const { structure: s } = entry
  const text = entry.text.en
  // A solved case mounts on its reveal when that is the entry on top, else on Solve, where its
  // answers are; a case still open mounts on Look (review round 1, #21).
  const [view, setView] = useState<View>(() =>
    progress.solved ? (onReveal(history.state) ? 'reveal' : 'solve') : 'look',
  )
  const [selection, setSelection] = useState(nothing)
  const [caption, setCaption] = useState<Caption | null>(null)
  const [paper, setPaper] = useState<string | null>(null)
  const [sheet, setSheet] = useState<Sheet>(null)
  // The brief's card, over the picture of a fresh case until Start or the first tap (#24).
  const [brief, setBrief] = useState(true)
  // Words found on Look since Solve was last left: the badge on Solve's button, then ringed in the
  // bank while Solve is open (#24).
  const [fresh, setFresh] = useState<readonly string[]>([])
  // The last step's words leave on the next tap after they show, and its ring stays (#24 [3]).
  const [lastSaid, setLastSaid] = useState(false)
  // The bank's head: a refused word's message, or how far off a close was (07c, #24 [3]).
  const [note, setNote] = useState('')
  // Every picture of the case is requested as it opens, so the whole case is cached for offline.
  useEffect(() => prefetch(s), [s])
  // Back from the reveal returns to Solve; forward to the reveal's entry returns to the reveal
  // while the case is solved. A reveal entry left ahead by a restart names a solution the case no
  // longer has, so it is made a case entry instead (review round 1, #21).
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (!onReveal(e.state)) setView((v) => (v === 'reveal' ? 'solve' : v))
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
    setNote(o.wants === undefined ? '' : strings.blankWants(o.wants))
    close(o.progress)
  }
  const onTap = (spotId: string) => {
    const { progress: next, added } = tap(s, progress, spotId)
    const spot = s.moments.flatMap((m) => m.spots).find((x) => x.id === spotId)
    // The note says "copied to Papers" only when this tap added the paper (review round 3, #20).
    const opened = next.papers.length > progress.papers.length ? spot?.paper : undefined
    setCaption({ spot: spotId, added, paper: opened })
    setFresh([...fresh, ...added])
    if (spot?.paper !== undefined) setPaper(spot.paper)
    onProgress(next)
  }
  const onSubmit = () => {
    const off = wrong(s, progress)
    setNote(off === 0 ? '' : off <= 2 ? strings.oneOrTwoWrong : strings.severalWrong)
    close(submit(s, progress))
  }
  const show = (v: 'look' | 'solve') => {
    // The rings clear when Solve is left, not when its own tab is tapped again (review round 1).
    if (view === 'solve' && v !== 'solve') setFresh([])
    setView(v)
    onProgress(opened(s, progress, v))
  }
  // The menu: the one piece of chrome on every view, the reveal's included.
  const menu = (
    <>
      <button
        type="button"
        className="menu-btn"
        aria-label={strings.menu}
        onClick={() => setSheet('menu')}
      />
      {sheet === 'menu' && (
        <div className="modal sheet" onClick={() => setSheet(null)}>
          <div
            className="menu"
            role="dialog"
            aria-label={strings.menu}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{text.title}</h2>
            <p>{text.brief}</p>
            <button type="button" onClick={onCases}>
              {strings.cases}
            </button>
            <button type="button" onClick={onRestart}>
              {strings.restart}
            </button>
          </div>
        </div>
      )}
    </>
  )
  if (view === 'reveal')
    return (
      <div className="app reading">
        {menu}
        <Reveal structure={s} text={text} passages={passages} onBack={onCases} />
      </div>
    )
  const moment = s.moments.find((m) => m.id === progress.moment) ?? s.moments[0]
  const card = brief && progress.tapped.length === 0
  // Where the tutorial's step is shown (#25): at its target on this view — the spot, Solve's
  // button, the answer's word and then its slot, or Close the case — or at the button of the view
  // that holds it. Nothing is marked under a card, a sheet, or a paper.
  const current = step(s, progress)
  const markAt = (until = current?.until) => {
    if (current === undefined || card || sheet !== null || paper !== null) return undefined
    if (until?.tapped)
      return view === 'look' ? `[data-spot="${until.tapped}"]` : '[data-view="look"]'
    if (until?.view || view === 'look') return '[data-view="solve"]'
    const filled = until?.filled
    if (filled === undefined) return '[data-close]'
    const word = answer(s, filled)
    return selection.word === word ? `[data-slot="${filled}"]` : `[data-word="${word}"]`
  }
  const at = markAt()
  // Look carries the case's found count, as Solve carries what is filled (#24, rulings [1], [5]).
  const spots = s.moments.flatMap((m) => m.spots)
  const found = `${spots.filter((x) => progress.tapped.includes(x.id)).length}/${spots.length}`
  const tab = (v: 'look' | 'solve') => (
    <button
      type="button"
      role="tab"
      data-view={v}
      aria-selected={view === v}
      className={'tab' + (view === v ? ' is-on' : '')}
      onClick={() => show(v)}
    >
      {strings[v]}
      <span className="n">{v === 'look' ? found : `${filled(s, progress)}/${total(s)}`}</span>
      {v === 'solve' && view !== 'solve' && fresh.length > 0 && (
        <span key={fresh.length} className="new">{`+${fresh.length}`}</span>
      )}
    </button>
  )
  return (
    <div className="app">
      {view === 'look' ? (
        <>
          <Stage
            structure={s}
            text={text}
            moment={moment}
            tapped={progress.tapped}
            onMoment={(id) => {
              setCaption(null)
              onProgress({ ...progress, moment: id })
            }}
            onTap={onTap}
          >
            {card && (
              <div className="card" role="dialog" aria-label={text.title}>
                <h2>{text.title}</h2>
                <p>{text.brief}</p>
                <button type="button" onClick={() => setBrief(false)}>
                  {strings.start}
                </button>
              </div>
            )}
          </Stage>
          <Dock structure={s} text={text} caption={caption} />
        </>
      ) : (
        <>
          {/* Papers is held above the account while it scrolls, once a paper is found (#24 [4]). */}
          {progress.papers.length > 0 && (
            <div className="papers-row">
              <button type="button" className="papers-btn" onClick={() => setSheet('papers')}>
                {strings.papers}
                <span className="n">{progress.papers.length}</span>
              </button>
            </div>
          )}
          <div className="solve">
            <Think
              structure={s}
              text={text}
              progress={progress}
              selection={selection}
              onSlot={(t) => apply(chooseSlot(s, progress, selection, t))}
              onMoment={(id) => apply(chooseMoment(s, progress, selection, id))}
              onOrderSlot={(i) => apply(chooseOrderSlot(s, progress, selection, i))}
            />
          </div>
          {/* Close the case docks as its own row below the account, outside the scroll, so it never
              moves and never covers the account; a guided case offers it once its steps are done
              (07d, #24; #26 [4]). */}
          {closable(s, progress) && (
            <div className="submit-row">
              <button
                type="button"
                className="submit"
                data-close
                disabled={filled(s, progress) < total(s) || progress.solved}
                onClick={onSubmit}
              >
                {filled(s, progress) < total(s)
                  ? strings.closeCaseProgress(filled(s, progress), total(s))
                  : strings.closeCase}
              </button>
            </div>
          )}
          <Bank
            structure={s}
            text={text}
            progress={progress}
            selection={selection}
            fresh={fresh}
            note={note}
            onWord={(id) => apply(chooseWord(s, progress, selection, id))}
          />
        </>
      )}
      <nav className="bar">
        {menu}
        <div role="tablist">
          {tab('look')}
          {tab('solve')}
        </div>
      </nav>
      {sheet === 'papers' && (
        <PapersSheet text={text} papers={progress.papers} onClose={() => setSheet(null)} />
      )}
      {paper !== null && <PaperModal text={text} paper={paper} onClose={() => setPaper(null)} />}
      {at && current && (
        <CoachMark
          at={at}
          label={current.until || !lastSaid ? (text.steps?.[current.id] ?? '') : ''}
          onTap={current.until || lastSaid ? undefined : () => setLastSaid(true)}
        />
      )}
    </div>
  )
}
