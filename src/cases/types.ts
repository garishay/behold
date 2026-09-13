/**
 * The case file format (Gate 02, #4). A case is a folder, `src/cases/<id>/`, holding two kinds of
 * file: the structure, `case.ts` — ids, boxes, answers, kinds, references, and no sentence — and
 * one text file per language, `en.ts`, every word the player reads keyed by the structure's ids
 * (CLAUDE.md, Guardrails). The text's type is computed from the structure, so a missing or an
 * extra key fails the typecheck; what types cannot hold — a reference resolving, a word reachable,
 * a count — is the validator's, `validate.ts`. The reference is `docs/case-file.md`.
 */

/** The kinds a word can be; a blank takes only its own kind. */
export type Kind = 'name' | 'noun' | 'action' | 'number'

/** The languages a case has text in. */
export type Language = 'en'

/** Left, top, width, height — percent of the picture. */
export type Box = readonly [number, number, number, number]

/** A tappable thing: the words it yields, the face it shows, the paper it opens, the verses that name it. */
export interface Spot {
  readonly id: string
  readonly box: Box
  readonly words: readonly string[]
  readonly person?: string
  readonly paper?: string
  /**
   * The verses that name the thing, within the case's passages: `17:40` or `17:38-39`, with the
   * book in front (`1KI 21:1`) when the passages span more than one book (Gate 02 ruling [1]).
   */
  readonly cites?: string
}

/** One picture of the case: its file under `public/cases/<case>/`, its pixel size, its spots. */
export interface Moment {
  readonly id: string
  readonly picture: string
  readonly size: readonly [number, number]
  readonly spots: readonly Spot[]
}

/** A who-is-who slot: a portrait in the case's folder, and the name word that answers it. */
export interface Face {
  readonly id: string
  readonly picture: string
  readonly answer: string
}

/** A prose block with blanks; each blank names the word that fills it. */
export interface Block {
  readonly id: string
  readonly blanks: Readonly<Record<string, string>>
}

/** What ends a tutorial step: a spot tapped, or a face or blank filled with its answer — one or the other. */
export type Until =
  | { readonly tapped: string; readonly filled?: never }
  | { readonly filled: string; readonly tapped?: never }

/** A tutorial step; the last has no `until` and stays until the case closes. */
export interface Step {
  readonly id: string
  readonly until?: Until
}

/** Verses within one chapter, by USFM book code; without `from` and `to`, the whole chapter. */
export interface Passage {
  readonly book: string
  readonly chapter: number
  readonly from?: number
  readonly to?: number
}

/** The structure of a case: what the player can tap, find, place, and order — and nothing to read. */
export interface CaseStructure {
  readonly id: string
  readonly thumb: string
  readonly passages: readonly Passage[]
  readonly moments: readonly Moment[]
  readonly words: Readonly<Record<string, Kind>>
  readonly faces: readonly Face[]
  readonly order?: readonly string[]
  readonly blocks: readonly Block[]
  readonly steps?: readonly Step[]
}

type SpotOf<S extends CaseStructure> = S['moments'][number]['spots'][number]
type Labels<P extends readonly unknown[]> = { readonly [K in keyof P]: string }

/**
 * The paper ids: those the spots declare — a spot literal without `paper` has no such key to
 * index, so they are read off the spots that carry one — or every string for the base structure.
 */
type PaperIds<S extends CaseStructure> = string extends SpotOf<S>['id']
  ? string
  : SpotOf<S> extends infer P
    ? P extends { readonly paper: infer Id extends string }
      ? Id
      : never
    : never

/**
 * A section keyed by the structure's ids — and, with no ids, one that refuses every key, where
 * `Record<never, V>` is `{}` and takes any (review round 1, #16).
 */
type Keyed<K extends string, V> = [K] extends [never]
  ? { readonly [key: string]: never }
  : Readonly<Record<K, V>>

/** A run of text, or one of the block's blanks, in this language's own order — never both. */
export type Part<B extends string> =
  { readonly t: string; readonly b?: never } | { readonly b: B; readonly t?: never }

/** A case's text in one language, keyed by the structure's ids. */
export type CaseText<S extends CaseStructure> = {
  readonly title: string
  readonly subtitle: string
  readonly brief: string
  readonly passages: Labels<S['passages']>
  readonly moments: Keyed<S['moments'][number]['id'], string>
  readonly captions: Keyed<SpotOf<S>['id'], string>
  readonly words: Keyed<keyof S['words'] & string, string>
  readonly faces: Keyed<S['faces'][number]['id'], string>
  readonly papers: Keyed<PaperIds<S>, { readonly title: string; readonly body: string }>
  readonly blocks: [S['blocks'][number]] extends [never]
    ? { readonly [block: string]: never }
    : {
        readonly [B in S['blocks'][number] as B['id']]: {
          readonly heading: string
          readonly parts: readonly Part<keyof B['blanks'] & string>[]
        }
      }
  readonly reveal: readonly string[]
} & (S extends { readonly steps: infer T extends readonly Step[] }
  ? { readonly steps: Keyed<T[number]['id'], string> }
  : CaseStructure extends S
    ? { readonly steps?: Readonly<Record<string, string>> }
    : { readonly steps?: never })
