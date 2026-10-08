import { useEffect, useState } from 'react'
import type { CaseStructure, CaseText, Passage } from '../cases/types.ts'
import { parseCite, type Cite } from '../cases/validate.ts'
import type { PassageService, PassageText, Translation } from '../passages/service.ts'
import { strings } from '../strings/en.ts'
import { named } from './hints.ts'
import { answer } from './state.ts'

/** The translation the reveal reads; one today (#3). */
const translation: Translation = 'ESV'
/** How many misses lead the reveal before its story; the rest wait under a button (#107). */
const leading = 3

interface RevealProps {
  structure: CaseStructure
  text: CaseText<CaseStructure>
  passages: PassageService
  onBack: () => void
  /** The hints the case took: said once, without judgment, and not at all for none (#29). */
  hints: number
  /** What the failed closes found wrong, by answer, with what was put there (#107). */
  misses: Readonly<Record<string, readonly string[]>>
}

/** Whether a passage holds a cite's verses. */
const holds = (p: Passage, c: Cite) =>
  (c.book ?? p.book) === p.book &&
  p.chapter === c.chapter &&
  c.from >= (p.from ?? 1) &&
  c.to <= (p.to ?? Infinity)

/**
 * The reveal (#6): what the closes found wrong, if anything, each answer with what was put there
 * and a link to the verse that says it (#107); the case told in the game's words; then the passage
 * itself, each range fetched through the service at display time — never from the bundle — under
 * the label the text file gives it, and beneath them the translation's notice with its link, as
 * its conditions of use ask of every page that shows its text (#3).
 */
export function Reveal({ structure: s, text, passages, onBack, hints, misses }: RevealProps) {
  const [all, setAll] = useState(false)
  // The verse a miss's link asked for, and the ask's count, so each tap brings it into view.
  const [cited, setCited] = useState<{ cite: Cite; n: number } | null>(null)
  useEffect(() => {
    if (cited === null) return
    const at =
      document.querySelector('.passage .is-cited') ?? document.querySelector('.passage.holds')
    const motion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    at?.scrollIntoView({ block: 'center', behavior: motion })
  }, [cited])
  // The misses, the most tried first, then in Solve's order: the faces, the order, the blanks.
  const solve = [
    ...s.faces.map((f) => f.id),
    'order',
    ...s.blocks.flatMap((b) => Object.keys(b.blanks)),
  ]
  const moments = (ids: readonly string[]) => ids.map((m) => text.moments[m])
  const lines = Object.entries(misses)
    .sort(([a, x], [b, y]) => y.length - x.length || solve.indexOf(a) - solve.indexOf(b))
    .map(([id, puts]) => {
      const order = id === 'order' ? s.order : undefined
      const told = order ? strings.inTurn(moments(order)) : text.words[answer(s, id) ?? '']
      const put = order
        ? [strings.inOrder(moments(puts[0].split(' ')))]
        : puts.map((w) => text.words[w])
      const verse = s.verses[order?.[0] ?? id]
      return { id, line: strings.missed(named(s, text, id), told, put), verse }
    })
  const shown = all ? lines : lines.slice(0, leading)
  const cite = (verse: string) => {
    const c = parseCite(verse)
    if (c) setCited({ cite: c, n: (cited?.n ?? 0) + 1 })
  }
  return (
    <div className="reveal">
      <h2>{strings.caseClosed}</h2>
      {hints > 0 && <p className="hints-used">{strings.hintsUsed(hints)}</p>}
      {lines.length > 0 && (
        <section className="missed">
          <h3>{strings.secondLook}</h3>
          <ul>
            {shown.map(({ id, line, verse }) => (
              <li key={id}>
                {line}{' '}
                <button
                  type="button"
                  className="verse"
                  aria-label={strings.readVerse(verse.replace('-', '–'))}
                  onClick={() => cite(verse)}
                >
                  {verse.replace('-', '–')}
                </button>
              </li>
            ))}
          </ul>
          {lines.length > shown.length && (
            <button type="button" className="more" onClick={() => setAll(true)}>
              {strings.moreMissed(lines.length - shown.length)}
            </button>
          )}
        </section>
      )}
      {text.reveal.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
      <h2>{strings.readWhatHappened}</h2>
      {s.passages.map((passage, i) => (
        <PassageBlock
          key={i}
          passage={passage}
          label={text.passages[i]}
          service={passages}
          cited={cited && holds(passage, cited.cite) ? cited.cite : undefined}
        />
      ))}
      <p className="attribution">
        {strings.notice}{' '}
        <a href={strings.esvLink.href} target="_blank" rel="noreferrer">
          {strings.esvLink.text}
        </a>
      </p>
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
  /** The verses a miss's link asked for, where this passage holds them (#107). */
  cited?: Cite
}

type Loaded = 'loading' | 'failed' | PassageText

/**
 * One passage under its label, marked with its translation: loading, the verses as the service
 * returns them — a number set as a superscript only when the verse carries one (Gate 03 [2]), and
 * the verses a miss's link asked for marked (#107) — or the line for a service that could not
 * answer.
 */
function PassageBlock({ passage, label, service, cited }: PassageBlockProps) {
  const [state, setState] = useState<Loaded>('loading')
  useEffect(() => {
    let live = true
    service(passage, translation).then(
      (t) => live && setState(t),
      () => live && setState('failed'),
    )
    return () => {
      live = false
    }
  }, [passage, service])
  const marked = (n?: number) => cited && n !== undefined && n >= cited.from && n <= cited.to
  return (
    <section className={'passage' + (cited ? ' holds' : '')}>
      <h3>
        {label} <span className="tr">{strings.translations[translation]}</span>
      </h3>
      {state === 'loading' ? (
        <p className="muted">{strings.loadingPassage(label)}</p>
      ) : state === 'failed' ? (
        <p className="muted">{strings.passageUnavailable(label)}</p>
      ) : (
        state.verses.map((v, i) => (
          <p key={i} className={marked(v.number) ? 'is-cited' : undefined}>
            {v.number !== undefined && <sup>{v.number}</sup>}
            {v.text}
          </p>
        ))
      )}
    </section>
  )
}
