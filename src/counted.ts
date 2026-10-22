/**
 * What the game counts (#7), by name: the beacon sends no other (`beacon.ts`, where each name's
 * detail is told), and the count service takes no other (`counts/`), which is why this module
 * holds only the names, and imports nothing.
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
