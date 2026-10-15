/**
 * The passage service (#138, after #3): a Cloudflare Worker between the app and API.Bible, so the
 * app never holds the key. It answers one request — GET /passage?translation=NIV&book=<USFM>
 * &chapter=<n>[&from=<n>&to=<n>] — from an allowed origin, for a registered case's passage, with
 * its verses from the store as the app's contract has them, `{ verses: [{ number, text }] }`
 * (Gate 03 [2]). The store is filled on a schedule (`store.ts`), so a player's request never
 * reaches API.Bible (04c); each passage answered is reported to API.Bible's Fair Use Management
 * System from the Worker (`fums.ts`). Every other answer is an error status with a one-word
 * reason, which the app turns into the reveal's unreachable line; the key goes to rest.api.bible
 * and nowhere else.
 */
import { report } from './fums.ts'
import { cite, reference } from './passage.ts'
import { fill, read, registered, type KV } from './store.ts'

/** The Worker's bindings: the key, a secret, until it is put; the Bible, the origins, the store. */
export interface Env {
  readonly API_BIBLE_KEY?: string
  readonly BIBLE_ID: string
  readonly ORIGINS: string
  readonly STORE: KV
}

/** As much of a request's context as the handler uses: work that runs on after the reply. */
export interface Context {
  waitUntil(work: Promise<unknown>): void
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
 * header, so a browser elsewhere never reads a reply; every reply names its origin and varies on
 * it. A reference no case registers is refused before the store is read; a registered one the
 * store doesn't hold yet is pending. A passage that came back is cached nowhere, so each reveal
 * reaches the service (Gate 33 A2), and its view is reported after the reply, which never waits
 * for it. Nothing here reads the player's address.
 */
export async function handle(request: Request, env: Env, context: Context) {
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
  if (url.pathname !== '/passage' || url.searchParams.get('translation') !== 'NIV')
    return refuse('reference', 404, cors)
  const ref = reference(url.searchParams)
  if (ref === undefined) return refuse('reference', 400, cors)
  const name = cite(ref)
  if (!registered.has(name)) return refuse('unregistered', 404, cors)
  const copy = (await read(env.STORE))[name]?.copy
  if (copy === undefined) return refuse('pending', 503, cors)
  context.waitUntil(report(copy.token, fetch))
  return json({ verses: copy.verses }, 200, { ...cors, 'cache-control': 'no-store' })
}

export default {
  fetch: (request: Request, env: Env, context: Context) => handle(request, env, context),
  // The fill, on the schedule in wrangler.jsonc: no player's request starts it.
  scheduled: (controller: { readonly scheduledTime: number }, env: Env) =>
    fill(env.STORE, env.API_BIBLE_KEY, env.BIBLE_ID, controller.scheduledTime, fetch),
}
