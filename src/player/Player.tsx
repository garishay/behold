import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import type { CaseEntry } from '../cases/index.ts'
import type { PassageService } from '../passages/service.ts'
import { play } from '../sound/engine.ts'
import { useCue } from '../sound/music.ts'
import { Switches } from '../sound/Switches.tsx'
import { strings } from '../strings/en.ts'
import { Bank } from './Bank.tsx'
import { CoachMark } from './CoachMark.tsx'
import { Dock, type Caption } from './Dock.tsx'
import { aim, broad, firstWrong, half, stranded, stuck, type Aim, type Tier } from './hints.ts'
import { PaperModal, PapersSheet } from './Papers.tsx'
import { prefetch } from './pictures.ts'
import { bring, showEmpty } from './place.ts'
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
  fitting,
  nothing,
  opened,
  placed,
  read,
  step,
  submit,
  tap,
  total,
  wrong,
  wrongs,
  type Outcome,
  type Progress,
} from './state.ts'
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

/** The view a history state names: the reveal's entry (Gate 03 [1]), Solve's (#77), or none. */
const viewOf = (state: unknown) =>
  typeof state === 'object' && state !== null && 'view' in state ? state.view : undefined

/**
 * A stuck signal's clock, as an effect's body (#29): it fires once, `seconds` after it starts,
 * timed only while the app is in view, and starts over on return.
 */
const clock = (seconds: number, fire: () => void) => () => {
  let timer = 0
  const start = () => {
    clearTimeout(timer)
    if (!document.hidden) timer = window.setTimeout(fire, seconds * 1000)
  }
  start()
  document.addEventListener('visibilitychange', start)
  return () => {
    clearTimeout(timer)
    document.removeEventListener('visibilitychange', start)
  }
}

/**
 * The case screen (#6, #24): one phone screen that never scrolls. Two views, Look and Solve,
 * switched from a bar at the foot, with the menu at its left end — the only chrome on both. Look is
 * the picture and its caption; Solve is who is who, the account, and the word bank. The brief
 * opens a fresh case as a card over the picture and lives in the menu after. The reveal is its own
 * history entry, so the system's back returns from it to the case (Gate 03 [1]). In a case still
 * open, Solve is an entry over the case's own, so back from Solve steps down to Look and back from
 * Look returns to the cards (#77); the reveal takes Solve's entry when the case closes, so a closed
 * case keeps the two it had. What the player has done is `progress`, kept by the app; what they
 * are in the middle of is this screen's.
 */
export function Player({ entry, progress, onProgress, onCases, onRestart, passages }: PlayerProps) {
  const { structure: s } = entry
  const text = entry.text.en
  // A solved case mounts on its reveal when that is the entry on top, else on Solve, where its
  // answers are (review round 1, #21); a case still open mounts on Solve when Solve's entry is on
  // top, as after a reload there, and else on Look (#77).
  const [view, setView] = useState<View>(() => {
    const at = viewOf(history.state)
    if (progress.solved) return at === 'reveal' ? 'reveal' : 'solve'
    return at === 'solve' ? 'solve' : 'look'
  })
  const [selection, setSelection] = useState(nothing)
  const [caption, setCaption] = useState<Caption | null>(null)
  const [paper, setPaper] = useState<string | null>(null)
  const [sheet, setSheet] = useState<Sheet>(null)
  // The brief's card, over the picture of a fresh case until Start or the first tap (#24).
  const [brief, setBrief] = useState(true)
  // Words found on Look since Solve was last left: the badge on Solve's button, then ringed in the
  // bank while Solve is open (#24).
  const [fresh, setFresh] = useState<readonly string[]>([])
  // A step whose words would sit over what the player reads or uses shows them until the next tap,
  // and keeps its ring: the last step's, over the account (#24 [3]), the sweep's, over the bank
  // (#25), and a question's, over the account's last lines (#77). `said` is the step whose words
  // have left and the showing they left at, so a step shown again brings them back.
  const [said, setSaid] = useState<string | null>(null)
  // A failed close in the tutorial brings the last step's words back as its retry, which says the
  // answers were checked (#25). One that finds wrong the slot the case asks about asks its question
  // instead, at that slot, and from then on the slot takes its ✓ when right (#77).
  const [retry, setRetry] = useState(false)
  const [asking, setAsking] = useState(false)
  // The valley teaches, so its failed close says where: every slot it found wrong, but the one its
  // question asks about, is ringed until it is changed, and then for good, so only the next close
  // checks it again (#77, review round 1). Every case's close does so from its second miss, the
  // order ringed whole as the one answer it is (#95).
  const [ringed, setRinged] = useState<readonly string[]>([])
  const [orderRinged, setOrderRinged] = useState(false)
  const [misses, setMisses] = useState(0)
  // A close that rings marks what fits too: each takes its ✓ and keeps it, as every ✓ does, the
  // order as one (#102).
  const [fits, setFits] = useState<readonly string[]>([])
  const [orderFits, setOrderFits] = useState(false)
  const told = asking && s.ask !== undefined ? [...fits, s.ask] : fits
  // A failed close with something still unfound rings Look until it opens (#95).
  const [seek, setSeek] = useState(false)
  // The bank's head: a refused word's message, or how far off a close was (07c, #24 [3]).
  const [note, setNote] = useState('')
  // The stuck signals (#29): taps on the picture that find nothing new while something is unfound,
  // a stay on a moment with something left, a wait on Solve with nothing left to place (#65), and
  // failed closes, each keeping the first thing it found wrong. A new find starts the first three
  // over, and a hint taken starts all four.
  const [run, setRun] = useState(0)
  const [stayed, setStayed] = useState(false)
  // The placements a fired wait belongs to: a word placed, emptied, or found starts it over, after
  // it has fired too (review round 2).
  const [waited, setWaited] = useState<string | null>(null)
  const [fails, setFails] = useState(0)
  const [missed, setMissed] = useState<string | null>(null)
  // The hint showing, what it points at and its tier; it stays until its thing is tapped (#29).
  const [hint, setHint] = useState<(Aim & { readonly tier: Tier }) | null>(null)
  // A hint's words leave on the next tap, as the last step's do (#24 [3]), so they never sit over a
  // caption being read; they come back as its ring moves on to the next button or the picture.
  const [saidAt, setSaidAt] = useState<string | null>(null)
  // A mark shown again, dim and all: a guided step's when a signal fires under it, since the
  // step's own mark is the tutorial's hint, or a hint's asked for past its last tier (#29).
  const [nudges, setNudges] = useState(0)
  // A caption opened whole over the picture's foot; the next caption opens closed (#24).
  const [reading, setReading] = useState(false)
  // Solve keeps its place: the account, left for Look, opens again where it was (#24, Solve's room).
  const kept = useRef(0)
  const keep = useCallback((el: HTMLDivElement | null) => {
    el?.scrollBy({ top: kept.current, behavior: 'instant' })
  }, [])
  // Whether Look has opened during the sweep: until it has, the sweep holds Solve to Look's button,
  // and from then on the sweep holds nothing (#77, the addendum to the sixth amendment).
  const [looked, setLooked] = useState(false)
  // The case's music on Look and Solve; on the reveal it fades under the close, and the passage is
  // read in quiet (Gate 10 A2).
  useCue(view === 'reveal' ? null : 'case')
  // Every picture of the case is requested as it opens, so the whole case is cached for offline.
  useEffect(() => prefetch(s), [s])

  const moment = s.moments.find((m) => m.id === progress.moment) ?? s.moments[0]
  const card = brief && progress.tapped.length === 0
  const spots = s.moments.flatMap((m) => m.spots)
  const unfound = (list: typeof moment.spots) => list.some((x) => !progress.tapped.includes(x.id))
  // Under a guided step the step's own mark is the hint: no hint is offered, and a signal shows the
  // step again (#29). On Look the step that waits on every spot found marks nothing, so there the
  // signals offer hints as in any case (#25); a question's point at the evidence for its slot (#77).
  // A step waiting on the dock's line of finds is passed while the dock shows none, as on a reload
  // or a return to the case; the next move meets it (#77).
  const current = step(s, caption ? progress : read(s, progress))
  const sweep = current?.until?.found !== undefined
  // The slot the question asks about, while it is asked and still wrong (#77).
  const put = (p: Progress, id: string) => p.faces[id] ?? p.fills[id]
  const wrongAt = (id?: string) => id !== undefined && put(progress, id) !== answer(s, id)
  const asked = asking && wrongAt(s.ask) ? s.ask : undefined
  const looks = sweep || asked !== undefined
  const guided = current?.until !== undefined && !(looks && view === 'look')
  // The guided steps hold the screen to their mark, each until it is met, and the sweep holds Solve
  // to Look's button until Look opens, so the way back to the picture is the only move; free play
  // starts there, and a player back on Solve during the sweep is never held (#77).
  if (sweep && view === 'look' && !looked) setLooked(true)
  const holds = current?.until !== undefined && !(sweep && looked)
  const nudge = () => setNudges(nudges + 1)
  // Close the case shows once it can close: every slot filled (#24, Solve's room).
  const full = filled(s, progress) === total(s)
  const fleeting = current !== undefined && (current.until === undefined || looks)
  const showing = `${current?.id}#${nudges}`
  // A step that only tells, the dock's line of finds read, is met by a tap on the dock it rings, or
  // by the next move; Open Solve, under its words, meets it and the step after (#77).
  const meet = current?.until?.read !== undefined ? () => onProgress(read(s, progress)) : undefined
  // The stay is timed on Look with nothing over the picture, an opened caption included (review
  // round 1), on a moment with something left, and only while the app is in view: the clock starts
  // over on each new find, and on return.
  const covered = card || sheet !== null || paper !== null || reading
  const watching = view === 'look' && !covered && unfound(moment.spots)
  useEffect(
    () =>
      watching
        ? clock(stuck.seconds, () => (guided ? setNudges((n) => n + 1) : setStayed(true)))()
        : undefined,
    [watching, guided, progress.tapped.length, progress.moment, hint],
  )
  // The wait is timed on Solve with nothing over it, while something is empty and nothing is left
  // to place (#65); its clock starts over on every word placed, emptied, or found.
  const strandedNow = stranded(s, progress).size > 0
  const stalled = view === 'solve' && !covered && strandedNow
  const placements = JSON.stringify([progress.faces, progress.fills, progress.bank])
  useEffect(
    () =>
      stalled
        ? clock(stuck.stranded, () => (guided ? setNudges((n) => n + 1) : setWaited(placements)))()
        : undefined,
    [stalled, guided, placements, hint],
  )

  /**
   * Progress after a move; the case closing on it plays the close and opens the reveal, whose entry
   * takes Solve's, so a closed case keeps the two entries it always had (#21, #77).
   */
  const close = (next: Progress) => {
    onProgress(next)
    if (next.solved && !progress.solved) {
      play('close')
      const reveal = { case: s.id, view: 'reveal' }
      if (viewOf(history.state) === 'solve') history.replaceState(reveal, '')
      else history.pushState(reveal, '')
      setView('reveal')
    }
  }
  const apply = (o: Outcome) => {
    setSelection(o.selection)
    const kind = o.wants
    const found = progress.bank.some((w) => s.words[w] === kind)
    setNote(kind === undefined ? '' : strings.blankWants(kind, found))
    if (placed(progress, o.progress)) play('place')
    // A wrong word set in the slot a question asks about asks again, words, dim, and all (#77).
    const word = asked && put(o.progress, asked)
    if (word && word !== put(progress, asked) && word !== answer(s, asked)) nudge()
    // A move that changes a ringed slot takes its ring away (#77, review round 1), and one that
    // changes the order takes the order's (#95).
    const kept = ringed.filter((id) => put(o.progress, id) === put(progress, id))
    if (kept.length < ringed.length) setRinged(kept)
    if (o.progress.order.join() !== progress.order.join()) setOrderRinged(false)
    close(o.progress)
  }
  // A tap that found nothing new, on a spot found before or on no spot, runs toward a hint while
  // something is still unfound. A guided step holds the picture to its ring, so none runs under one
  // (#77).
  const nothingNew = () => {
    if (unfound(spots)) setRun(run + 1)
  }
  const onTap = (spotId: string) => {
    const { progress: next, added } = tap(s, progress, spotId)
    const spot = spots.find((x) => x.id === spotId)
    // The note says "copied to Papers" only when this tap added the paper (review round 3, #20).
    const opened = next.papers.length > progress.papers.length ? spot?.paper : undefined
    setCaption({ spot: spotId, added, paper: opened })
    setReading(false)
    // A spot's first tap is found, or paper when it copies one; a spot tapped again is silent.
    if (opened !== undefined) play('paper')
    else if (next.tapped.length > progress.tapped.length) play('found')
    if (next.tapped.length > progress.tapped.length) {
      setRun(0)
      setStayed(false)
      setWaited(null)
    } else nothingNew()
    // A hint has done its work once its thing is tapped (#29).
    if (hint?.spot === spotId) setHint(null)
    setFresh([...fresh, ...added])
    if (spot?.paper !== undefined) setPaper(spot.paper)
    onProgress(next)
  }
  const onSubmit = () => {
    const off = wrong(s, progress)
    // How many don't match, as a number, and how many things are still to find (#95).
    const left = spots.filter((x) => !progress.tapped.includes(x.id)).length
    const rest = left > 0 ? ` ${strings.toFind(left, s.moments.length)}` : ''
    setNote(off === 0 ? '' : strings.noMatch(off) + rest)
    if (off > 0) {
      const first = firstWrong(s, progress) ?? null
      play('notYet')
      setFails(fails + 1)
      setMisses(misses + 1)
      setSeek(left > 0)
      setMissed(first)
      // In the tutorial the last step's mark comes back, dim and all, with its retry (#25), or as
      // the question at the slot the case asks about when this close found it wrong; every other
      // slot it found wrong is ringed, and with no question to bring one into view, the first
      // ring is brought there (#77).
      if (current !== undefined && current.until === undefined) {
        const at = wrongs(s, progress).filter((id) => id !== s.ask)
        setRinged(at)
        setFits(fitting(s, progress))
        if (wrongAt(s.ask)) setAsking(true)
        else {
          setRetry(true)
          bring(document.querySelector(`[data-slot="${at[0]}"]`))
        }
        nudge()
      } else if (misses > 0) {
        // From a case's second miss, its close rings what doesn't match, as the valley's does (#95),
        // marks what fits, and brings the first ring into view in Solve's order: a face, the order,
        // then a blank (#102 [3]).
        setRinged(wrongs(s, progress))
        setFits(fitting(s, progress))
        setOrderRinged(s.order?.some((m, i) => progress.order[i] !== m) ?? false)
        setOrderFits(s.order?.every((m, i) => progress.order[i] === m) ?? false)
        const order = first !== null && s.order?.includes(first)
        bring(document.querySelector(order ? '.order' : `[data-slot="${first}"]`))
      }
    }
    if (hint?.why === 'close') setHint(null)
    close(submit(s, progress))
  }
  /**
   * A view landed, by its tab or by the history's back and forward (#77, the owner's review): all
   * a tab does but its step in the history.
   */
  const land = (v: 'look' | 'solve') => {
    // The rings clear when Solve is left, not when its own tab is tapped again (review round 1),
    // and what was picked up or waiting is let go (#24, Solve's room).
    if (view === 'solve' && v !== 'solve') {
      setFresh([])
      setSelection(nothing)
      kept.current = document.querySelector('.solve')?.scrollTop ?? 0
    }
    // Look's caption closes with the dock when Solve opens.
    if (v !== view) setReading(false)
    // Back on Look while the tutorial waits on everything found, or on an answer worked out there,
    // the caption gives way to the prompt, "Tap anything that looks like it matters." (#25, #77).
    if (v === 'look' && looks) setCaption(null)
    // Look opened, its ring from a failed close has done its work (#95).
    if (v === 'look') setSeek(false)
    setView(v)
    onProgress(opened(s, progress, v))
  }
  const show = (v: 'look' | 'solve') => {
    // Solve's button on Solve, its count ringed by the last step, brings an empty slot into view.
    if (v === 'solve' && view === 'solve') showEmpty()
    // In a case still open, Solve opens as an entry, and Look's button from it steps back (#77).
    if (v !== view && !progress.solved) {
      if (v === 'solve') history.pushState({ case: s.id, view: 'solve' }, '')
      else if (viewOf(history.state) === 'solve') history.back()
    }
    land(v)
  }
  // Back from the reveal returns to Solve; forward to the reveal's entry returns to the reveal
  // while the case is solved. A reveal entry left ahead by a restart names a solution the case no
  // longer has, so it is made a case entry instead (review round 1, #21). In a case still open the
  // case's own entry is Look and Solve's is Solve, so back and forward step between them (#77). A
  // view they step to lands as its tab lands it, and the view already showing, as after a tab's
  // own step back, lands nothing more (#77, the owner's review).
  const stepped = useEffectEvent((v: 'look' | 'solve') => {
    if (v !== view) land(v)
  })
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const at = viewOf(e.state)
      if (at !== 'reveal') stepped(at === 'solve' || progress.solved ? 'solve' : 'look')
      else if (progress.solved) setView('reveal')
      else history.replaceState({ case: s.id }, '')
    }
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [progress.solved, s.id])
  /**
   * A hint asked for, from the offer or the menu (#29): the second tier of the one showing, or a new
   * one's first. It starts the signals over, and the tier is kept for the close. Asked for past its
   * last tier, the hint's mark is shown again, and under a guided step the step's is. Where a
   * thing's half would take most of the picture, its first hint is the second tier: tier 1 would
   * ring the same box and say less (#102 [1]).
   */
  const take = () => {
    setSaidAt(null)
    if (guided || hint?.tier === 2 || hint?.why === 'close') return nudge()
    const target = aim(s, progress, missed ?? asked ?? null)
    const box = spots.find((x) => x.id === target.spot)?.box
    const next = hint
      ? { ...hint, tier: 2 as const }
      : { ...target, tier: box && broad(box) ? (2 as const) : (1 as const) }
    setHint(next)
    setRun(0)
    setStayed(false)
    setWaited(null)
    setFails(0)
    setMissed(null)
    onProgress({ ...progress, hints: [...progress.hints, next.tier] })
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
            {/* A quiet Hint for a player who wants one sooner, never lit (#29). */}
            {!progress.solved && (
              <button
                type="button"
                onClick={() => {
                  setSheet(null)
                  take()
                }}
              >
                {strings.hint}
              </button>
            )}
            <button type="button" onClick={onCases}>
              {strings.cases}
            </button>
            <button type="button" onClick={onRestart}>
              {strings.restart}
            </button>
            <Switches />
          </div>
        </div>
      )}
    </>
  )
  if (view === 'reveal')
    return (
      <div className="app reading">
        {menu}
        <Reveal
          structure={s}
          text={text}
          passages={passages}
          onBack={onCases}
          hints={progress.hints.length}
        />
      </div>
    )
  // Where the tutorial's step is shown (#25): at its target on this view — the spot, Solve's
  // button, the answer's word and then its slot, or for a step that leads with its slot the slot
  // and then the word (#77), or Close the case — or at the button of the view that holds it; the
  // step that waits on everything found, at Look's button and nowhere on Look;
  // the step that waits on the dock's line of finds read, at the dock whole, the caption with its
  // line, so its words sit above it (#77); and the question, at its slot, never its word, and from
  // Look at Solve's button (#77, [Q11]). From Look, a ring on Solve's button carries words only for
  // the step that waits on Solve opening, and they sit above the dock: a fill, the close, and the
  // question are Solve's to say, so the caption stays clear (#77). Nothing is marked under a card,
  // a sheet, or a paper.
  const markAt = (until = current?.until) => {
    if (current === undefined || card || sheet !== null || paper !== null) return undefined
    if (until?.tapped)
      return view === 'look' ? `[data-spot="${until.tapped}"]` : '[data-view="look"]'
    if (until?.found) return view === 'look' ? undefined : '[data-view="look"]'
    if (until?.read) return view === 'look' ? '.dock' : undefined
    if (asked !== undefined && view !== 'look') return `[data-slot="${asked}"]`
    if (until?.view || view === 'look') return '[data-view="solve"]'
    const filled = until?.filled
    // The last step rings Solve's count until Close the case shows (#24, Solve's room), Look's
    // button while a failed close has left something unfound there (#95), and after one, the first
    // answer it ringed (#102).
    if (filled === undefined) {
      if (seek) return '[data-view="look"]'
      if (retry && ringed.length > 0) return `[data-slot="${ringed[0]}"]`
      return full ? '[data-close]' : '[data-view="solve"]'
    }
    const word = answer(s, filled)
    if (current.slotFirst)
      return selection.target === filled ? `[data-word="${word}"]` : `[data-slot="${filled}"]`
    return selection.word === word ? `[data-slot="${filled}"]` : `[data-word="${word}"]`
  }
  // Where a hint's ring sits (#29), reached as a step's is: through Look's button from Solve and the
  // picker's from another moment, to the half of the picture for the first tier and the thing itself
  // for the second; or Close the case, through Solve's button. It takes the step's place.
  const aimed = spots.find((x) => x.id === hint?.spot)
  const home = s.moments.find((m) => aimed !== undefined && m.spots.includes(aimed))
  const halved = hint?.tier === 1 && aimed !== undefined
  const hintAt = () => {
    if (hint === null || card || sheet !== null || paper !== null) return undefined
    if (hint.why === 'close') return view === 'look' ? '[data-view="solve"]' : '[data-close]'
    if (view !== 'look') return '[data-view="look"]'
    if (home !== undefined && home !== moment) return `[data-moment="${home.id}"]`
    return halved ? '[data-half]' : `[data-spot="${hint.spot}"]`
  }
  // A hint for an answer says which (#102): a face by its line, the order by its question, a blank
  // by the three words before it in its sentence, or after it when it opens one.
  const named = (id: string) => {
    if (s.faces.some((f) => f.id === id)) return text.faces[id]
    if (s.order?.includes(id)) return strings.whatHappenedFirst
    const parts = Object.values(text.blocks).find((b) => b.parts.some((x) => x.b === id))?.parts
    const i = parts?.findIndex((x) => x.b === id) ?? -1
    const before = (parts?.[i - 1]?.t ?? '')
      .split(/[.!?][”’]?\s/)
      .at(-1)!
      .split(/\s+/)
    const after = (parts?.[i + 1]?.t ?? '').split(/\s+/).filter(Boolean)
    const near = before.filter(Boolean).slice(-3)
    return near.length > 0
      ? [...near, strings.blankMark].join(' ')
      : [strings.blankMark, ...after.slice(0, 3)].join(' ')
  }
  const hinted = hintAt()
  const at = hinted ?? markAt()
  // A step that leads with its slot says what comes next once the slot waits (#102).
  const forms = current && text.steps?.[current.id]
  const waits = current?.slotFirst === true && selection.target === current.until.filled
  const stepWords = typeof forms === 'string' ? forms : forms?.[waits ? 1 : 0]
  // A ring with no words carries no dim either ([Q11]).
  const silent =
    view === 'look' && at === '[data-view="solve"]' && current?.until?.view === undefined
  // The case's one new idea, marked on Solve where it is first met: while the order is empty, the
  // pictures to place and then, once one is picked, the slots it goes in, as the tutorial marks a
  // word and then its slot (#30); or a face, until a name is placed in it (#53). A tutorial's step
  // comes first; nothing is marked under a sheet or a paper.
  const lessonAt = (teach = s.teach) => {
    if (teach === undefined || view !== 'solve' || at !== undefined) return undefined
    if (sheet !== null || paper !== null) return undefined
    if (teach !== 'order')
      return progress.faces[teach.face] === undefined ? `[data-face="${teach.face}"]` : undefined
    if (progress.order.some((m) => m !== null)) return undefined
    return selection.moment === null ? '.tiles' : '.order'
  }
  const lesson = lessonAt()
  // A hint on offer once a signal fires, or its second tier once its first shows; never under a
  // guided step (#29). It sits at the foot of the view: the caption's dock, or beside Close.
  const signalled = run >= stuck.taps || stayed || waited === placements || fails >= stuck.closes
  const more = hint?.tier === 1 && hint.why !== 'close'
  const offer = !guided && !progress.solved && (more || (hint === null && signalled)) && (
    <button type="button" className="offer" onClick={take}>
      {view === 'look' && <span>{more ? strings.stillStuck : strings.stuck}</span>}{' '}
      <b>{more ? strings.showMe : strings.whereToLook}</b>
    </button>
  )
  // Look carries the case's found count, as Solve carries what is filled (#24, rulings [1], [5]).
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
              setReading(false)
              onProgress({ ...progress, moment: id })
            }}
            onTap={onTap}
            onMiss={nothingNew}
            half={halved && aimed && home === moment ? half(aimed.box) : undefined}
            marks={hint?.why !== 'evidence'}
          >
            {card && (
              <div className="card" role="dialog" aria-label={text.title}>
                <h2>{text.title}</h2>
                <p>{text.brief}</p>
                {/* The tutorial says how to play under its brief, and a case with a note says
                    what its screen adds (#77). */}
                {s.steps && <p className="how">{strings.howTo}</p>}
                {text.note && <p className="how">{text.note}</p>}
                <button type="button" onClick={() => setBrief(false)}>
                  {strings.start}
                </button>
              </div>
            )}
          </Stage>
          <Dock
            structure={s}
            text={text}
            caption={caption}
            offer={offer || undefined}
            onMore={setReading}
          />
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
          <div className="solve" ref={keep}>
            <Think
              structure={s}
              text={text}
              progress={progress}
              selection={selection}
              onSlot={(t) => apply(chooseSlot(s, progress, selection, t, told))}
              onMoment={(id) => apply(chooseMoment(s, progress, selection, id))}
              onOrderSlot={(i) => orderFits || apply(chooseOrderSlot(s, progress, selection, i))}
              told={told}
              ringed={ringed}
              orderRinged={orderRinged}
              orderFits={orderFits}
            />
          </div>
          {/* Close the case docks as its own row below the account, outside the scroll, so it never
              moves and never covers the account; a guided case offers it once its steps are done
              (07d, #24; #26 [4]). It shows once every slot is filled, and until then the account
              has the row, or a hint on offer has it alone (#24, Solve's room). */}
          {closable(s, progress) && (full || offer) && (
            <div className="submit-row">
              {full && (
                <button
                  type="button"
                  className="submit"
                  data-close
                  disabled={progress.solved}
                  onClick={onSubmit}
                >
                  {strings.closeCase}
                </button>
              )}
              {offer}
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
      {hinted && hint && (
        <CoachMark
          key={nudges}
          at={hinted}
          label={
            saidAt === hinted
              ? ''
              : hint.why === 'evidence'
                ? (hint.tier === 2 ? strings.hintSettlesThing : strings.hintSettles)(
                    named(hint.for),
                  )
                : hint.tier === 2
                  ? strings.hintThing
                  : strings.hintSays[hint.why]
          }
          onTap={() => setSaidAt(hinted)}
        />
      )}
      {!hinted && at && current && (
        <CoachMark
          key={nudges}
          at={at}
          label={
            (fleeting && said === showing) || silent
              ? ''
              : ((asked !== undefined
                  ? text.ask
                  : retry && !current.until
                    ? text.retry
                    : stepWords) ?? '')
          }
          onTap={
            meet ?? (fleeting && said !== showing && !silent ? () => setSaid(showing) : undefined)
          }
          onNext={meet && (() => show('solve'))}
          hold={holds}
        />
      )}
      {lesson && <CoachMark at={lesson} label={text.teach ?? ''} />}
      {/* A failed close with something unfound rings Look, with no words, until it opens; the
          tutorial's last step rings it instead (#95). */}
      {seek && view === 'solve' && !current && !hinted && (
        <CoachMark at='[data-view="look"]' label="" />
      )}
    </div>
  )
}
