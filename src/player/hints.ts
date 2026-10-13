/**
 * Hints (#29): offered when the game sees a player stuck, never lit before, and each tier asked
 * for. A hint points at evidence and never gives the word: first where to look, the half of the
 * picture that holds it, then the thing itself, ringed. Pure functions over the structure and
 * progress, as the model's are; the case screen keeps the signals and shows the mark.
 */
import type { Box, CaseStructure, CaseText, Kind, Spot } from '../cases/types.ts'
import { drawOrder } from '../cases/spots.ts'
import { strings } from '../strings/en.ts'
import { kindOf, type Progress } from './state.ts'

/**
 * When a hint is offered: after this many taps on the picture that find nothing new while
 * something is still unfound, this many seconds on a moment with something left and nothing new
 * found, this many seconds on Solve with nothing left to place, or this many failed closes. The
 * playtests tune these numbers, and nothing else moves with them.
 */
export const stuck = { taps: 6, seconds: 90, stranded: 30, closes: 2 } as const

/** A hint's tier: 1, where to look; 2, the thing itself. */
export type Tier = Progress['hints'][number]

/**
 * What a hint points at: a spot still unfound, one that yields a word a stranded player is
 * missing, a spot whose caption or paper settles one of the player's answers, and which answer it
 * settles (#102), or Close the case, which says how far off they are.
 */
export type Aim =
  | { readonly spot: string; readonly why: 'unfound' | 'stranded'; readonly for?: never }
  | { readonly spot: string; readonly why: 'evidence'; readonly for: string }
  | { readonly spot?: never; readonly why: 'close' }

/**
 * The kinds a stranded player is missing (#65): words have been found and placed, something is
 * still empty, and nothing is left to place, since no empty face or blank has a word of its kind
 * in the bank that isn't placed already. A word may sit in more than one slot, so a placed word
 * doesn't count as left. None while anything empty can still take a word, or before any word is
 * found, when the bank itself says to tap the picture (#24).
 */
export function stranded(s: CaseStructure, p: Progress): ReadonlySet<Kind> {
  const placed = new Set([...Object.values(p.faces), ...Object.values(p.fills)])
  const loose = new Set(p.bank.filter((w) => !placed.has(w)).map((w) => s.words[w]))
  const ids = [...s.faces.map((f) => f.id), ...s.blocks.flatMap((b) => Object.keys(b.blanks))]
  const empty = ids.filter((id) => !(p.faces[id] ?? p.fills[id])).map((id) => kindOf(s, id)!)
  return new Set(p.bank.length === 0 || empty.some((k) => loose.has(k)) ? [] : empty)
}

/**
 * Each face, place in the order, and blank, as Solve shows them: its id — a place's is the moment
 * that belongs there — what the player put in it, and its answer.
 */
const things = (s: CaseStructure, p: Progress) => [
  ...s.faces.map((f) => [f.id, p.faces[f.id], f.answer] as const),
  ...(s.order ?? []).map((m, i) => [m, p.order[i], m] as const),
  ...s.blocks.flatMap((b) =>
    Object.entries(b.blanks).map(([id, a]) => [id, p.fills[id], a] as const),
  ),
]

/** The first thing a close found wrong, as Solve shows them: a close's hint points at its evidence. */
export const firstWrong = (s: CaseStructure, p: Progress) =>
  things(s, p).find(([, put, answer]) => put !== answer)?.[0]

/**
 * Whether a thing settles an answer a failed close found wrong, kept as `at` (#123): it is the
 * thing a hint would ring for it, or, for a face or a blank, its found words give the right word;
 * for the order, it dates a picture out of place. Opening it pays the look the close owes.
 */
export function settles(s: CaseStructure, at: Progress, spot: string) {
  const words = s.moments.flatMap((m) => m.spots).find((x) => x.id === spot)?.words ?? []
  return things(s, at).some(
    ([id, put, answer]) =>
      put !== answer &&
      (s.evidence[id] === spot || (!s.order?.includes(id) && words.includes(answer))),
  )
}

/** Where an answer sits in Solve's order: the faces, then the order as one, then the blanks. */
const rank = (s: CaseStructure, id: string | null) =>
  id === null
    ? -1
    : [
        ...s.faces.map((f) => f.id),
        'order',
        ...s.blocks.flatMap((b) => Object.keys(b.blanks)),
      ].indexOf(s.order?.includes(id) ? 'order' : id)

/**
 * Whether an answer a failed close found wrong, kept as `at`, still holds what it found, so a hint
 * can say it doesn't fit (#123): a face or a blank its word, the order every place.
 */
export function holds(s: CaseStructure, at: Progress, p: Progress, id: string) {
  const [, put, answer] = things(s, at).find(([x]) => x === id) ?? []
  const kept = s.order?.includes(id)
    ? p.order.join() === at.order.join()
    : put === (p.faces[id] ?? p.fills[id])
  return put !== answer && kept
}

/**
 * The answer the next hint after a failed close names (#123): the first, after the one the last
 * hint named and round again, of those the close found wrong, the order as one by its first place
 * out of order. They are kept from the close, as A4 keeps a close's aim (#29), so a changed answer
 * can't ask the hints what is right.
 */
export function next(s: CaseStructure, at: Progress, last: string | null) {
  const order = s.order?.find((m, i) => at.order[i] !== m)
  const found = things(s, at)
    .filter(([id, put, answer]) => put !== answer && (!s.order?.includes(id) || id === order))
    .map(([id]) => id)
  return found.find((id) => rank(s, id) > rank(s, last)) ?? found[0]
}

/**
 * How a hint names the answer it is for (#102), and the reveal a miss (#107): a face by its line,
 * a blank by the three words before it in its sentence, or after it when it opens one, and the
 * order, which a hint asks about by one of its moments, as the order, and the reveal, whose line
 * gives the answer after it, by its question (#118).
 */
export function named(s: CaseStructure, text: CaseText<CaseStructure>, id: string) {
  if (s.faces.some((f) => f.id === id)) return text.faces[id]
  if (s.order?.includes(id)) return strings.theOrder
  if (id === 'order') return strings.whatHappenedFirst
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

/**
 * What the next hint points at. After a failed close, the evidence for the first thing it found
 * wrong, `missed`, kept from that close so a changed answer can't ask the hints what is right.
 * Otherwise the smallest spot still unfound, on the moment on stage first, and for a stranded
 * player the smallest that yields a word they are missing; then the evidence for the first thing
 * still empty; and once everything is filled, Close the case.
 */
export function aim(s: CaseStructure, p: Progress, missed: string | null): Aim {
  if (missed !== null) return { spot: s.evidence[missed], why: 'evidence', for: missed }
  const need = stranded(s, p)
  const wanted = (x: Spot) => need.size === 0 || x.words.some((w) => need.has(s.words[w]))
  const left = (m: CaseStructure['moments'][number]) =>
    m.spots.filter((x) => !p.tapped.includes(x.id) && wanted(x))
  const stage = s.moments.filter((m) => m.id === p.moment)
  const moment = [...stage, ...s.moments].find((m) => left(m).length > 0)
  const why = need.size > 0 ? 'stranded' : 'unfound'
  if (moment !== undefined) return { spot: drawOrder(left(moment)).at(-1)!.id, why }
  const empty = things(s, p).find(([, put]) => !put)?.[0]
  if (empty === undefined) return { why: 'close' }
  return { spot: s.evidence[empty], why: 'evidence', for: empty }
}

/**
 * The half of the picture a box lies in, split across the midline its middle lies farther from,
 * and grown past that midline where the box crosses it, so tier 1's ring holds its whole thing
 * (A3 as ruled): the battle's horns held overhead, the mountain's burning stones.
 */
export function half([l, t, w, h]: Box): Box {
  const [x, y] = [l + w / 2 - 50, t + h / 2 - 50]
  const [L, T, W, H]: Box =
    Math.abs(x) >= Math.abs(y) ? [x < 0 ? 0 : 50, 0, 50, 100] : [0, y < 0 ? 0 : 50, 100, 50]
  const [left, top] = [Math.min(L, l), Math.min(T, t)]
  return [left, top, Math.max(L + W, l + w) - left, Math.max(T + H, t + h) - top]
}

/**
 * Whether the half that holds a box takes most of the picture, over 60% of it, as the valley's
 * giant's takes 80%: such a ring narrows little, so a hint there starts at its second tier, the
 * thing itself (#102, ruling [1]).
 */
export const broad = (box: Box) => {
  const [, , w, h] = half(box)
  return w * h > 6000
}
