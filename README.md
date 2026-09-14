# Behold

**Bible Mystery Game — a deduction game about the stories you thought you knew.**

**Live at <https://garishay.github.io/behold/>** — the placeholder screen for now: the title, the
epigraph, and a promise. It installs to a phone's home screen and opens offline after one visit.
Every merge to `main` redeploys it.

Behold is a mystery game set in the stories of the Bible. Each case is a passage: the player
studies the pictures of its moments, works out who is who and what happened, and fills the blanks
of the account in the game's own words — then the reveal shows the text itself. You know the
stories. You don't know the details. The tutorial is the valley of Elah; season one, the house of
Ahab, is being written.

## Status

Gate 01 — Foundation: the scaffold, the quality gates and CI, the PWA shell, the Pages deploy, and
the rulebook. Gate 02 — Case file format: the shape a case is authored in and the app loads,
[`docs/case-file.md`](docs/case-file.md), with the tutorial and case two as the first case files
under `src/cases/`. Gate 03 — Player port (#6): the case player — the cards on the title screen,
each case's pictures and their spots, the word bank, the papers, who is who, what happened first,
the account and its blanks, the close, and the reveal; progress kept on the device. The tutorial
and case two play through; the reveal's passage is one placeholder line until the ESV proxy (#3)
answers it. The world rules — the accuracy and art constraints every picture and every case is
checked against — are [`docs/world-rules.md`](docs/world-rules.md).

## Stack

Vite · React · TypeScript (strict) · vite-plugin-pwa · Vitest · ESLint · Prettier

## Commands

```bash
npm ci                          # install dependencies
npm run dev                     # start the dev server
npm run build                   # production build
npm run preview                 # serve the build
npm run lint                    # ESLint
npm run format:check            # Prettier
npm run typecheck               # tsc --noEmit
npm run test                    # Vitest
npm run icons                   # regenerate the placeholder icons
npm run review:threads -- <pr>  # list a PR's unresolved review threads
```

## How this repo is built

Every change ships through the same path: GitHub Issue with a mini-PRD → branch → PR → AI code
review → green CI → engineering review → iteration → squash-merge. The path is deliberate — it
is half the point of the project. The rules of the path — the guardrails, the conventions, the
plan gate, decision rights, lanes, and what the repository enforces rather than writes down — are
[`CLAUDE.md`](CLAUDE.md); a lane reads it first.

## License

The code is MIT — see [`LICENSE`](LICENSE). The case text and the art are not: all rights
reserved. Scripture in the reveal is fetched from its translation's service at display time and
never lives in this repository; the ESV attribution and the Berean Standard Bible attribution are
reserved for the About screen.
