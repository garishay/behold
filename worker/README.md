# The ESV proxy

A Cloudflare Worker between the app and the ESV API (Gate 04, #3), so the reveal shows the
passage itself and the app never holds the token. Its own npm workspace of this repository:
`wrangler.jsonc` is its configuration, `src/index.ts` its handler, `src/passage.ts` the reference,
the ESV's URL, and the parse, `src/books.ts` the one book table. It is deployed from Actions on a
merge to `main` that touches it (`.github/workflows/deploy-worker.yml`), and lives at
`https://behold-esv.garishay.workers.dev`.

## The request, and the reply

One request, the app's contract (`src/passages/service.ts`) on the wire:

```
GET /passage?translation=ESV&book=1KI&chapter=21            a whole chapter
GET /passage?translation=ESV&book=1SA&chapter=17&from=17&to=18   a range within one chapter
Origin: https://garishay.github.io
```

The book is its USFM code; the Worker names it for the ESV from the table. A good reply is the
contract's, and nothing else:

```
200  { "verses": [ { "number": 1, "text": "…" }, … ] }
     content-type: application/json · access-control-allow-origin: <the origin> · vary: origin
     cache-control: public, max-age=86400
```

Every other reply is a status and a one-word reason, which the app turns into the reveal's
unreachable line; none repeats a word of the ESV's:

| status | reason      | when                                                            |
| ------ | ----------- | --------------------------------------------------------------- |
| 403    | `origin`    | no `Origin`, or one not served — and no CORS header             |
| 405    | `method`    | not GET (a preflight is answered 204)                           |
| 404    | `reference` | another path, or a translation the Worker lacks                 |
| 400    | `reference` | a book off the table, a chapter the book lacks, a range not one |
| 429    | `rate`      | past a limit                                                    |
| 502    | `upstream`  | the ESV down, slow past eight seconds, or answering an error    |
| 404    | `empty`     | the ESV answered with no verse                                  |

## The one call it makes

The ESV's text endpoint, asked for verse numbers and nothing else — no reference line, headings,
footnotes, short copyright, horizontal lines, indentation, or wrapping — so what comes back is
`[1] Now … [2] And …`, which `parse` splits into verses, whitespace inside a verse folded to one
space and no word changed:

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
a book a query — a request here is at most a chapter; 5,000 queries a day, 1,000 an hour, 60 a
minute, throttled past them — the limits below sit under 60; no more than 500 verses stored
locally — the app keeps at most eight passages on the device; the standard notice, the passages
identified as the ESV's, and a link to www.esv.org on each page that shows the text — the reveal
carries all three; non-commercial; the words never changed; the key never shared.

## The guardrails

- **Origins.** `ORIGINS` in `wrangler.jsonc`: the Pages site and the dev server. A request from
  anywhere else, or with no `Origin`, is refused with no CORS header, so a page elsewhere reads
  nothing. The header is a browser's promise, not a lock: a script can set it, and what bounds a
  script is the limits.
- **Limits.** Two rate-limit bindings: 12 a minute per player address (`cf-connecting-ip`), and
  50 a minute for the Worker as a whole — per data centre, permissive by design.
- **The key.** `ESV_TOKEN`, a Worker secret put once by hand and read from `env`; it goes to
  api.esv.org in one header and nowhere else — never a reply, a log, or an error. The token exists
  only in the password manager and this store (CLAUDE.md, Guardrails).
- **Logs.** Stored request logs are off (`observability.enabled: false`); the Worker keeps nothing
  about a player, and `wrangler tail` shows a live session when one is wanted.
- **What a finder of the URL can do:** read a passage of the ESV, at the limits, from a script that
  sets `Origin` — at most the key's day of queries, after which the reveal shows its unreachable
  line until the ESV's count resets; and nothing else: not the token, not a search, audio, another
  translation, another host, or a bill — the free plan stops at 100,000 requests a day with an
  error page.

## The table, held

`src/books.ts` is the one book table: USFM code → the ESV's name and the chapter count. The
registry test, `src/cases/cases.test.ts`, holds every registered case's passages against it, so a
reference the Worker could not serve fails in CI and never on a phone; the app's bundle imports
nothing from `worker/` and carries no table.

## Commands

```bash
npm run test                  # the Worker's tests run with the app's, on Node — the ESV answered by fixtures
npm run check -w worker       # wrangler bundles the Worker without deploying; CI's build job runs it
npm run dev -w worker         # the Worker at http://localhost:8787, from worker/.dev.vars
npm run deploy -w worker      # the deploy; Actions runs it on merge with CLOUDFLARE_API_TOKEN
```

A dev shell for the Worker holds `ESV_TOKEN=not-the-token` in `worker/.dev.vars` — gitignored,
and never the real token — and the app is pointed at it with
`VITE_PASSAGES_URL=http://localhost:8787 npm run dev`: the origin, the limits, the reference, and
the error path run end to end, and the reveal shows its unreachable line where the text would
be, since the ESV refuses the dummy. The text itself is read through the deployed Worker. The
app's own `npm run dev` is a served origin, so its reveal reads the real passage.

## Done once, by hand

Under the owner's login, from this folder (Gate 04 A6): `npx wrangler login`;
`npx wrangler secret put ESV_TOKEN`, which created the Worker as a draft and took the token at a
hidden prompt; one `npx wrangler deploy`, the bootstrap that registered the `garishay` subdomain
and put the first version live. Every version after it is Actions', with the repository secret
`CLOUDFLARE_API_TOKEN` — an API token scoped to editing this account's Workers — and the
`account_id` in `wrangler.jsonc`, an identifier read from `npx wrangler whoami`.
