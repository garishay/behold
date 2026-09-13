# The case file format

The shape a case is authored in and the app loads (Gate 02, #4). A case is a folder under
`src/cases/`, named by the case's id, holding two kinds of file — the **structure**, `case.ts`, and
one **text** file per language, `en.ts` — with its pictures under `public/cases/<id>/`. The
structure carries ids, boxes, answers, kinds, and references, and no sentence; the text carries
every word the player reads for the case, keyed by the structure's ids. Nothing the player reads
lives in code, and scripture is never in either file: the reveal fetches it by reference
(`CLAUDE.md`, Guardrails).

The two prototype cases, the tutorial (`valley`) and case two (`vineyard`), are the worked examples;
read them beside this page.

## Where a case lives

```
src/cases/
  types.ts            the format: CaseStructure, and CaseText computed from it
  index.ts            the registry — every case in play order, with its text by language
  valley/
    case.ts           the structure
    en.ts             the English text
  vineyard/
    case.ts
    en.ts
public/cases/
  valley/             valley.jpg, d1.jpg, d2.jpg — the moment picture and the face portraits
  vineyard/           vineyard.jpg, bedchamber.jpg, gate.jpg, p1.jpg, p2.jpg, p3.jpg
```

The structure and the text are modules the player (#6) imports through the registry, so they ship
in the bundle and the case list and every case's words are offline from the first visit. The
pictures are plain files at stable paths, fetched when a case opens and cached by the service
worker from then on (the player's rule, #6).

## The structure — `case.ts`

```ts
export const valley = { … } as const satisfies CaseStructure
```

| field      | what it is                                                                                                                                                                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | the folder's name                                                                                                                                                                                                                                                                                                                  |
| `thumb`    | the moment whose picture is the case card's                                                                                                                                                                                                                                                                                        |
| `passages` | the scripture the reveal shows, in reading order — see _Passages and cites_                                                                                                                                                                                                                                                        |
| `moments`  | the pictures, in the order the player sees them: `id`, `picture` (a file name in the case's picture folder), `size` (the file's pixels, width and height), `spots`                                                                                                                                                                 |
| `spots`    | the tappable things in a moment, one to eight of them: `id`, `box` (left, top, width, height, in percent of the picture), `words` (the word ids a tap yields; may be empty), `person?` (the face this spot shows), `paper?` (the document it opens), `cites?` (the verses that name it)                                            |
| `words`    | word id → kind: `name`, `noun`, `action`, or `number`. A blank takes only its own kind; a face takes a name                                                                                                                                                                                                                        |
| `faces`    | the who-is-who slots: `id`, `picture` (a portrait in the picture folder), `answer` (a name word)                                                                                                                                                                                                                                   |
| `order?`   | the moment ids in true order, present when the case asks what happened first                                                                                                                                                                                                                                                       |
| `blocks`   | the prose with blanks — the account, and the verdict where the case has one: `id`, `blanks` (blank id → the word that fills it)                                                                                                                                                                                                    |
| `steps?`   | the tutorial's steps: `id`, `until?` — `{ tapped: <spot> }` or `{ filled: <face or blank> }`, meaning filled with its answer; the last step has no `until`. A case with steps is played guided, each answer checked as it lands and the case closing itself when all are right; a case without steps closes on the player's submit |

Derived, never stored: a blank's kind is its answer's; a case is the tutorial when it has steps;
the paper ids are those the spots open; a step whose `until` is `filled` is a Think step.

Every string in the structure is an id, a file name, a book code, or a cite. There is no field
that can hold a sentence, so the structure cannot carry player text and cannot carry scripture.

## The text — `en.ts`

```ts
export const en = { … } satisfies CaseText<typeof valley>
```

The type is computed from the structure, so the keys below are exactly the structure's ids.

| field      | what it is                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `title`    | the case card's title                                                                                                                  |
| `subtitle` | the card's second line                                                                                                                 |
| `brief`    | the header line inside the case                                                                                                        |
| `passages` | one label per passage, in the language's own book names — `1 Samuel 17:38–51`                                                          |
| `moments`  | moment id → its name                                                                                                                   |
| `captions` | spot id → what the player reads on a tap                                                                                               |
| `words`    | word id → the word as the word bank shows it                                                                                           |
| `faces`    | face id → the "who" line under the portrait — `the boy`                                                                                |
| `papers`   | paper id → `title` and `body`; a paragraph break is `\n`                                                                               |
| `blocks`   | block id → `heading` and `parts`: runs of text, `{ t: '…' }`, and the block's blanks, `{ b: 't1' }`, in this language's own word order |
| `steps`    | step id → the step's text; only when the structure has steps                                                                           |
| `reveal`   | the paragraphs in the game's words, shown before the passage                                                                           |

That is every string the player reads for a case. What the interface says around it — the tab
names, "Who is who", "Close the case", the kind labels — is app copy in `src/strings/en.ts`.

Captions, papers, and prose are the game's own voice: they paraphrase, and never quote, the
translation (`docs/world-rules.md`, _The text decides_).

## Ids

An id is a slug: `[a-z][a-z0-9-]*`. A word of several words is hyphenated — `face-to-the-wall` —
and the text file gives it its face: `'face to the wall'`. Ids are unique within their kind across
the case; blank ids are unique across all of the case's blocks.

## Passages and cites

A passage is `{ book, chapter, from?, to? }`: the book as its USFM code (`1SA`, `1KI`, `2KI`), the
chapter, and a verse range within it — or the whole chapter when `from` and `to` are absent. The
reveal fetches each passage in order through the proxy (#3), which formats it for the translation;
the app carries no book-name table, and the label the player sees is the text file's.

A spot's `cites` names the verses that put the thing in the picture: `17:40`, or `17:38-39` for a
run of verses, always within one of the case's passages. When a case's passages span more than
one book, every cite carries its book in front — `1KI 21:1` — and when they do not, none does.
The cite is optional: a thing no verse names — the empty chairs at the gate — carries none, and
the reviewer reads it by hand. A document that quotes scripture from outside the passage, as the
vineyard's Law scroll paraphrases Deuteronomy and Leviticus, carries none either; whether every
spot must cite is the authoring gate's rule (#5).

The tutorial's basket is the reason the tutorial has two passages: the loaves and cheeses are
1 Samuel 17:17–18, and the account asks for them, so the reveal shows 17:17–18 before 17:38–51.

## Pictures

A moment's picture and a face's portrait are JPEGs in `public/cases/<id>/`, named as the
structure names them. The structure's `size` is the file's pixel size — the registry test reads
the file's header and holds `size` to it — and boxes are percentages of that picture. Scenes are
portrait, 4:5 (`docs/world-rules.md` §6); the tutorial's valley is the prototype's 3:4 and stays
so for testing, per §8. A tappable thing is at most eight to a moment (§6), and nothing that
matters sits in the outer 8% of the width (§7).

## What holds a case to the format

Three layers, from mechanical to read.

1. **The typecheck**, `npm run typecheck`, a required check. The structure's shape, and the text's
   keys against the structure's ids: a missing caption, an extra word, a part naming a blank its
   block lacks, step text for a case without steps, a kind the format lacks — each fails the
   typecheck. `src/cases/types.test-d.ts` holds those five shapes under `@ts-expect-error`.
2. **The validator**, `src/cases/validate.ts`: `validate(structure, text)`, run by `npm run test`
   over every registered case in each of its languages; one sentence per problem, an empty list a
   valid case, and a problem names the thing by its id —
   `spot "basket" cites "17:17-18", outside the passages`. What it holds: ids are slugs and unique
   within their kind; `thumb` is a moment, and each passage is a book code, a chapter, and a verse
   range or none; a moment's picture is a file name, it has one to eight spots, and each spot's
   box lies inside the picture, its words are words, its person a face, its paper a slug, its cite
   within a passage with the book prefix as the passages require; every word is yielded by some
   spot; a face's picture is a file name and its answer a name word; there is at least one block,
   each blank's answer is a word, and each blank appears exactly once in its block's text; an
   order, when present, is the moments in some order; every step but the last has an `until` and
   the last has none, and an `until` names a spot, or a face or a blank; no text is empty —
   whitespace alone is empty, but for a run of text in a block, which may be the space between
   two blanks. `src/cases/validate.test.ts` holds one broken fixture per check, each failing the
   check it names and no other; the registry test, `src/cases/cases.test.ts`, holds the pictures,
   the registry's ids, and the guided case first.
3. **Review**, by reading: every spot named or implied by the passage, with the cites as the
   handle; the game's own voice, never the translation's words; the picture checklist
   (`docs/world-rules.md` §7). These are the authoring gate's (#5).

## Adding a case

1. Make `src/cases/<id>/` with `case.ts` exporting the structure `as const satisfies
CaseStructure`, and `en.ts` exporting the text `satisfies CaseText<typeof <id>>`.
2. Put the pictures in `public/cases/<id>/`, and write each file's pixel size as its `size`.
3. Add the case to `src/cases/index.ts`, in play order.
4. `npm run typecheck` and `npm run test` — the typecheck reads the keys, the tests read the
   pictures and the validator's list.
5. Review the case against its passage and the world rules before it ships.
