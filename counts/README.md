# The count service

A Cloudflare Worker that takes the game's beacons and adds them to the day's totals (#7). Its own
npm workspace of this repository, beside the passage service in `worker/`, which keeps no count
of anything (#3, as ruled): `wrangler.jsonc` is its configuration, `src/index.ts` its handler,
`schema.sql` its one table, and `src/counted.ts`, in the app, the names it takes. It is deployed
from Actions on a merge to `main` that touches it or the names (`.github/workflows/deploy-counts.yml`),
and lives at `https://behold-counts.garishay.workers.dev`.

## The beacon, and the reply

When the game is hidden (put away, switched from, or closed), it sends what it has counted since
the last beacon, as one request, unless Counting is off on About (`src/beacon.ts`):

```
POST /count
Origin: https://play.beholdgame.com
Content-Type: text/plain;charset=UTF-8

[["open","","new",1],["case","valley","new",1],["step","valley","1/<30s",1]]
```

Each count is a name, its case or none, one detail or none, and how many. The browser sends it
with `navigator.sendBeacon`, as a simple request, so there is no preflight, and the game reads no
reply. The Worker holds every count to the names the game counts, a case's id to lowercase
letters, a detail to 40 characters of letters, digits, and `<+./-`, and how many to 1–1,000; a
beacon of at most 200 counts. One count that isn't refuses the whole beacon, and nothing of it is
kept.

| status | reason   | when                                             |
| ------ | -------- | ------------------------------------------------ |
| 204    |          | every count added to its total for the day       |
| 403    | `origin` | no `Origin`, or another one — and no CORS header |
| 405    | `method` | not POST                                         |
| 404    | `path`   | another path                                     |
| 400    | `counts` | not a beacon, or a count the game never sends    |
| 503    | `store`  | the database refused it: the day's writes spent  |

## The totals, and nothing else

One table in the D1 database `behold-counts` (`schema.sql`): each count's total for the day, in
UTC, by its name, its case, and its detail. A beacon's counts go in one batch, each added to its
total, the day's first starting it. Nothing else is kept: not the beacon, not when in the day it
came, not the address it came from, which the Worker never reads, and no request log
(`observability.enabled: false`). So a total says how many times something happened that day, and
nothing can tie two counts to one player or one visit.

**The free plan.** D1 gives 100,000 rows written a day, and each count added is one: an index adds
a row to a write, and the table has none but its key, which `WITHOUT ROWID` makes the table itself.
A beacon carries one count for each different thing counted, 8 for a first visit that opens the
valley and Solve, so the day's writes cover thousands of visits. Past them, D1 refuses writes until
00:00 UTC: the rest of that day's beacons are let go, and the game never notices. Cloudflare's
100,000 requests a day are the account's, shared with the passage service; the beacon spends one
each time the game is hidden.

## Reading the counts

In Cloudflare's dashboard, Storage & databases → D1 → `behold-counts` → Console, or from this
folder under the owner's login, `npx wrangler d1 execute behold-counts --remote --command "<query>"`:

```sql
-- One day, every count
SELECT name, at, detail, n FROM counts WHERE day = '2026-11-12' ORDER BY name, at, detail;

-- Each day's opens, new and back, and Begin
SELECT day, name, detail, SUM(n) FROM counts WHERE name IN ('open', 'begin')
  GROUP BY day, name, detail ORDER BY day;

-- Each case, opened new and closed, from a day on
SELECT at,
  SUM(CASE WHEN name = 'case' AND detail = 'new' THEN n END) AS began,
  SUM(CASE WHEN name = 'close' AND detail LIKE 'closed/%' THEN n END) AS closed
  FROM counts WHERE day >= '2026-11-12' GROUP BY at;

-- The valley's tutorial, step by step
SELECT CAST(substr(detail, 1, instr(detail, '/') - 1) AS INTEGER) AS step, SUM(n) FROM counts
  WHERE name = 'step' AND at = 'valley' GROUP BY step ORDER BY step;

-- Where hints point, most first
SELECT at, detail, SUM(n) AS n FROM counts WHERE name = 'aim' GROUP BY at, detail ORDER BY n DESC;
```

What each name and detail means is `src/beacon.ts`'s.

## The guardrails

- **Origin.** `ORIGINS` in `wrangler.jsonc`: the game at `https://play.beholdgame.com`. A request
  from anywhere else, or with none, is refused. The header is a browser's promise, not a lock: a
  script can set it, and what bounds a script is the counts' own limits and the free plan's day.
- **What a finder of the URL can do:** add made-up counts of the game's own names to a day's
  totals, and spend the day's writes and requests doing it; and nothing else: not read a total, not
  write anything but a count, not reach the passage service, a key, or a bill.
- **No address, no log.** The Worker never reads a player's address, and keeps no log;
  `wrangler tail` shows a live session when one is wanted.

## Commands

```bash
npm run check -w counts    # wrangler bundles the Worker without deploying; CI's build job runs it
npm run dev -w counts      # the Worker at http://localhost:8787, its database local
npm run deploy -w counts   # the deploy; Actions runs it on merge with CLOUDFLARE_API_TOKEN
```

A dev shell names its own origin in `counts/.dev.vars`, gitignored, as `ORIGINS=http://localhost:5173`,
and points the app at it with `VITE_COUNTS_URL=http://localhost:8787 npm run dev`. The local
database starts empty: `npx wrangler d1 execute behold-counts --local --file=schema.sql` makes its
table. The dev server sends no beacon unless `VITE_COUNTS_URL` is set.

## Done once, by hand

Under the owner's login, from this folder (Gate 41): the database,
`npx wrangler d1 create behold-counts`, whose id is `database_id` in `wrangler.jsonc`, an identifier
like the account's; its table, `npx wrangler d1 execute behold-counts --remote --file=schema.sql`;
and, if the repository's `CLOUDFLARE_API_TOKEN` can't yet edit D1, that permission added to it.
