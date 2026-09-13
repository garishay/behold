import type { CaseStructure, CaseText } from './types.ts'
import { valley } from './valley/case.ts'
import { en } from './valley/en.ts'
import type { vineyard } from './vineyard/case.ts'
import { en as vineyardEn } from './vineyard/en.ts'

/*
 * Five shapes the format refuses, held by `tsc -b` (Gate 02 A1): each marked line fails the
 * typecheck today, and if the types ever let one through, the unused expect-error fails it
 * instead. A type test, so it sits outside Vitest's `*.test.ts` glob and nothing imports it.
 */

// A caption dropped: a missing key.
const captions: Omit<typeof en.captions, 'armor'> = en.captions
// @ts-expect-error: the text must carry a caption for every spot
export const missing = { ...en, captions } satisfies CaseText<typeof valley>

// A word the structure never declared: an extra key.
export const extra = {
  ...en,
  // @ts-expect-error: the text may name only the structure's words
  words: { ...en.words, bread: 'bread' },
} satisfies CaseText<typeof valley>

// A part naming a blank its block does not have.
export const blank = {
  ...en,
  // @ts-expect-error: a part's blank must be one of the block's
  blocks: { account: { heading: 'The account', parts: [{ b: 't9' }] } },
} satisfies CaseText<typeof valley>

// Step text for a case whose structure has no steps.
export const steps = {
  ...vineyardEn,
  // @ts-expect-error: a case without steps has no step text
  steps: { step1: 'Tap the seal.' },
} satisfies CaseText<typeof vineyard>

// A kind the format does not have.
export const kind = {
  ...valley,
  // @ts-expect-error: a word's kind is name, noun, action, or number
  words: { ...valley.words, sling: 'verb' },
} as const satisfies CaseStructure
