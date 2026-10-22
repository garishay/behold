/**
 * What the game counts (#7), by name: the beacon sends no other (`beacon.ts`, where each name's
 * detail is told), and the count service takes no other (`counts/`), which is why this module
 * holds only the names and a beacon's limits, and imports nothing.
 */
export const names = [
  'open',
  'begin',
  'case',
  'step',
  'solve',
  'look',
  'close',
  'hint',
  'aim',
  'away',
  'restart',
] as const

export type Name = (typeof names)[number]

/**
 * The most a beacon may carry: 200 different counts, and 1,000 of one. The service refuses a beacon
 * past either, so no beacon outweighs a long visit, and the game sends its beacon at once on
 * reaching either, so it never sends one the service refuses (#12 [Q36]).
 */
export const most = { counts: 200, each: 1000 } as const
