/**
 * The ESV proxy (#3): a Cloudflare Worker between the app and the ESV API, so the app never
 * holds the token. It answers one request — GET /passage?translation=ESV&book=<USFM>
 * &chapter=<n>[&from=<n>&to=<n>] — from an allowed origin, for a registered case's passage, with
 * its verses from the store as the app's contract has them, `{ verses: [{ number, text }] }`
 * (Gate 03 [2]). The store is filled on a schedule (`store.ts`), so a player's request never
 * reaches the ESV (04c). Every other answer is an error status with a one-word reason, which the
 * app turns into the reveal's unreachable line; the token goes to api.esv.org and nowhere else.
 */
import { query, reference } from './passage.ts'
import { fill, read, registered, type Kept, type KV } from './store.ts'

/** The Worker's bindings: the secret, the origins served, the store (wrangler.jsonc). */
export interface Env {
  readonly ESV_TOKEN: string
  readonly ORIGINS: string
  readonly STORE: KV
}

type Headers = Readonly<Record<string, string>>

const json = (body: unknown, status: number, headers: Headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
const refuse = (reason: string, status: number, headers: Headers = {}) =>
  json({ error: reason }, status, headers)

/**
 * One request answered. A request from anywhere but an allowed origin is refused with no CORS
 * header, so a browser elsewhere never reads a reply; every reply names its origin and varies
 * on it, so a cache keys by it. A reference no case registers is refused before the store is
 * read; a registered one the store doesn't hold yet is pending; a passage that came back is
 * cached by the browser for a day. Nothing here makes a request of its own, or reads the
 * player's address.
 */
export async function handle(request: Request, env: Env) {
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
  const name = query(ref)
  if (!registered.has(name)) return refuse('unregistered', 404, cors)
  const kept: Kept | undefined = (await read(env.STORE))[name]
  if (kept === undefined) return refuse('pending', 503, cors)
  return json({ verses: kept.verses }, 200, { ...cors, 'cache-control': 'public, max-age=86400' })
}

export default {
  fetch: (request: Request, env: Env) => handle(request, env),
  // The fill, on the schedule in wrangler.jsonc: no player's request starts it.
  scheduled: (controller: { readonly scheduledTime: number }, env: Env) =>
    fill(env.STORE, env.ESV_TOKEN, controller.scheduledTime, fetch),
}
