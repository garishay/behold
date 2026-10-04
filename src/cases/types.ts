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

/** The keys an `Until` leaves out: it names one thing, so the others are never there. */
type Without<K extends string> = { readonly [P in K]?: never }

/**
 * What ends a tutorial step, and so where its mark sits (#25): a spot tapped, a face or blank
 * filled with its answer, Solve opened, or every spot of the case found — or everything Solve asks
 * for filled, whichever comes first — whose mark sits on Look's button and leaves Look itself to
 * the caption's prompt; or the dock's line of finds read, whose mark rings the dock whole, the
 * caption with its line, and which the next tap meets (#77). One of the five.
 */
export type Until =
  | ({ readonly tapped: string } & Without<'filled' | 'view' | 'found' | 'read'>)
  | ({ readonly filled: string } & Without<'tapped' | 'view' | 'found' | 'read'>)
  | ({ readonly view: 'solve' } & Without<'tapped' | 'filled' | 'found' | 'read'>)
  | ({ readonly found: 'all' } & Without<'tapped' | 'filled' | 'view' | 'read'>)
  | ({ readonly read: 'found' } & Without<'tapped' | 'filled' | 'view' | 'found'>)

/** A tutorial step; the last has no `until`, marks Close the case, and stays until the case closes. */
export interface Step {
  readonly id: string
  readonly until?: Until
}

/**
 * A case's one new idea, marked on Solve where the player first meets it (docs/case-design.md,
 * rule 6): the order (#30), its pictures ringed and then its slots until a moment is placed; or a
 * face, ringed until a name is placed in it, as the battle's disguised man is (#53).
 */
export type Teach = 'order' | { readonly face: string }

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
  /**
   * The face or blank a guided case asks about on a miss (#77): when a close finds it wrong, the
   * retry rings it, never its word, with the text's `ask`. Once asked, it takes its ✓ when right.
   */
  readonly ask?: string
  /**
   * The case's one new idea, marked where the player first meets it (`Teach`). It is not a step,
   * and the case is not guided by it.
   */
  readonly teach?: Teach
  /**
   * Where a hint points (#29): each face and blank names the spot whose caption or paper settles
   * it, and in a case with an order each moment names one of its own spots, the one that tells
   * when it happened.
   */
  readonly evidence: Readonly<Record<string, string>>
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
  ? // `retry`: the last step's words after a failed close, which say the answers were checked.
    { readonly steps: Keyed<T[number]['id'], string>; readonly retry: string }
  : CaseStructure extends S
    ? { readonly steps?: Readonly<Record<string, string>>; readonly retry?: string }
    : { readonly steps?: never; readonly retry?: never }) &
  (S extends { readonly teach: Teach }
    ? { readonly teach: string }
    : CaseStructure extends S
      ? { readonly teach?: string }
      : { readonly teach?: never }) &
  // `ask`: the question a guided case asks on a miss, at the face or blank its structure names.
  (S extends { readonly ask: string }
    ? { readonly ask: string }
    : CaseStructure extends S
      ? { readonly ask?: string }
      : { readonly ask?: never })
