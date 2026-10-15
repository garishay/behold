/**
 * A view reported to API.Bible's Fair Use Management System (Terms §14; Gate 33 A1): one GET to
 * fums.api.bible with the token the passage's copy came with, and a device ID and a session ID made
 * at random for that one view and kept nowhere. Nothing is batched, so nothing waits in storage.
 *
 * fums.api.bible is outside Cloudflare, and Cloudflare would put the player's address in two
 * headers of a request that a player's own request sets off there (Gate 19 A2). Its reference lets
 * a Worker set both on such a request, so the report names the address Cloudflare gives a Worker's
 * own requests in their place, and carries nothing about the player.
 */
import type { Fetcher } from './store.ts'

/** The address Cloudflare gives a Worker's request to another of its zones. */
const WORKER = '2a06:98c0:3600::103'

/** The report's URL: the token, and two IDs made for this one view. */
export const fumsUrl = (token: string) =>
  'https://fums.api.bible/f3?' +
  new URLSearchParams({ t: token, dId: crypto.randomUUID(), sId: crypto.randomUUID() }).toString()

/** One view reported; a report that fails is let go, since nothing is kept to send it again. */
export const report = (token: string, fetcher: Fetcher) =>
  fetcher(fumsUrl(token), {
    headers: { 'cf-connecting-ip': WORKER, 'x-real-ip': WORKER },
    signal: AbortSignal.timeout(8000),
  }).then(
    () => undefined,
    () => undefined,
  )
