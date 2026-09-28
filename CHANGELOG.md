# Changelog

Entries run in one list in version order, newest first; within a version, by PR number. A version
is reserved when its entry is created, at the PR's open, so a lower number may land later.

## v0.8.0 — Gate 08, the mountain (#30)

- **30a — the mountain** (#49): case two, the contest on Mount Carmel, 1 Kings 18:17–40, between
  the valley and the vineyard, which becomes case three; three moments put in the order they
  happened — Baal's altar at noon, the water, the fire — read from the sun, the altar, and the
  trench; fourteen spots, four blanks on the details people get wrong, and names from a person's
  tap as in the valley; the lesson, a first-encounter mark on the order's pictures and then its
  slots, with the validator's check (n); each moment's scene brief in `scenes.md`, written from
  its spots, with its prompt as sent, and a registry test holding every spot to its brief; world
  rules §6's _Describe, then generate_ in place of _Edits over regeneration_.

## v0.7.2 — A mark brings its target into view (#47)

- **47a — one scroll for both axes** (#48): a tutorial mark brings its target to the middle of
  its scroll box with one `scrollBy`, where two assignments, one per axis, let the second abort
  the first while the account glided; on a 360 × 640 phone, step 4's ring and words show on the
  sling's blank again, where since 07c they vanished with the blank below the account's view.

## v0.7.1 — A changed picture reaches the phone (#45)

- **45a — a picture's address carries its file's hash** (#46): each case picture requested at
  its path stamped `?v=<hash>`, a short hash of its file computed from `public/cases/` by
  `vite.config.ts`, so a changed picture is a new address the phone fetches after the update
  instead of the old picture under the new boxes, and an unchanged one keeps its address and its
  cached copy; the `cases` rule's pattern widened to match; a superseded copy left for the
  200-entry limit to evict; the first update to carry the stamp moves every address once, so a
  case played before it reads offline again after one online open.

## v0.7.0 — Gate 07, Look and Solve, and the marks (#24, #25)

- **07a — Look and Solve on one phone screen** (#41): the case screen fits the phone and never
  scrolls; a bar at the foot with the menu, Look, and Solve, Look carrying the case's found count
  and Solve the filled count and a badge for new words; the brief as a card over a fresh case's
  picture, and again in the menu; the caption docked under the picture with the finds right under
  it and More for a long one; the bank on Solve, the account scrolling with who is who and Papers
  held above it; the picker marking each moment with something left; the Zoom pill the one thing
  on the picture, counted by check (l).
- **07b — the tutorial shown where the player looks** (#42): each guided step shown at its
  target, a ring and a dim and eight words or fewer beside it, blocking nothing, the dim lifting
  on a tap elsewhere; the valley's four moves and Close the case as five steps, with Solve opened
  as a step of its own; a step already met never shown; the last step's words and dim leaving on
  the next tap while its ring stays; the banner and the Solve pulse gone; the validator's check
  (m), a step's words eight or fewer.
- **07c — the case screen fits the phone** (#43): the case screen pinned to the screen the phone
  shows instead of sized by `100dvh`, which on the owner's phone came out taller than the screen
  by the address bar; a mark scrolls only its target's own scroll box, never the page, and shows
  only where its target can be seen, its ring cut at the scroll box's edge; Close the case held at
  the account's foot, and a close's result in the bank's head beside a refused word's message.
- **07d — Close the case in its own row** (#44): Close the case docked between the account and
  the bank, outside the scroll, so it never moves and never covers the account.

## v0.6.0 — Gate 06, every spot owns a fingertip (#27)

- **27a — a fingertip for every spot** (#40): one rule for how a tap finds its spot, read by the
  player and the validator alike (`src/cases/spots.ts`); a tap on no box goes to the nearest spot
  within 16 CSS px, so boxes hug what they name and are never padded; the validator's check (l),
  every spot keeping a 44 px square of its own with the picture laid out 320 px wide, as on a
  360 phone, which holds the floor of a tenth of the width too; the bedchamber's seal, papyrus,
  and pouch boxes re-fit to it.

## v0.5.1 — The bedchamber's final picture (#28)

- **28a — the seal found, the coins gone** (#39): the bedchamber edited by the owner and fitted to
  900 × 1125, a large gold signet ring beside the woman's hand and its impression in red clay on
  the papyrus, the pouch closed on the table; the boxes re-measured, the seal's padded so a tap
  just off the ring or the clay still takes it and kept the smallest box it overlaps; the seal's,
  the pouch's, and the woman's captions for what the picture now shows; world rules §8's
  bedchamber line gone.

## v0.5.0 — Gate 05, case design (#26)

- **05a — a case is solved by looking** (#32): `docs/case-design.md`, the six rules a case is
  designed to, linked from the world rules and the case file format; the tutorial marks right
  only the slots its guided steps name and closes on Close the case, the same coarse check as
  every case; a moment's spots drawn largest first, so the smaller of two overlapping boxes takes
  the tap; the validator's two checks, a blank's kind with its answer and two rivals in the case
  and one name more than the faces; the valley and the vineyard rewritten to the rules, the
  valley's passages gaining 1 Samuel 17:4 and its headline blank aimed at 17:51.
- **05b — the giant's sword named** (#36): the valley's giant caption names the sheathed sword
  across his back, in the owner's words, so the evidence for the headline blank is findable
  before playtest 2 while the picture's edit waits (#34, #35).
- **05c — the sheath folded into the giant** (#38): the giant's tap finds his sword, the sheath
  spot and its caption gone, six spots in the valley; no tap highlight on the picture's spots, so
  a tap never draws a spot's box; the case design rules' note on a spot inside another's box
  (#37).

## v0.4.0 — Gate 04, ESV proxy (#3)

- **04a — the Worker, its tests, its deploy, the one table held** (#22): `worker/`, the ESV proxy
  as its own workspace — `src/index.ts`, the handler: a served origin, the two rate limits, a
  reference the table knows, the ESV's text endpoint asked for verse numbers and nothing else,
  the verses back as the contract has them, every other answer a status the app turns into the
  reveal's unreachable line; `src/passage.ts`, the reference, the ESV's URL, and the parse;
  `src/books.ts`, the one book table with its chapter counts, held against every registered
  case's passages by the registry test; `wrangler.jsonc`, the origins, the limits, no stored logs;
  `deploy-worker.yml`, the deploy from Actions on a merge that touches the Worker; CI's build job
  bundling it with a dry run; the token put in the Worker's store by hand, once.
- **04b — the app's side: the proxy read, the attribution, the cache** (#31):
  `src/passages/proxy.ts`, the passage service through the Worker, its reply checked against the
  contract and anything else a rejection, so the reveal shows its unreachable line; the stub and
  its line gone; the reveal marks each passage ESV and carries Crossway's notice and the link to
  www.esv.org in every state; a runtime cache rule keeping at most eight passages a month for
  offline; no test reaches the network.

## v0.3.0 — Gate 03, Player port (#6)

- **03a — the model and the passage service** (#19): `src/player/state.ts` — a case's progress
  and the moves on it, pure functions keyed by the structure's ids, a guided case stepping on and
  closing itself, a case without steps closing on the submit; `src/passages/service.ts`, the
  Worker's contract — a reference and a translation in, verses out — and `stub.ts`, the one line
  the reveal shows until #3; the validator's face/blank and word-once sentences.
- **03b — the case explored** (#20): the case cards on the title screen; `src/player/Player.tsx`,
  the case screen — the brief, Moments and Papers, the tutorial's banner — with `Stage.tsx`, the
  picture and its spots, `Bank.tsx`, the console and the word chips, and `Papers.tsx`, the
  documents opened and one over the screen; progress kept on the device, `storage.ts`, and the
  open case a history entry so the system's back returns to the cards (Gate 03 [1]); the runtime
  cache rule for the case pictures; the stylesheet for all of it, the bank's chips clear of the
  gesture zone ([6]).
- **03c — the case solved, and the reveal** (#21): `src/player/Think.tsx` — who is who, what
  happened first, the blocks with their blanks, a guided case marking each right answer and
  closing itself, the other case's submit and how far off it was; the Think tab with its count and
  its pulse; `sting.ts`, the three notes on the close; `Reveal.tsx` — the case in the game's words,
  then each passage as verses through the service, the stub's one line until #3, the reveal its
  own history entry so the system's back returns to the case (Gate 03 [1]); the stylesheet for
  Think and the reveal, the reveal's foot clear of the gesture zone ([6]).

## v0.2.1 — Governance revision 1 (#13)

- **the rule text of [G1]–[G6]** (#18): `CLAUDE.md` — [G1], [G4], and [G5] under Size in
  Conventions; [G2], [G3], and [G6] as the review loop in Review; [G3]'s refspec and mention rule
  with the lane rules — each in the words of its ruling; `AGENTS.md` and the README untouched,
  carrying none of the six today.

## v0.2.0 — Gate 02, Case file format (#4)

- **02a — the case file format and the first two cases** (#16): `src/cases/types.ts` — a case as
  two TypeScript files, the structure and one text file per language, the text's type computed
  from the structure so the typecheck holds its keys; `src/cases/index.ts`, the registry; the
  tutorial and case two from the prototype, text verbatim, with their pictures under
  `public/cases/`; `docs/case-file.md`, the format's reference.
- **02b — the validator** (#17): `src/cases/validate.ts` — the checks the types cannot make,
  A6's list over a case and one of its texts, one sentence per problem, run by the test job over
  every registered case; `src/cases/validate.test.ts`, one broken fixture per check; the
  validator's section of `docs/case-file.md` in the present tense.

## v0.1.0 — Gate 01, Foundation (#1)

- **01a — the scaffold, the quality gates, CI** (#11): Vite + React + TypeScript strict with Node
  24 pinned; ESLint, Prettier, Vitest with Testing Library and jsdom; `ci.yml` with `lint` (the
  conflict-marker scan first), `typecheck`, `test`, `build`.
- **01b — the PWA shell, the deploy, the placeholder screen, the rulebook** (#14):
  `vite-plugin-pwa` with the prompt register and the "Update available" toast, the manifest, the
  placeholder lamp icons and `scripts/generate-icons.ts`; `deploy.yml`, GitHub Pages by the
  Actions artifact flow on every push to `main`; the placeholder screen — the title, the epigraph
  and its notice, the two lines, the prototype's palette and type, every word from the keyed
  strings module `src/strings/en.ts`; `CLAUDE.md` and `AGENTS.md`, the README, this changelog,
  `scripts/review-threads.ts`.
- **01c — the tool-guard hook** (#15): `scripts/tool-guard.ts` and `.claude/settings.json`, ported
  from Vigil — a PreToolUse hook that blocks a push to `main`, a force push, and a dependency add,
  names the rule, and fails closed on anything it cannot judge.
