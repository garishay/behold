/**
 * The player's model (#6): a case's progress and the moves on it, ported from the prototype's
 * logic and keyed by the structure's ids. Pure functions over `Progress` and the structure — no
 * rendering, no text — so the rules of the game are tested here and the screens only draw them.
 */
import type { CaseStructure, Kind, Spot, Until } from '../cases/types.ts'

/** What the player has found, placed, and filled in a case; kept between visits. */
export interface Progress {
  /** The moment on the stage. */
  readonly moment: string
  /** The spots tapped so far. */
  readonly tapped: readonly string[]
  /** The words found, in the order found. */
  readonly bank: readonly string[]
  /** The papers opened, in the order opened. */
  readonly papers: readonly string[]
  /** Face id → the name word placed under it. */
  readonly faces: Readonly<Record<string, string>>
  /** The moments placed first to last; a slot not yet filled is null. */
  readonly order: readonly (string | null)[]
  /** Blank id → the word filled in. */
  readonly fills: Readonly<Record<string, string>>
  /** The tutorial's current step. */
  readonly step: number
  readonly solved: boolean
}

/** What the player has picked up and not yet put down: a word or a moment, and the slot waiting for one. */
export interface Selection {
  readonly word: string | null
  readonly moment: string | null
  /** A face or blank id. */
  readonly target: string | null
  /** An order slot's index. */
  readonly slot: number | null
}

export const nothing: Selection = { word: null, moment: null, target: null, slot: null }

/** A move's result: the progress and selection after it, and the kind a blank refused, if one did. */
export interface Outcome {
  readonly progress: Progress
  readonly selection: Selection
  readonly wants?: Kind
}

export const fresh = (s: CaseStructure): Progress => ({
  moment: s.moments[0].id,
  tapped: [],
  bank: [],
  papers: [],
  faces: {},
  order: (s.order ?? []).map(() => null),
  fills: {},
  step: 0,
  solved: false,
})

export const guided = (s: CaseStructure) => (s.steps?.length ?? 0) > 0

const spots = (s: CaseStructure): readonly Spot[] => s.moments.flatMap((m) => m.spots)
const face = (s: CaseStructure, id: string) => s.faces.find((f) => f.id === id)
const blanks = (s: CaseStructure) => s.blocks.flatMap((b) => Object.entries(b.blanks))

/** The word that answers a face or a blank. */
export const answer = (s: CaseStructure, target: string): string | undefined =>
  face(s, target)?.answer ?? blanks(s).find(([id]) => id === target)?.[1]

/** The kind a slot takes: a face takes a name, a blank its answer's kind. */
export const kindOf = (s: CaseStructure, target: string): Kind | undefined => {
  const a = answer(s, target)
  return face(s, target) ? 'name' : a === undefined ? undefined : s.words[a]
}

/** How many things the case asks for: the faces, the order as one, and the blanks. */
export const total = (s: CaseStructure) => s.faces.length + (s.order ? 1 : 0) + blanks(s).length

export const filled = (s: CaseStructure, p: Progress) =>
  s.faces.filter((f) => p.faces[f.id]).length +
  (s.order && p.order.every((m) => m !== null) ? 1 : 0) +
  blanks(s).filter(([id]) => p.fills[id]).length

export const wrong = (s: CaseStructure, p: Progress) =>
  s.faces.filter((f) => p.faces[f.id] !== f.answer).length +
  (s.order && s.order.some((m, i) => p.order[i] !== m) ? 1 : 0) +
  blanks(s).filter(([id, a]) => p.fills[id] !== a).length

/** The tutorial's current step, or none when the case has no steps or is solved. */
export const step = (s: CaseStructure, p: Progress) =>
  guided(s) && !p.solved ? s.steps?.[p.step] : undefined

/** Whether the current step waits on Think — a face or a blank filled. */
export const thinkStep = (s: CaseStructure, p: Progress) => step(s, p)?.until?.filled !== undefined

const met = (s: CaseStructure, p: Progress, until: Until) =>
  until.tapped !== undefined
    ? p.tapped.includes(until.tapped)
    : (p.faces[until.filled] ?? p.fills[until.filled]) === answer(s, until.filled)

/** The steps moved past every met `until`; a guided case closes itself when all is right. */
function advance(s: CaseStructure, p: Progress): Progress {
  if (!guided(s)) return p
  const steps = s.steps ?? []
  let at = p.step
  while (at < steps.length - 1 && met(s, p, steps[at].until as Until)) at++
  const solved = p.solved || (filled(s, p) === total(s) && wrong(s, p) === 0)
  return { ...p, step: at, solved }
}

/** A spot tapped: its words join the bank, its paper the papers; what was new is returned. */
export function tap(s: CaseStructure, p: Progress, spotId: string) {
  const spot = spots(s).find((x) => x.id === spotId)
  if (!spot) return { progress: p, added: [] as readonly string[] }
  const added = spot.words.filter((w) => !p.bank.includes(w))
  const paper = spot.paper !== undefined && !p.papers.includes(spot.paper) ? [spot.paper] : []
  const tapped = p.tapped.includes(spotId) ? p.tapped : [...p.tapped, spotId]
  const next = { ...p, tapped, bank: [...p.bank, ...added], papers: [...p.papers, ...paper] }
  return { progress: advance(s, next), added }
}

const put = (s: CaseStructure, p: Progress, target: string, word: string | undefined) => {
  const store = face(s, target) ? 'faces' : 'fills'
  const entries = Object.entries(p[store]).filter(([id]) => id !== target)
  if (word !== undefined) entries.push([target, word])
  return advance(s, { ...p, [store]: Object.fromEntries(entries) })
}

/** A word chip tapped: it fills the waiting slot if the kind fits, or becomes the selection. */
export function chooseWord(s: CaseStructure, p: Progress, sel: Selection, word: string): Outcome {
  const kind = sel.target === null ? undefined : kindOf(s, sel.target)
  if (sel.target !== null && kind !== undefined && s.words[word] !== kind)
    return { progress: p, selection: { ...nothing, word }, wants: kind }
  if (sel.target !== null) return { progress: put(s, p, sel.target, word), selection: nothing }
  return { progress: p, selection: { ...nothing, word: sel.word === word ? null : word } }
}

/** A face or blank tapped: takes the selected word if the kind fits, empties itself, or waits. */
export function chooseSlot(s: CaseStructure, p: Progress, sel: Selection, target: string): Outcome {
  const kind = kindOf(s, target)
  if (sel.word !== null && s.words[sel.word] !== kind)
    return { progress: p, selection: sel, wants: kind }
  if (sel.word !== null) return { progress: put(s, p, target, sel.word), selection: nothing }
  if (p.faces[target] ?? p.fills[target])
    return { progress: put(s, p, target, undefined), selection: nothing }
  return { progress: p, selection: { ...nothing, target: sel.target === target ? null : target } }
}

const placeMoment = (s: CaseStructure, p: Progress, index: number, moment: string | null) =>
  advance(s, {
    ...p,
    order: p.order.map((m, i) => (i === index ? moment : m === moment ? null : m)),
  })

/** A moment tile tapped: it fills the waiting order slot, or becomes the selection. */
export function chooseMoment(
  s: CaseStructure,
  p: Progress,
  sel: Selection,
  moment: string,
): Outcome {
  if (sel.slot !== null)
    return { progress: placeMoment(s, p, sel.slot, moment), selection: nothing }
  return { progress: p, selection: { ...nothing, moment: sel.moment === moment ? null : moment } }
}

/** An order slot tapped: takes the selected moment, empties itself, or waits. */
export function chooseOrderSlot(
  s: CaseStructure,
  p: Progress,
  sel: Selection,
  index: number,
): Outcome {
  if (sel.moment !== null)
    return { progress: placeMoment(s, p, index, sel.moment), selection: nothing }
  if (p.order[index] !== null)
    return { progress: placeMoment(s, p, index, null), selection: nothing }
  return { progress: p, selection: { ...nothing, slot: sel.slot === index ? null : index } }
}

/**
 * The case closed on the player's word: solved when nothing is wrong, else unchanged — the screen
 * says how far off.
 */
export function submit(s: CaseStructure, p: Progress): Progress {
  return wrong(s, p) === 0 ? { ...p, solved: true } : p
}
