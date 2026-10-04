# The case file format

The shape a case is authored in and the app loads (Gate 02, #4). A case is a folder under
`src/cases/`, named by the case's id, holding two kinds of file — the **structure**, `case.ts`, and
one **text** file per language, `en.ts` — with its pictures under `public/cases/<id>/`. The
structure carries ids, boxes, answers, kinds, and references, and no sentence; the text carries
every word the player reads for the case, keyed by the structure's ids. Nothing the player reads
lives in code, and scripture is never in either file: the reveal fetches it by reference
(`CLAUDE.md`, Guardrails).

The two prototype cases, the tutorial (`valley`) and case two (`vineyard`), are the worked examples;
read them beside this page. What a case must do to be a puzzle — its blanks, rivals, captions, and
brief — is `docs/case-design.md`.

## Where a case lives

```
src/cases/
  types.ts            the format: CaseStructure, and CaseText computed from it
  index.ts            the registry — every case in play order, with its text by language
  valley/
    case.ts           the structure
    en.ts             the English text
  carmel/
    case.ts
    en.ts
    scenes.md         the scene briefs its pictures are generated from
  vineyard/
    case.ts
    en.ts
  micaiah/
    case.ts
    en.ts
    scenes.md
public/cases/
  valley/             valley.jpg, d1.jpg, d2.jpg — the moment picture and the face portraits
  carmel/             water.jpg, fire.jpg, baal.jpg, c1.jpg, c2.jpg
  vineyard/           vineyard.jpg, bedchamber.jpg, gate.jpg, p1.jpg, p2.jpg, p3.jpg
  micaiah/            battle.jpg, pool.jpg, thrones.jpg, m1.jpg, m2.jpg
```

The structure and the text are modules the player imports through the registry, so they ship in
the bundle and the case list and every case's words are offline from the first visit. The
pictures are plain files at stable paths, fetched when a case opens and cached by the service
worker from then on — the runtime rule in `vite.config.ts` (#6).

## The structure — `case.ts`

```ts
export const valley = { … } as const satisfies CaseStructure
```

| field      | what it is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | the folder's name                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `thumb`    | the moment whose picture is the case card's                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `passages` | the scripture the reveal shows, in reading order — see _Passages and cites_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `moments`  | the pictures, in the order the player sees them: `id`, `picture` (a file name in the case's picture folder), `size` (the file's pixels, width and height), `spots`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `spots`    | the tappable things in a moment, one to eight of them: `id`, `box` (left, top, width, height, in percent of the picture), `words` (the word ids a tap yields; may be empty), `person?` (the face this spot shows), `paper?` (the document it opens), `cites?` (the verses that name it)                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `words`    | word id → kind: `name`, `noun`, `action`, or `number`. A blank takes only its own kind; a face takes a name                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `faces`    | the who-is-who slots: `id`, `picture` (a portrait in the picture folder), `answer` (a name word)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `order?`   | the moment ids in true order, present when the case asks what happened first                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `blocks`   | the prose with blanks — the account, and the verdict where the case has one: `id`, `blanks` (blank id → the word that fills it)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `steps?`   | the tutorial's steps: `id`, `until?` — `{ tapped: <spot> }`, `{ filled: <face or blank> }`, meaning filled with its answer, `{ view: 'solve' }`, or `{ found: 'all' }`, meaning every spot of the case found or everything Solve asks for filled, whichever comes first; the last step has no `until`. A case with steps is played guided: each step is shown as a mark at the target its `until` names — the spot, Solve's button, the answer's word and then its slot, or Look's button, with nothing marked on Look itself, where the caption's prompt says what to do — and the last at Close the case; a step already met is never shown; a ✓ lands only on the faces and blanks its steps name (`docs/case-design.md`, rule 5; #25) |
| `teach?`   | the case's one new idea, marked on Solve where the player first meets it: `'order'`, while the order is empty, rings the pictures to place, then the slots once one is picked (#30); `{ face: <face> }` rings that face while it is empty, as the battle rings its disguised man (#53). It is not a step, and the case is not guided by it (`docs/case-design.md`, rule 6)                                                                                                                                                                                                                                                                                                                                                                |
| `evidence` | where a hint points (#29): each face and blank id → the spot whose caption or paper settles it, and in a case with an order each moment id → one of its own spots, the one that tells when it happened. A hint rings the half of the picture that spot is in, then the spot itself, and never gives the word                                                                                                                                                                                                                                                                                                                                                                                                                              |

Derived, never stored: a blank's kind is its answer's; a case is the tutorial when it has steps;
the paper ids are those the spots open; a step whose `until` is `filled` is a Solve step.

A guided case may name, as `ask`, the face or blank it asks about on a miss (#77): when a close
finds it wrong, the retry is the question, the text's `ask`. It rings that slot and never its
word, and from Look only Solve's button, with no words, leaving the picture clear ([Q11]). Once
asked, the slot takes its ✓ when right. A close wrong elsewhere keeps the retry.

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
| `brief`    | the case's opening question: its card over the picture when a fresh case opens, and the menu's sheet after (#24)                       |
| `passages` | one label per passage, in the language's own book names — `1 Samuel 17:38–51`                                                          |
| `moments`  | moment id → its name                                                                                                                   |
| `captions` | spot id → what the player reads on a tap                                                                                               |
| `words`    | word id → the word as the word bank shows it                                                                                           |
| `faces`    | face id → the "who" line under the portrait — `the boy`                                                                                |
| `papers`   | paper id → `title` and `body`; a paragraph break is `\n`                                                                               |
| `blocks`   | block id → `heading` and `parts`: runs of text, `{ t: '…' }`, and the block's blanks, `{ b: 't1' }`, in this language's own word order |
| `steps`    | step id → the step's words, eight or fewer, beside its mark; only when the structure has steps                                         |
| `retry`    | the last step's words after a failed close, eight or fewer, which say the answers were checked; only when the structure has steps      |
| `ask`      | the question asked on a miss, eight or fewer, beside its mark; only when the structure names `ask`                                     |
| `teach`    | the lesson's words, eight or fewer, beside its mark; only when the structure teaches                                                   |
| `reveal`   | the paragraphs in the game's words, shown before the passage                                                                           |

That is every string the player reads for a case. What the interface says around it — the view
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
The cite is optional for a document that quotes scripture from outside the passage, as the
vineyard's Law scroll paraphrases Deuteronomy and Leviticus: it carries none, and the reviewer
reads it by hand. A thing no verse names at all is not a spot; it stays in the picture as set
dressing (`docs/world-rules.md`, _The text decides_). Whether every spot must cite is the
authoring gate's rule (#5).

The account is the reason the tutorial has three passages: the champion's name and height are
1 Samuel 17:4, and the loaves and cheeses are 17:17–18, and the account asks for both, so the
reveal shows 17:4 and 17:17–18 before 17:38–51.

## Pictures

A moment's picture and a face's portrait are JPEGs in `public/cases/<id>/`, named as the
structure names them. The structure's `size` is the file's pixel size — the registry test reads
the file's header and holds `size` to it — and boxes are percentages of that picture. Scenes are
portrait, 4:5 (`docs/world-rules.md` §6), the tutorial's valley included since its picture was
regenerated (#35). A tappable thing is at most eight to a moment (§6), and nothing that
matters sits in the outer 8% of the width (§7).

A moment's picture is generated from its scene brief (§6, _Describe, then generate_), kept beside
the structure in `src/cases/<id>/scenes.md`: one section per moment, headed by its id, with its
_Scene_, and its _Spots_ each by id and box, with what the spot needs, how large it reads, where it
sits, and what stays clear of it. The generator can't place by percent, so a generation prompt is
§6's style header followed by the Scene and Spots as prose, without ids or boxes; each section
records its prompt as sent, with its attachments and edits, verbatim (#30). The registry test
holds every spot to its moment's brief, box and all, so a box re-fitted to a new picture re-writes
its line. The vineyard's bedchamber and gate were drawn before the rule, and their briefs are
written from the pictures as they stand (#33).

A picture is requested at its path stamped with a short hash of its file —
`cases/<id>/<file>?v=<hash>`, the first eight hex digits of the file's SHA-256 — which
`vite.config.ts` computes from `public/cases/` when it loads, so the build, the dev server, and the
tests stamp every address from the files as they are (#45). The service worker keeps a picture by
its address. A changed picture, replaced in place under its own name, is a new address, which a
phone fetches after the update instead of showing the old picture under the new boxes; an
unchanged picture keeps its address and the copy the phone already holds. The copy a change
supersedes stays in the phone's cache until the rule's 200-entry limit evicts it.

A tap finds its spot one way, in the player and the validator alike (`src/cases/spots.ts`, #27).
Spots are drawn largest first, so where two boxes overlap the smaller is on top and takes the tap.
A tap on no box goes to the nearest within 16 CSS px, so a box hugs the thing it names and is
never padded. And every spot keeps a fingertip of its own: with the picture laid out 320 CSS px
wide, its width on a 360 phone, a 44 px square inside its box that no box drawn over it takes. The
Zoom pill counts as a box drawn over every picture, 56 × 32 px at its top left corner (#24).

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
   within their kind, and no face id is also a blank id, so a step's `filled` names one thing;
   `thumb` is a moment, and each passage is a book code, a chapter, and a verse range or none; a
   moment's picture is a file name, it has one to eight spots, and each spot's box lies inside the
   picture, its words are words and none twice, its person a face, its paper a slug, its cite
   within a passage with the book prefix as the passages require; every word is yielded by some
   spot; a face's picture is a file name and its answer a name word; there is at least one block,
   each blank's answer is a word, and each blank appears exactly once in its block's text; an
   order, when present, is the moments in some order; every step but the last has an `until` and
   the last has none, and an `until` names a spot, or a face or a blank; no text is empty —
   whitespace alone is empty, but for a run of text between two blanks, which may be the space
   between them; a blank's kind has at least three words in the case, and the case has one name
   more than it has faces (`docs/case-design.md`, rule 1); every spot keeps its fingertip
   (_Pictures_), which holds its box to a tenth of the width on each side as well; a step's words, and the retry's, are eight or fewer,
   and so are the question's, which a guided case asks about a face or a blank;
   a case that teaches the order has one, a face it teaches is one of its faces, and its lesson
   is eight words or fewer; every face and blank names a spot of the case as its evidence, and in
   a case with an order every moment names one of its own; and the moments are never listed in
   the order they happened, so the order as shown is never the answer (#77).
   `src/cases/validate.test.ts` holds one
   broken fixture per check, each failing
   the check it names and no other; the registry test, `src/cases/cases.test.ts`, holds the
   pictures, the registry's ids, the guided case first, and every spot in its scene brief.
3. **Review**, by reading: every spot named or implied by the passage, with the cites as the
   handle; the game's own voice, never the translation's words; the picture checklist
   (`docs/world-rules.md` §7). These are the authoring gate's (#5).

## Adding a case

1. Make `src/cases/<id>/` with `case.ts` exporting the structure `as const satisfies
CaseStructure`, and `en.ts` exporting the text `satisfies CaseText<typeof <id>>`.
2. Write `scenes.md`, a brief per moment from its spots, and generate each picture from its brief.
   Put the pictures in `public/cases/<id>/`, write each file's pixel size as its `size`, and
   re-fit the boxes, in `case.ts` and the brief alike, to the pictures as they came out.
3. Add the case to `src/cases/index.ts`, in play order.
4. `npm run typecheck` and `npm run test` — the typecheck reads the keys, the tests read the
   pictures and the validator's list.
5. Review the case against its passage, the world rules, and the case design rules before it
   ships.
