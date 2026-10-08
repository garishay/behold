import type { CaseEntry } from '../cases/index.ts'
import type { CaseStructure } from '../cases/types.ts'
import { advance, wrong, type Progress } from './state.ts'

/**
 * Progress kept on the device (#6): one key in localStorage, every case's progress by id, so a
 * case survives the app being closed and the "Update available" reload. Nothing leaves the phone.
 */
const key = 'behold.progress'

export type Saved = Readonly<Record<string, Progress>>

const record = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x)
const ids = (x: unknown): x is string[] => Array.isArray(x) && x.every((s) => typeof s === 'string')
const byId = (x: unknown): x is Record<string, string> =>
  record(x) && Object.values(x).every((s) => typeof s === 'string')

/**
 * Whether a stored value has progress's shape, down to each list's and record's members; a stale
 * or foreign entry is dropped, not trusted (review rounds 1 and 3, #20).
 */
const progress = (v: unknown): v is Progress =>
  record(v) &&
  typeof v.moment === 'string' &&
  [v.tapped, v.bank, v.papers].every(ids) &&
  Array.isArray(v.order) &&
  v.order.every((m) => m === null || typeof m === 'string') &&
  byId(v.faces) &&
  byId(v.fills) &&
  typeof v.step === 'number' &&
  typeof v.solved === 'boolean' &&
  Array.isArray(v.hints) &&
  v.hints.every((t) => t === 1 || t === 2) &&
  record(v.misses) &&
  Object.values(v.misses).every(ids)

/**
 * An entry kept before hints (#29) has used none, and one kept before a close's misses were (#107)
 * has none: each keeps its place.
 */
const withDefaults = (v: unknown) => (record(v) ? { hints: [], misses: {}, ...v } : v)

/**
 * Whether every id an entry holds is the case's — the moment, the spots tapped, the bank, the
 * papers, the faces' and fills' keys and words, the order's moments, and the misses' slots, words,
 * and moments — with the order the case's length and the step one of its steps. The store never
 * trusts an id the case lacks: a case that no longer fits starts fresh (#12 [Q4]).
 */
const fits = (s: CaseStructure, p: Progress) => {
  const spots = s.moments.flatMap((m) => m.spots)
  const has = (list: readonly { readonly id: string }[]) => (id: string) =>
    list.some((x) => x.id === id)
  const word = (id: string) => Object.hasOwn(s.words, id)
  const blanks = s.blocks.flatMap((b) => Object.keys(b.blanks))
  return (
    has(s.moments)(p.moment) &&
    p.tapped.every(has(spots)) &&
    p.bank.every(word) &&
    p.papers.every((id) => spots.some((x) => x.paper === id)) &&
    Object.entries(p.faces).every(([f, w]) => has(s.faces)(f) && word(w)) &&
    Object.entries(p.fills).every(([b, w]) => blanks.includes(b) && word(w)) &&
    p.order.length === (s.order?.length ?? 0) &&
    p.order.every((m) => m === null || has(s.moments)(m)) &&
    Object.entries(p.misses).every(([id, puts]) =>
      id === 'order'
        ? s.order !== undefined && puts.every((o) => o.split(' ').every(has(s.moments)))
        : (has(s.faces)(id) || blanks.includes(id)) && puts.every(word),
    ) &&
    p.step >= 0 &&
    p.step <= Math.max(0, (s.steps?.length ?? 1) - 1)
  )
}

/**
 * Kept progress as it loads. It moves past every step it has met, as a move would, so a step the
 * tutorial gains ahead of the stored one shows only while it is still to do (#77). A closed case
 * that would now find something wrong, its answers changed since it closed, loads unsolved, so its
 * next close checks it again: a guided one lands on its last step with its slots filled, and the
 * valley's close rings what changed (#12 [Q13]).
 */
const restored = (s: CaseStructure, p: Progress) =>
  advance(s, p.solved && wrong(s, p) > 0 ? { ...p, solved: false } : p)

/**
 * The store's progress by case, for the cases registered: a store that is not one, an entry
 * that is not progress, or an entry whose ids its case no longer has, reads as none.
 */
export function load(registry: readonly CaseEntry[]): Saved {
  try {
    const raw = localStorage.getItem(key)
    const parsed: unknown = raw === null ? {} : JSON.parse(raw)
    if (!record(parsed)) return {}
    const entries = Object.entries(parsed).map(([id, v]) => [id, withDefaults(v)] as const)
    const kept = entries.flatMap(([id, v]) => {
      const structure = registry.find((c) => c.structure.id === id)?.structure
      return structure && progress(v) && fits(structure, v) ? [[id, restored(structure, v)]] : []
    })
    return Object.fromEntries(kept)
  } catch {
    return {}
  }
}

export function save(all: Saved) {
  try {
    localStorage.setItem(key, JSON.stringify(all))
  } catch {
    // Storage refused — private mode, or full: progress lives for the session only.
  }
}
