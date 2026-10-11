# The ESV proxy

A Cloudflare Worker between the app and the ESV API (Gate 04, #3), so the reveal shows the
passage itself and the app never holds the token. Its own npm workspace of this repository:
`wrangler.jsonc` is its configuration, `src/index.ts` its handler, `src/store.ts` the store and
the fill that keeps it, `src/passage.ts` the reference, the ESV's URL, and the parse,
`src/books.ts` the one book table. It is deployed from Actions on a merge to `main` that touches
it or the cases (`.github/workflows/deploy-worker.yml`), and lives at
`https://behold-esv.garishay.workers.dev`.

## The request, and the reply

One request, the app's contract (`src/passages/service.ts`) on the wire:

```
GET /passage?translation=ESV&book=1KI&chapter=21            a whole chapter
GET /passage?translation=ESV&book=1SA&chapter=17&from=17&to=18   a range within one chapter
Origin: https://play.beholdgame.com
```

The book is its USFM code. The Worker serves a registered case's passage and nothing else, and
it answers from its store, never from the ESV (04c). A good reply is the contract's, and nothing
else:

```
200  { "verses": [ { "number": 1, "text": "…" }, … ] }
     content-type: application/json · access-control-allow-origin: <the origin> · vary: origin
     cache-control: public, max-age=86400
```

Every other reply is a status and a one-word reason, which the app turns into the reveal's
unreachable line; none repeats a word of the ESV's:

| status | reason         | when                                                                               |
| ------ | -------------- | ---------------------------------------------------------------------------------- |
| 403    | `origin`       | no `Origin`, or one not served — and no CORS header                                |
| 405    | `method`       | not GET (a preflight is answered 204)                                              |
| 404    | `reference`    | another path, or a translation the Worker lacks                                    |
| 400    | `reference`    | a book off the table, a chapter the book lacks, a range not one                    |
| 404    | `unregistered` | a reference no registered case has, a registered chapter asked as a range included |
| 503    | `pending`      | a registered passage the store doesn't hold yet                                    |

A passage is pending before the store's first fill, and after the deploy that registers it — a new
case's, or a case's changed range — until the next fill keeps it: up to ten minutes, and KV's
minute or so to carry it.

## The store, and the one call that fills it

The store is one key, `passages`, in the KV namespace bound as `STORE`: each registered passage's
verses, by the ESV's own name for it (`1 Kings 21`, `1 Samuel 17:4-4`), with the time the ESV gave
them. What it keeps is the registry's: `src/store.ts` reads every registered case's passages from
`src/cases/index.ts`, the one source, which is why a merge that touches the cases deploys the
Worker.

The fill runs every ten minutes on Cloudflare's schedule (`triggers` in `wrangler.jsonc`), and
it is the one place the ESV is asked. A passage the store lacks, or has kept a day, is asked for,
at most twenty a fill; one the ESV doesn't answer keeps its last copy, so a short outage never
empties a reveal, for up to thirty days, the life of a device's copy, after which it goes; one no
longer registered goes; one that would take the store past 500 verses is not kept; and the store
is written only when it changed. No player's request starts a fill, and the handler makes no
request of its own: Cloudflare adds a client's address to a request that the client's own request
set off, and the fill has no client.

**The game's ceiling.** With no player's request reaching the ESV, every registered passage has to
fit in the store at once, so all of the game's passages together stay within the ESV's 500 verses
stored: season one's come to 217 once its last three cases land, which leaves room for about one
more season of its size (Gate 04c A3, as ruled). The registry test fails a case that would pass
it, and the season that would chooses then, at its own gate: shorter passages, Crossway's
permission beyond the API's terms, or another translation. It holds the registered passages to
twenty too, the most a fill asks for, so every due passage is asked at every fill and one that
keeps failing never crowds out another (#12 [Q18]); the season that would pass twenty chooses at
its gate as well.

The call, the ESV's text endpoint, asked for verse numbers and nothing else — no reference line,
headings, footnotes, short copyright, horizontal lines, indentation, or wrapping — so what comes
back is `[1] Now … [2] And …`, which `parse` splits into verses, whitespace inside a verse folded
to one space and no word changed:

```
GET https://api.esv.org/v3/passage/text/?q=1+Kings+21&include-verse-numbers=true
    &include-first-verse-numbers=true&include-passage-references=false&include-headings=false
    &include-footnotes=false&include-footnote-body=false&include-short-copyright=false
    &include-copyright=false&include-passage-horizontal-lines=false
    &include-heading-horizontal-lines=false&indent-paragraphs=0&indent-poetry=false
    &indent-poetry-lines=0&indent-declares=0&indent-psalm-doxology=0&line-length=0
Authorization: Token <ESV_TOKEN>
```

The ESV's conditions of use (api.esv.org) the Worker and the app keep: at most 500 verses or half
a book a query — a query here is one registered passage, at most a chapter; 5,000 queries a day,
1,000 an hour, 60 a minute, throttled past them — the fill asks at most twenty every ten minutes,
and in a settled week each registered passage once a day, whatever the number of players; no more
than 500 verses or half a book stored locally — the store keeps the registered passages only, held
together within 500 by the registry test and again where the fill writes, and each book under
half by the registry test; and the app keeps at most eleven passages on the device, which the
registry test holds with the one coming in, twelve of the longest, within 500 (#12 [Q17]);
"periodically clear out your cache" — the fill asks again for each passage a day after it was
kept; the standard notice, the passages identified as the ESV's, and a link to www.esv.org on each
page that shows the text — the reveal carries all three; non-commercial; the words never changed;
the key never shared.

## The guardrails

- **Origins.** `ORIGINS` in `wrangler.jsonc`: the game at `https://play.beholdgame.com`, its old
  address `https://garishay.github.io`, where a copy installed before the move still asks (Gate
  17 A4), and the dev server. A request from anywhere else, or with no `Origin`, is refused with no
  CORS header, so a page elsewhere reads nothing. The header is a browser's promise, not a lock: a
  script can set it, and what bounds a script is the free plan's day.
- **No rate limit.** A request reads the store and never reaches the ESV, so there is no key's day
  for a script to spend, and the Worker's one ceiling is the free plan's 100,000 requests a day —
  which a request a limit refused would count against all the same. So the Worker keeps no limit
  of its own (04c), and never reads a player's address.
- **The key.** `ESV_TOKEN`, a Worker secret put once by hand and read from `env`; the fill sends
  it to api.esv.org in one header and nowhere else — never a reply, a log, or an error. The token
  exists only in the password manager and this store (CLAUDE.md, Guardrails).
- **Logs.** Stored request logs are off (`observability.enabled: false`); the Worker keeps nothing
  about a player — the store holds scripture and nothing else — and `wrangler tail` shows a live
  session when one is wanted.
- **What a finder of the URL can do:** read the game's passages from a script that sets `Origin`,
  and spend the free plan's day doing it; and nothing else: not another passage, not the ESV, not
  the token, a search, audio, another translation, another host, or a bill — the free plan stops
  at 100,000 requests a day with an error page.

## The tables, held

`src/books.ts` is the one book table: USFM code → the ESV's name and the chapter count. The
registry test, `src/cases/cases.test.ts`, holds every registered case's passages against it, so a
reference the Worker could not serve fails in CI and never on a phone, and holds them together
within the store's 500 verses and to a fill's twenty passages, so a case that would take the store
past either fails there too; the app's bundle imports nothing from `worker/` and carries no table.

## Commands

```bash
npm run test                  # the Worker's tests run with the app's, on Node — the ESV answered by fixtures
npm run check -w worker       # wrangler bundles the Worker without deploying; CI's build job runs it
npm run dev -w worker         # the Worker at http://localhost:8787, from worker/.dev.vars, its store local
npm run deploy -w worker      # the deploy; Actions runs it on merge with CLOUDFLARE_API_TOKEN
```

A dev shell for the Worker holds `ESV_TOKEN=not-the-token` in `worker/.dev.vars` — gitignored,
and never the real token — and the app is pointed at it with
`VITE_PASSAGES_URL=http://localhost:8787 npm run dev`. Its store is local and starts empty, so the
reveal shows its unreachable line, `pending`; `curl http://localhost:8787/cdn-cgi/local/scheduled`
runs one fill, which the ESV refuses with the dummy, so the store stays as it was. To see a reveal
read, put made-up words in the local store with `npx wrangler kv key put --local --binding STORE
passages '<JSON>'`, never a verse. The text itself is read through the deployed Worker. The app's
own `npm run dev` is a served origin, so its reveal reads the real passage.

## Done once, by hand

Under the owner's login, from this folder (Gate 04 A6): `npx wrangler login`;
`npx wrangler secret put ESV_TOKEN`, which created the Worker as a draft and took the token at a
hidden prompt; one `npx wrangler deploy`, the bootstrap that registered the `garishay` subdomain
and put the first version live. Every version after it is Actions', with the repository secret
`CLOUDFLARE_API_TOKEN` — an API token scoped to editing this account's Workers, KV included — and
the `account_id` in `wrangler.jsonc`, an identifier read from `npx wrangler whoami`. For the store
(04c): `npx wrangler kv namespace create behold-esv-passages --update-config=false`, whose id is
`STORE`'s in `wrangler.jsonc`, an identifier like the account's.
