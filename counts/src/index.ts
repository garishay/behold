/**
 * The count service (#7): a Cloudflare Worker that takes the game's beacons and adds each to the
 * day's totals. It answers one request, POST /count from the game's origin, whose body is a beacon,
 * `[[name, case, detail, n], …]` (`src/beacon.ts`). Every count in it is held to the names the game
 * counts (`src/counted.ts`) and to the shape of a case's id and a detail, and a beacon with one
 * that isn't is refused whole. The totals are one table in D1, by the day, in UTC, that a beacon
 * came, and nothing else is kept: not the beacon, not when in the day, not who sent it. Nothing
 * here reads the player's address.
 */
import { names, type Name } from '../../src/counted.ts'

/** As much of a D1 database as the Worker uses: a statement, bound, and a batch of them. */
export interface Statement {
  bind(...values: readonly (string | number)[]): Statement
}
export interface D1 {
  prepare(query: string): Statement
  batch(statements: readonly Statement[]): Promise<unknown>
}

/** The Worker's bindings: the origins it answers, and the totals' database. */
export interface Env {
  readonly ORIGINS: string
  readonly DB: D1
}

/** A count as a beacon carries it: its name, its case or none, its detail or none, and how many. */
type Count = readonly [Name, string, string, number]

/** The most counts a beacon may carry, and the most of one, so no beacon outweighs a long visit. */
export const most = { counts: 200, each: 1000 } as const

const count = (x: unknown): x is Count =>
  Array.isArray(x) &&
  x.length === 4 &&
  names.includes(x[0]) &&
  typeof x[1] === 'string' &&
  /^[a-z]{0,24}$/.test(x[1]) &&
  typeof x[2] === 'string' &&
  /^[\w<+./-]{0,40}$/.test(x[2]) &&
  Number.isInteger(x[3]) &&
  x[3] > 0 &&
  x[3] <= most.each

const refuse = (reason: string, status: number, headers: Readonly<Record<string, string>> = {}) =>
  new Response(JSON.stringify({ error: reason }), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })

/** Each count of a beacon added to its total for the day; the first of a day starts it. */
const add =
  'INSERT INTO counts (day, name, at, detail, n) VALUES (?1, ?2, ?3, ?4, ?5) ' +
  'ON CONFLICT (day, name, at, detail) DO UPDATE SET n = n + excluded.n'

/**
 * One beacon taken. A request from anywhere but an allowed origin is refused with no CORS header;
 * the game's own beacon is sent with no CORS at all, and reads no reply, so a reply only says what
 * became of it. The beacon's counts go to the database in one batch, all or none.
 */
export async function handle(request: Request, env: Env, now = new Date()) {
  const origin = request.headers.get('origin')
  if (origin === null || !env.ORIGINS.split(' ').includes(origin)) return refuse('origin', 403)
  const cors = { 'access-control-allow-origin': origin, vary: 'origin' }
  if (request.method !== 'POST') return refuse('method', 405, cors)
  if (new URL(request.url).pathname !== '/count') return refuse('path', 404, cors)
  let beacon: unknown
  try {
    beacon = JSON.parse(await request.text())
  } catch {
    return refuse('counts', 400, cors)
  }
  if (!Array.isArray(beacon) || beacon.length === 0 || beacon.length > most.counts)
    return refuse('counts', 400, cors)
  if (!beacon.every(count)) return refuse('counts', 400, cors)
  const day = now.toISOString().slice(0, 10)
  const statement = env.DB.prepare(add)
  try {
    await env.DB.batch(
      beacon.map(([name, at, detail, n]) => statement.bind(day, name, at, detail, n)),
    )
  } catch {
    // The free plan's day of writes spent, or the database away: the beacon is let go.
    return refuse('store', 503, cors)
  }
  return new Response(null, { status: 204, headers: cors })
}

export default {
  fetch: (request: Request, env: Env) => handle(request, env),
}
