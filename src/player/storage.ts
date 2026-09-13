import type { Progress } from './state.ts'

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
  typeof v.solved === 'boolean'

/** The store's progress by case; a store that is not one, or an entry that is not progress, reads as none. */
export function load(): Saved {
  try {
    const raw = localStorage.getItem(key)
    const parsed: unknown = raw === null ? {} : JSON.parse(raw)
    if (!record(parsed)) return {}
    return Object.fromEntries(
      Object.entries(parsed).filter((e): e is [string, Progress] => progress(e[1])),
    )
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
