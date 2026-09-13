import type { Progress } from './state.ts'

/**
 * Progress kept on the device (#6): one key in localStorage, every case's progress by id, so a
 * case survives the app being closed and the "Update available" reload. Nothing leaves the phone.
 */
const key = 'behold.progress'

export type Saved = Readonly<Record<string, Progress>>

export function load(): Saved {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? {} : (JSON.parse(raw) as Saved)
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
