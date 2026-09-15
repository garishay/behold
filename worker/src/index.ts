/**
 * The ESV proxy (#3): a Cloudflare Worker between the app and the ESV API, so the app never
 * holds the token. It answers one request — GET /passage?translation=ESV&book=<USFM>
 * &chapter=<n>[&from=<n>&to=<n>] — from an allowed origin, within the rate limits, with the
 * passage's verses as the app's contract has them, `{ verses: [{ number, text }] }` (Gate 03
 * [2]). Every other answer is an error status with a one-word reason, which the app turns into
 * the reveal's unreachable line; no reply repeats the ESV's words but the verses asked for, and
 * the token goes to api.esv.org and nowhere else.
 */
import { esvUrl, parse, reference } from './passage.ts'

/** A rate-limit binding, as Cloudflare provides it. */
export interface Limiter {
  limit(options: { readonly key: string }): Promise<{ readonly success: boolean }>
}

/** The Worker's bindings: the secret, the origins served, the two limiters (wrangler.jsonc). */
export interface Env {
  readonly ESV_TOKEN: string
  readonly ORIGINS: string
  readonly PER_IP: Limiter
  readonly ALL: Limiter
}

/** How the Worker reaches the ESV; the test hands in its own. */
export type Fetcher = (url: string, init: RequestInit) => Promise<Response>

type Headers = Readonly<Record<string, string>>

const json = (body: unknown, status: number, headers: Headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
const refuse = (reason: string, status: number, headers: Headers = {}) =>
  json({ error: reason }, status, headers)

/** The one passage in the ESV's reply, when the reply has the endpoint's shape. */
const passage = (reply: unknown): string | undefined => {
  if (typeof reply !== 'object' || reply === null || !('passages' in reply)) return undefined
  const first: unknown = Array.isArray(reply.passages) ? reply.passages[0] : undefined
  return typeof first === 'string' ? first : undefined
}

/**
 * One request answered. A request from anywhere but an allowed origin is refused with no CORS
 * header, so a browser elsewhere never reads a reply; every reply names its origin and varies
 * on it, so a cache keys by it. The limits are asked before the ESV is, and a passage that came
 * back is cached by the browser for a day.
 */
export async function handle(request: Request, env: Env, fetcher: Fetcher = fetch) {
  const origin = request.headers.get('origin')
  if (origin === null || !env.ORIGINS.split(' ').includes(origin)) return refuse('origin', 403)
  const cors = { 'access-control-allow-origin': origin, vary: 'origin' }
  if (request.method === 'OPTIONS')
    return new Response(null, {
      status: 204,
      headers: {
        ...cors,
        'access-control-allow-methods': 'GET',
        'access-control-max-age': '86400',
      },
    })
  if (request.method !== 'GET') return refuse('method', 405, cors)
  const url = new URL(request.url)
  if (url.pathname !== '/passage' || url.searchParams.get('translation') !== 'ESV')
    return refuse('reference', 404, cors)
  const ref = reference(url.searchParams)
  if (ref === undefined) return refuse('reference', 400, cors)
  // The address's limit first, and the whole's only for a request it let through: a request
  // refused for its address must not spend the whole's allowance, or one address flooding the
  // Worker would close it to every player in the data centre (review round 1, #22).
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  if (!(await env.PER_IP.limit({ key: ip })).success) return refuse('rate', 429, cors)
  if (!(await env.ALL.limit({ key: 'all' })).success) return refuse('rate', 429, cors)
  const reply = await fetcher(esvUrl(ref), {
    headers: { authorization: `Token ${env.ESV_TOKEN}` },
    signal: AbortSignal.timeout(8000),
  }).catch(() => undefined)
  if (reply === undefined || !reply.ok) return refuse('upstream', 502, cors)
  const text = passage(await reply.json().catch(() => undefined))
  const verses = text === undefined ? [] : parse(text)
  if (verses.length === 0) return refuse('empty', 404, cors)
  return json({ verses }, 200, { ...cors, 'cache-control': 'public, max-age=86400' })
}

export default { fetch: (request: Request, env: Env) => handle(request, env) }
