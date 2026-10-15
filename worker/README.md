# The passage service

A Cloudflare Worker between the app and API.Bible (Gate 33, #138), so the reveal shows the
passage itself, in the NIV, and the app never holds the key. Its own npm workspace of this
repository: `wrangler.jsonc` is its configuration, `src/index.ts` its handler, `src/store.ts` the
store and the fill that keeps it, `src/passage.ts` the reference, API.Bible's URL, and the parse,
`src/fums.ts` the report of a view, `src/books.ts` the one book table. It is deployed from Actions
on a merge to `main` that touches it or the cases (`.github/workflows/deploy-worker.yml`), and
lives at `https://behold-passages.garishay.workers.dev`. It took the place of the ESV proxy (Gate
04, #3), whose last version, `behold-esv`, answers the app until 138b switches the reveal.

## The request, and the reply

One request, the app's contract (`src/passages/service.ts`) on the wire:

```
GET /passage?translation=NIV&book=1KI&chapter=21                a whole chapter
GET /passage?translation=NIV&book=1SA&chapter=17&from=17&to=18  a range within one chapter
Origin: https://play.beholdgame.com
```

The book is its USFM code. The Worker serves a registered case's passage and nothing else, and
it answers from its store, never from API.Bible (04c). A good reply is the contract's, and nothing
else, cached nowhere, so each reveal reaches the service and its view is reported (Gate 33 A2):

```
200  { "verses": [ { "number": 1, "text": "…" }, … ] }
     content-type: application/json · access-control-allow-origin: <the origin> · vary: origin
     cache-control: no-store
```

Every other reply is a status and a one-word reason, which the app turns into the reveal's
unreachable line; none repeats a word of the text:

| status | reason         | when                                                                               |
| ------ | -------------- | ---------------------------------------------------------------------------------- |
| 403    | `origin`       | no `Origin`, or one not served — and no CORS header                                |
| 405    | `method`       | not GET (a preflight is answered 204)                                              |
| 404    | `reference`    | another path, or a translation the Worker lacks, the ESV included                  |
| 400    | `reference`    | a book off the table, a chapter the book lacks, a range not one                    |
| 404    | `unregistered` | a reference no registered case has, a registered chapter asked as a range included |
| 503    | `pending`      | a registered passage the store holds no copy of                                    |

A passage is pending before the store's first fill, and after the deploy that registers it — a new
case's, or a case's changed range — until the next fill keeps it: up to ten minutes, and KV's
minute or so to carry it. It is pending again if API.Bible gives it no copy for thirty days.

## Each view, reported

Each passage answered is a view, and API.Bible's Terms (§14) have a web app report every view to
its Fair Use Management System. The handler reports it from the Worker, after the reply, which
never waits for it (`waitUntil`):

```
GET https://fums.api.bible/f3?t=<the copy's token>&dId=<a random UUID>&sId=<another>
cf-connecting-ip: 2a06:98c0:3600::103 · x-real-ip: 2a06:98c0:3600::103
```

The token is the one API.Bible gave with the copy, kept beside its verses. The two IDs are made for
that one view and kept nowhere, so no ID outlives it, and nothing waits on the device or in the
Worker to be sent later: one view, one report, never batched. fums.api.bible is outside
Cloudflare, and Cloudflare puts a client's address in those two headers of a request that the
client's own request sets off to such a host (Gate 19 A2). Cloudflare's reference lets a Worker set
both on such a request, so the report names the address Cloudflare gives a Worker's own requests to
its other zones, and carries nothing about the player. A report that fails is let go. Reports are
not calls: they count against nothing.

## The store, and the one call that fills it

The store is one key, `passages`, in the KV namespace bound as `STORE`: each registered passage by
its name (`1 Kings 21`, `1 Samuel 17:4-4`), with when API.Bible was last asked for it, and its copy
— the verses, the FUMS token they came with, and when they came. What it keeps is the registry's:
`src/store.ts` reads every registered case's passages from `src/cases/index.ts`, the one source,
which is why a merge that touches the cases deploys the Worker.

The fill runs every ten minutes on Cloudflare's schedule (`triggers` in `wrangler.jsonc`), and it
is the one place API.Bible is asked. A passage with no copy, or a copy a week old, is asked for, at
most twenty a fill, unless an ask for it failed in the last six hours; one API.Bible doesn't answer
keeps its last copy, so a short outage never empties a reveal, until thirty days from when it came,
when it goes (Terms §11); one no longer registered goes; a copy that would take the store past 500
verses is not kept; with no key, the fill asks no one; and the store is written only when it
changed. No player's request starts a fill, and the handler asks API.Bible nothing: Cloudflare adds
a client's address to a request that the client's own request sets off, and the fill has no client.

**The calls a month.** The Starter plan gives the app 5,000 calls a month, with no overage: a call
past them errors (#138). Settled, each registered passage is asked once a week, whatever the
number of players: 30 calls in a month of 31 days for today's six. With a key that keeps failing,
each is asked four times a day: 744 a month for today's six, and 2,480 at the registry's limit of
twenty. The store's test runs such a month, a fill every ten minutes.

**The game's ceiling.** With no player's request reaching API.Bible, every registered passage has
to fit in the store at once, so all of the game's passages together stay within Biblica's
quotation limit for the NIV, 500 verses: season one's come to 217 once its last three cases land,
which leaves room for about one more season of its size (Gate 04c A3, as ruled). The registry test
fails a case that would pass it, and the season that would chooses then, at its own gate: shorter
passages, Biblica's permission beyond the limit, or another translation. It holds the registered
passages to twenty too, the most a fill asks for, so every due passage is asked at every fill and
one that keeps failing never crowds out another (#12 [Q18]); the season that would pass twenty
chooses at its gate as well.

The calls, API.Bible's chapter and passage endpoints, with the key in its header:

```
GET https://rest.api.bible/v1/bibles/<BIBLE_ID>/chapters/1KI.21?content-type=text
    &include-verse-numbers=true&include-titles=false&include-notes=false
    &include-chapter-numbers=false&fums-version=3
GET https://rest.api.bible/v1/bibles/<BIBLE_ID>/passages/1SA.17.17-1SA.17.18?…the same
api-key: <API_BIBLE_KEY>
```

The text comes back plain — `[1] … [2] …`, with each paragraph's indent and line breaks — which
`parse` splits into verses at their numbers, whitespace inside a verse folded to one space and no
word changed; the token comes back as `meta.fumsToken`, and a reply with no token is not kept,
since its views could not be reported. API.Bible gives at most 200 verses a passage, and the
game's run to 40.

The terms the Worker keeps, API.Bible's and Biblica's: non-commercial, on the Starter plan's 5,000
calls a month — at most 2,480 as above; a stored copy checked at least every thirty days, and never
shown more than thirty days out of date (§11) — asked again a week after it came, and gone thirty
days after; removed within 24 hours of a request (§11) — the takedown below; every view reported
to FUMS (§14) — above; the NIV quoted up to 500 verses — the store keeps the registered passages
only, held together within 500 by the registry test and again where the fill writes; the words
never changed; the key never shared. The app keeps at most eleven passages on the device, which
the registry test holds with the one coming in, twelve of the longest, within 500 (#12 [Q17]). The
citation and the copyright page (§7), and §12's one passage at a time, are the reveal's, with
138b (Gate 33 A3, A5).

## A takedown, within 24 hours

API.Bible's Terms (§11) give a day to remove its text when API.Bible or a rights holder asks. From
this folder, under the owner's login, two commands: the key first, so no fill can ask again, then
the store's one key.

```bash
npx wrangler secret delete API_BIBLE_KEY
npx wrangler kv key delete passages --binding STORE --remote
```

From then, every passage answers `pending`, and a reveal online shows its unreachable line. With
no key, a fill asks no one and writes nothing, so the store stays empty until the key is put back.

## The guardrails

- **Origins.** `ORIGINS` in `wrangler.jsonc`: the game at `https://play.beholdgame.com`, and its
  old address `https://garishay.github.io`, where a copy installed before the move still asks
  (Gate 17 A4). The dev server is not one (Gate 33 A9). A request from anywhere else, or with no
  `Origin`, is refused with no CORS header, so a page elsewhere reads nothing. The header is a
  browser's promise, not a lock: a script can set it, and what bounds a script is the free plan's
  day.
- **No rate limit.** A request reads the store and never reaches API.Bible, so there is no key's
  month for a script to spend, and the Worker's one ceiling is the free plan's 100,000 requests a
  day — which a request a limit refused would count against all the same. So the Worker keeps no
  limit of its own (04c), and never reads a player's address.
- **The key.** `API_BIBLE_KEY`, a Worker secret put once by hand and read from `env`; the fill
  sends it to rest.api.bible in one header and nowhere else — never a reply, a report, a log, or an
  error. The key exists only in the password manager and this store (CLAUDE.md, Guardrails).
- **Logs.** Stored request logs are off (`observability.enabled: false`); the Worker keeps nothing
  about a player — the store holds scripture and its tokens, and nothing else — and `wrangler tail`
  shows a live session when one is wanted.
- **What a finder of the URL can do:** read the game's passages from a script that sets `Origin`,
  each read a view reported to FUMS, and spend the free plan's day doing it; and nothing else: not
  another passage, not API.Bible, not the key, a search, audio, another translation, another host,
  or a bill — the free plan stops at 100,000 requests a day with an error page.

## The tables, held

`src/books.ts` is the one book table: USFM code → the book's name and the chapter count. The
registry test, `src/cases/cases.test.ts`, holds every registered case's passages against it, so a
reference the Worker could not serve fails in CI and never on a phone, and holds them together
within the store's 500 verses and to a fill's twenty passages, so a case that would take the store
past either fails there too; the app's bundle imports nothing from `worker/` and carries no table.

## Commands

```bash
npm run test                  # the Worker's tests run with the app's, on Node — API.Bible answered by fixtures
npm run check -w worker       # wrangler bundles the Worker without deploying; CI's build job runs it
npm run dev -w worker         # the Worker at http://localhost:8787, from worker/.dev.vars, its store local
npm run deploy -w worker      # the deploy; Actions runs it on merge with CLOUDFLARE_API_TOKEN
```

A dev shell for the Worker names the dev server in `worker/.dev.vars`, gitignored, as
`ORIGINS=http://localhost:5173`, which `wrangler dev` reads over `wrangler.jsonc`'s, and holds no
key, so a local fill asks no one: API.Bible's one free app is asked by the deployed Worker's fill
alone (Gate 33 A9). The app is pointed at it with `VITE_PASSAGES_URL=http://localhost:8787 npm run
dev`. Its store is local and starts empty, so the reveal shows its unreachable line, `pending`. To
see a reveal read, put made-up words in the local store, never a verse, in the store's shape:

```bash
npx wrangler kv key put --local --binding STORE passages '{"1 Kings 21":{"asked":0,"copy":{"at":0,"verses":[{"number":1,"text":"Made up."}],"token":"made-up"}}}'
```

The local Worker then reports each view it answers to fums.api.bible, as the deployed one does,
with that made-up token. The text itself is read through the deployed Worker, which answers the
game's origins only.

## Done once, by hand

Under the owner's login, from this folder (Gate 33 A10): the NIV, picked on the owner's API.Bible
dashboard, whose Bible ID is `BIBLE_ID` in `wrangler.jsonc`; the store,
`npx wrangler kv namespace create behold-niv-passages --update-config=false`, whose id is
`STORE`'s, an identifier like the account's; and, once the Worker is deployed,
`npx wrangler secret put API_BIBLE_KEY`, which takes the key at a hidden prompt, from the password
manager. Every version is Actions', with the repository secret `CLOUDFLARE_API_TOKEN` — an API
token scoped to editing this account's Workers, KV included — and the `account_id` in
`wrangler.jsonc`, an identifier read from `npx wrangler whoami`. Before it, the ESV proxy's login
and its bootstrap deploy registered the `garishay` subdomain (Gate 04 A6).
