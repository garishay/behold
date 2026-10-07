/**
 * Hints (#29): offered when the game sees a player stuck, never lit before, and each tier asked
 * for. A hint points at evidence and never gives the word: first where to look, the half of the
 * picture that holds it, then the thing itself, ringed. Pure functions over the structure and
 * progress, as the model's are; the case screen keeps the signals and shows the mark.
 */
import type { Box, CaseStructure, Kind, Spot } from '../cases/types.ts'
import { drawOrder } from '../cases/spots.ts'
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
