import { useEffect, useState } from 'react'
import { cases } from './cases/index.ts'
import { picture } from './player/pictures.ts'
import { Player } from './player/Player.tsx'
import { fresh, type Progress } from './player/state.ts'
import { load, save, type Saved } from './player/storage.ts'
import { strings } from './strings/en.ts'

/** The history entry for an open case, so the system's back returns to the cards (Gate 03 [1]). */
interface Entry {
  readonly case: string
}

/** The entry a history state carries, or none: the app's own states hold a case id and nothing else. */
const entry = (state: unknown): Entry | null =>
  typeof state === 'object' && state !== null && 'case' in state && typeof state.case === 'string'
    ? (state as Entry)
    : null

/**
 * The title screen with the cases on it (#6): the masthead, the epigraph and its notice (Gate 01
 * A6), and between them the case cards, each opening its case in the player. Progress is kept on
 * the device and restored on the next visit. An open case is a history entry — no route, no URL —
 * so back returns to the cards, and leaves the app only from them.
 */
export default function App() {
  const [saved, setSaved] = useState<Saved>(() => load(cases))
  const [open, setOpen] = useState<string | null>(() => entry(history.state)?.case ?? null)
  const [restarts, setRestarts] = useState(0)
  useEffect(() => save(saved), [saved])
  useEffect(() => {
    const onPop = (e: PopStateEvent) => setOpen(entry(e.state)?.case ?? null)
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  const openCase = (id: string, progress: Progress) => {
    setSaved({ ...saved, [id]: progress })
    history.pushState({ case: id } satisfies Entry, '')
    setOpen(id)
  }
  // "Cases" pops the case's entry when it is the one on top, so the history stays true to the
  // screen; after a reload into a case the entry is still there to pop.
  const toCases = () => (entry(history.state) ? history.back() : setOpen(null))

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
          set(fresh(found.structure))
          setRestarts(restarts + 1)
        }}
      />
    )
  }
  return (
    <main className="screen">
      <header className="masthead">
        <h1>{strings.title}</h1>
        <p className="kicker">{strings.kicker}</p>
      </header>
      <blockquote className="epigraph">
        <p>{strings.epigraph}</p>
        <footer>{strings.epigraphReference}</footer>
      </blockquote>
      <p className="line">{strings.line}</p>
      <div className="case-list">
        {cases.map(({ structure, text }) => {
          const p = saved[structure.id]
          const thumb =
            structure.moments.find((m) => m.id === structure.thumb) ?? structure.moments[0]
          return (
            <button
              key={structure.id}
              type="button"
              className="case-card"
              onClick={() => openCase(structure.id, p ?? fresh(structure))}
            >
              <img src={picture(structure.id, thumb.picture)} alt="" />
              <div>
                <div className="ct">{text.en.title}</div>
                <div className="cs">{text.en.subtitle}</div>
                {p && <div className="done">{p.solved ? strings.closed : strings.inProgress}</div>}
              </div>
            </button>
          )
        })}
      </div>
      <p className="status">{strings.status}</p>
      <p className="notice">{strings.notice}</p>
    </main>
  )
}
