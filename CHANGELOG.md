# Changelog

Entries run in one list in version order, newest first; within a version, by PR number. A version
is reserved when its entry is created, at the PR's open, so a lower number may land later.

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
