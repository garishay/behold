# Changelog

Entries run in one list in version order, newest first; within a version, by PR number. A version
is reserved when its entry is created, at the PR's open, so a lower number may land later.

## v0.2.0 — Gate 02, Case file format (#4)

- **02a — the case file format and the first two cases** (#16): `src/cases/types.ts` — a case as
  two TypeScript files, the structure and one text file per language, the text's type computed
  from the structure so the typecheck holds its keys; `src/cases/index.ts`, the registry; the
  tutorial and case two from the prototype, text verbatim, with their pictures under
  `public/cases/`; `docs/case-file.md`, the format's reference.

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
