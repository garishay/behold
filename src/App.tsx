import { useEffect, useState, type CSSProperties } from 'react'
import { cases } from './cases/index.ts'
import { fetchedPassages } from './passages/proxy.ts'
import type { PassageService } from './passages/service.ts'
import { picture } from './player/pictures.ts'
import { Player } from './player/Player.tsx'
import { fresh, type Progress } from './player/state.ts'
import { load, save, type Saved } from './player/storage.ts'
import { Music } from './sound/music.ts'
import { Switches } from './sound/Switches.tsx'
import { strings } from './strings/en.ts'
import { Title } from './Title.tsx'

/**
 * The history entries the app pushes (Gate 03 [1]): one for an open case, and one on top of it
 * for the case's reveal, so the system's back returns from the reveal to the case and from the
 * case to the cards, and leaves the app only from the cards.
 */
interface Entry {
  readonly case: string
  readonly view?: 'reveal'
}

/** The entry a history state carries, or none: the app's own states hold a case id and, on the reveal, its view. */
const entry = (state: unknown): Entry | null =>
  typeof state === 'object' && state !== null && 'case' in state && typeof state.case === 'string'
    ? (state as Entry)
    : null

/**
 * How long the title takes to give way to the cases page, its last card risen. The page takes no
 * tap until then, so no card takes one before it can be seen (#75, Gate 21 A2 as amended).
 */
const leaving = 1600
/**
 * Under reduced motion the cases page shows at once, and takes no tap for half a second, so a quick
 * second tap on Begin opens nothing beneath it (#75, Gate 21 A2 as ruled).
 */
const settling = 500
/** How long a locked card's tap keeps the way forward lit and says why (#75). */
const nudging = 3000

interface AppProps {
  /** The passage service the reveal reads through; the proxy (#3), or a test's own. */
  passages?: PassageService
}

/**
 * The cases page (#6), with the title over it when the app opens there (#75): the header, the
 * case cards, each opening its case in the player, then the epigraph and its notice (Gate 01
 * A6). Progress is kept on the device and restored on the next visit. An open case is a history
 * entry — no route, no URL — so back returns to the cards, and leaves the app only from them; the
 * title adds none. The season plays in order: a case waits for the one before it.
 */
export default function App({ passages = fetchedPassages }: AppProps) {
  const [saved, setSaved] = useState<Saved>(() => load(cases))
  const [open, setOpen] = useState<string | null>(() => entry(history.state)?.case ?? null)
  // The title shows only when the app opens on the cases page, never on the way back from a case.
  // After Begin it is leaving, or settling under reduced motion; either way the page takes no tap
  // until that ends.
  const [title, setTitle] = useState<'shown' | 'leaving' | 'settling' | null>(() =>
    open ? null : 'shown',
  )
  const [nudge, setNudge] = useState(0)
  const [restarts, setRestarts] = useState(0)
  useEffect(() => save(saved), [saved])
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      setOpen(entry(e.state)?.case ?? null)
      setTitle(null)
    }
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])
  useEffect(() => {
    if (title !== 'leaving' && title !== 'settling') return
    const t = setTimeout(() => setTitle(null), title === 'leaving' ? leaving : settling)
    return () => clearTimeout(t)
  }, [title])
  useEffect(() => {
    if (nudge === 0) return
    const t = setTimeout(() => setNudge(0), nudging)
    return () => clearTimeout(t)
  }, [nudge])

  const openCase = (id: string, progress: Progress) => {
    setSaved({ ...saved, [id]: progress })
    history.pushState({ case: id } satisfies Entry, '')
    // A closed case opens on its reveal, which is its own entry, so back returns to the case.
    if (progress.solved) history.pushState({ case: id, view: 'reveal' } satisfies Entry, '')
    setOpen(id)
  }
  // "Cases" and "Back to cases" pop the case's entries when they are on top — one for the case,
  // two from its reveal — so the history stays true to the screen; after a reload the entries
  // are still there to pop.
  const toCases = () => {
    const top = entry(history.state)
    if (top === null) setOpen(null)
    else history.go(top.view === 'reveal' ? -2 : -1)
  }

  const found = cases.find((c) => c.structure.id === open)
  if (found && open !== null) {
    const progress = saved[open] ?? fresh(found.structure)
    const set = (p: Progress) => setSaved({ ...saved, [open]: p })
    return (
      <Player
        key={`${open}:${restarts}`}
        entry={found}
        progress={progress}
        onProgress={set}
        onCases={toCases}
        onRestart={() => {
          if (!window.confirm(strings.restartConfirm)) return
          // A restart from the reveal leaves the reveal's entry behind.
          if (entry(history.state)?.view === 'reveal') history.back()
          set(fresh(found.structure))
          setRestarts(restarts + 1)
        }}
        passages={passages}
      />
    )
  }
  // The season plays in order (Gate 21 A5 as ruled): a case is open when it is the first, when the
  // case before it is closed, or when it has progress of its own. A locked card's tap lights the
  // earliest case not yet closed, which is always open.
  const closed = (i: number) => saved[cases[i].structure.id]?.solved === true
  const locked = (i: number) => i > 0 && !closed(i - 1) && !saved[cases[i].structure.id]
  const next = cases.findIndex((_, i) => !closed(i))
  const begin = () =>
    setTitle(matchMedia('(prefers-reduced-motion: reduce)').matches ? 'settling' : 'leaving')
  if (title === 'shown') return <Title leaving={false} onBegin={begin} />
  return (
    <main className={title === 'leaving' ? 'screen arriving' : 'screen'} inert={title !== null}>
      <header className="masthead">
        <h1>{strings.title}</h1>
        <p className="kicker">{strings.kicker}</p>
      </header>
      <div className="case-list">
        {cases.map(({ structure, text }, i) => {
          const p = saved[structure.id]
          const thumb =
            structure.moments.find((m) => m.id === structure.thumb) ?? structure.moments[0]
          const status = locked(i)
            ? strings.opensAfter(cases[i - 1].text.en.title)
            : p
              ? p.solved
                ? strings.closed
                : strings.inProgress
              : i === 0 && strings.startHere
          return (
            <button
              key={structure.id}
              type="button"
              className={[
                'case-card',
                locked(i) && 'locked',
                i === 0 && !p && 'first',
                i === next && nudge > 0 && 'lit',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ '--i': i } as CSSProperties}
              aria-disabled={locked(i) || undefined}
              onClick={() =>
                locked(i) ? setNudge((n) => n + 1) : openCase(structure.id, p ?? fresh(structure))
              }
            >
              <span className="thumb">
                <img src={picture(structure.id, thumb.picture)} alt="" />
                {locked(i) && (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="5" y="10.5" width="14" height="10" rx="2" />
                    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                  </svg>
                )}
              </span>
              <div>
                <div className="ct">{text.en.title}</div>
                <div className="cs">{text.en.subtitle}</div>
                {status && <div className="done">{status}</div>}
              </div>
            </button>
          )
        })}
      </div>
      <blockquote className="epigraph">
        <p>{strings.epigraph}</p>
        <footer>{strings.epigraphReference}</footer>
      </blockquote>
      <Switches />
      <p className="status">{strings.status}</p>
      <p className="notice">{strings.notice}</p>
      <p className="credit">
        {strings.credit}{' '}
        <a href={strings.creditLicence.href} target="_blank" rel="noreferrer">
          {strings.creditLicence.text}
        </a>
      </p>
      <p className={nudge > 0 ? 'nudge toast' : 'nudge'} role="status">
        {nudge > 0 &&
          (next > 0 ? strings.playFirst(cases[next].text.en.title) : strings.startWithTheValley)}
      </p>
      <Music cue="title" />
      {/* Leaving, the title rides over the page until its last card has risen. */}
      {title === 'leaving' && <Title leaving onBegin={begin} />}
    </main>
  )
}
