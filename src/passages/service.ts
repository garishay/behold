/**
 * The passage service's contract (#6, for #3): what the reveal asks and what it is given. The
 * Worker (#3) takes a reference and a translation; the app hands it the structure's passage —
 * the USFM book code, the chapter, the verse range — and carries no book-name table. Scripture
 * is fetched, never shipped: nothing implementing this may hold a verse.
 */
import type { Passage } from '../cases/types.ts'

/** The translations the service serves, by the Worker's ids; one today. */
export type Translation = 'ESV'

/** One verse of the reply: its words, and its number when the source gives one. */
export interface Verse {
  readonly number?: number
  readonly text: string
}

/** A passage as the service returns it: its verses in order, parsed by the Worker (Gate 03 [2]). */
export interface PassageText {
  readonly verses: readonly Verse[]
}

/** A reference and a translation in, the passage's verses out; rejects when the service cannot answer. */
export type PassageService = (passage: Passage, translation: Translation) => Promise<PassageText>
