/**
 * The player's two sound switches, Music and Effects (Gate 10 A4): each on unless the player turned
 * it off, kept on the device beside progress, and read by the switches wherever they are shown.
 */
export type Switch = 'music' | 'effects'

const key = (s: Switch) => `behold.${s}`

const stored = (s: Switch) => {
  try {
    return localStorage.getItem(key(s)) !== 'off'
  } catch {
    return true
  }
}

const state: Record<Switch, boolean> = { music: stored('music'), effects: stored('effects') }
const listeners = new Set<() => void>()

export const isOn = (s: Switch) => state[s]

export function turn(s: Switch, on: boolean) {
  state[s] = on
  try {
    localStorage.setItem(key(s), on ? 'on' : 'off')
  } catch {
    // Storage refused — private mode, or full: the switch holds for the session only.
  }
  for (const listener of listeners) listener()
}

/** Calls `listener` on every change of a switch, until the returned function is called. */
export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
