import type { Name } from './counted.ts'
import { isOn, subscribe } from './sound/settings.ts'

/**
 * The beacon (#7): how the game is played, counted, and never who plays it. A count is a name for
 * what happened (`counted.ts`), the case it happened in, and one detail from a few, so it says
 * nothing that many players don't say too:
 *
 * - `open`: the game opened, `new` with no case begun on the device, or `back`;
 * - `begin`: Begin, tapped on the title;
 * - `case`: a case opened from its card, `new`, `back` to one begun, or `closed`, on its reveal;
 * - `step`: a tutorial step done, its number and the time since the step before or the case opened;
 * - `solve`: Solve first opened in a visit to a case, the time since it opened and the share found;
 * - `look`: Look opened from Solve, after a `failed` close, with a slot `empty`, or with all `full`;
 * - `close`: Close the case, how many answers didn't fit, or `closed` with the hints the case took;
 * - `hint`: a hint given, its tier and what offered it: a signal, the `menu`, or the tier before;
 * - `aim`: the thing a new hint points at, by its id in the case, or `close`;
 * - `away`: the game put away in a case still open, its view and the shares found and filled;
 * - `restart`: Start over, answered to Restart's question.
 *
 * The game adds them up while it is on screen, and when it is hidden (put away, switched from, or
 * closed) it sends what it has added up as one beacon to the count service (`counts/`), which adds
 * it to the day's totals, and starts again from nothing. Nothing in a beacon names the player, the
 * device, or the visit, and the device keeps nothing for it but Counting's switch, on About. Off,
 * nothing is counted, and what wasn't sent yet is dropped.
 */

/** The count service, or a dev shell's own; the dev server and the tests send nothing unless told. */
const service = () =>
  import.meta.env.VITE_COUNTS_URL ??
  (import.meta.env.DEV ? undefined : 'https://behold-counts.garishay.workers.dev')

/** What has been counted since the last beacon, each count once with how many. */
const tally = new Map<string, [Name, string, string, number]>()
/** What a case on screen counts as the game is put away: where it stands. */
const leaving = new Set<() => void>()

/** One more of a count: what happened, the case it happened in, and its detail. */
export function count(name: Name, at = '', detail = '') {
  if (!isOn('counting')) return
  const key = `${name} ${at} ${detail}`
  const kept = tally.get(key)
  if (kept) kept[3]++
  else tally.set(key, [name, at, detail, 1])
}

/** Runs `fn` each time the game is put away, before its beacon goes, until the returned function is called. */
export function whenAway(fn: () => void) {
  leaving.add(fn)
  return () => {
    leaving.delete(fn)
  }
}

/** The game put away: what it counted goes as one beacon, and the count starts over. */
export function away() {
  for (const fn of leaving) fn()
  const to = service()
  if (to !== undefined && tally.size > 0)
    navigator.sendBeacon(`${to}/count`, JSON.stringify([...tally.values()]))
  tally.clear()
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) away()
})
// Counting turned off drops what wasn't sent yet.
subscribe(() => {
  if (!isOn('counting')) tally.clear()
})

/**
 * The time since `start`, from `performance.now()`, as a count says it: under 30 seconds, or under
 * 1, 2, or 5 minutes, or longer.
 */
export function since(start: number) {
  const ms = performance.now() - start
  return ms < 30e3 ? '<30s' : ms < 60e3 ? '<1m' : ms < 120e3 ? '<2m' : ms < 300e3 ? '<5m' : '5m+'
}

/** A share as a count says it: none, some, half or more, or all. */
export const share = (n: number, of: number) =>
  n === 0 ? 'none' : n >= of ? 'all' : 2 * n >= of ? 'half' : 'some'

/** A number as a count says it: 0, 1, 2, or 3 and more. */
export const few = (n: number) => (n > 2 ? '3+' : String(n))
