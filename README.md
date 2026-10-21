# Behold

**Bible Mystery Game — a deduction game about the stories you thought you knew.**

**Live at <https://play.beholdgame.com/>** — it opens on its title, then the cases, played
in order. It installs to a phone's home screen and opens offline after one visit. Every merge to
`main` redeploys it.

Behold is a mystery game set in the stories of the Bible. Each case is a passage: the player
studies the pictures of its moments, works out who is who and what happened, and fills the blanks
of the account in the game's own words — then the reveal shows the text itself. Look closer.
There's more to every story. The tutorial is the valley of Elah; season one, the house of Ahab,
is complete.

## Status

Gate 01 — Foundation: the scaffold, the quality gates and CI, the PWA shell, the Pages deploy, and
the rulebook. Gate 02 — Case file format: the shape a case is authored in and the app loads,
[`docs/case-file.md`](docs/case-file.md), with the tutorial and case two as the first case files
under `src/cases/`. Gate 03 — Player port (#6): the case player — the cards on the title screen,
each case's pictures and their spots, the word bank, the papers, who is who, what happened first,
the account and its blanks, the close, and the reveal; progress kept on the device. Gate 04 — the
passage service (#3), the NIV's since Gate 33 (#138): [`worker/`](worker/README.md), the
Cloudflare Worker between the app and API.Bible — a registered case's passage in, its verses out,
the key in the Worker's own store — deployed from Actions on merge, its one book table held
against every case's passages in CI, answering from a store it fills on a schedule, so no
player's request reaches API.Bible, and reporting each passage it answers to API.Bible's Fair Use
Management System. The tutorial and the cases play through, and the reveal reads each passage
through the Worker, cited "(NIV)" with a link to the game's copyright page, and API.Bible's
citation beneath; the last eleven passages read stay on the device, so a closed case reads
offline. The world rules — the accuracy and art constraints every picture and every case is
checked against — are [`docs/world-rules.md`](docs/world-rules.md). The privacy policy (#9) is a
page of its own, <https://play.beholdgame.com/privacy/>, written at build from the strings module
so it reads without JavaScript, and linked from the cases page; a test holds what it says to the
code. The copyright page, <https://play.beholdgame.com/copyright/>, is built the same way.

## Stack

Vite · React · TypeScript (strict) · vite-plugin-pwa · Vitest · ESLint · Prettier · a Cloudflare
Worker in `worker/`, its own workspace, built and deployed by wrangler

## Commands

```bash
npm ci                          # install dependencies, the Worker's included
npm run dev                     # start the dev server
npm run build                   # production build
npm run preview                 # serve the build
npm run lint                    # ESLint
npm run format:check            # Prettier
npm run typecheck               # tsc --noEmit, the Worker's project included
npm run test                    # Vitest — the app's tests and the Worker's
npm run icons                   # frame the icons from the master, assets/icon.png
npm run review:threads -- <pr>  # list a PR's unresolved review threads
npm run check -w worker         # bundle the Worker without deploying, as CI's build job does
npm run dev -w worker           # the Worker at http://localhost:8787 (see worker/README.md)
```

The Worker deploys from Actions on a merge to `main` that touches it or the cases, whose passages
its store keeps; nothing runs on a PC after a merge.

## How this repo is built

Every change ships through the same path: GitHub Issue with a mini-PRD → branch → PR → AI code
review → green CI → engineering review → iteration → squash-merge. The path is deliberate — it
is half the point of the project. The rules of the path — the guardrails, the conventions, the
plan gate, decision rights, lanes, and what the repository enforces rather than writes down — are
[`CLAUDE.md`](CLAUDE.md); a lane reads it first.

## License

The code is MIT — see [`LICENSE`](LICENSE), which also names, by path, what MIT does not cover.
The cases and the art are not MIT: all rights reserved. The sounds keep their own licences,
CC0 1.0 and CC BY 4.0, each named in [`docs/sound.md`](docs/sound.md), and the music's credit is on
the cases page.

"Behold" and its icon ([`docs/icon.md`](docs/icon.md)) name this game. A copy may use the code
under MIT, but not the name, the icon, the cases, or the art.

Scripture in the reveal is the NIV, fetched from its translation's service at display time, and
never lives in this repository; its notice, and the source of the cases page's epigraph, the
public-domain Berean Standard Bible, are on the game's copyright page.
