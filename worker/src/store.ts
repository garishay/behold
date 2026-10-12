/**
 * The Worker's store (#3, 04c): the verses of every registered case's passage, kept in KV under
 * one key and filled on a schedule, so a player's request is answered from the store and never
 * itself reaches the ESV (#9, Gate 19 A2). The registry is the one source of what is kept, and
 * the ESV's fourth condition bounds it: no more than 500 verses stored locally.
 */
import { cases } from '../../src/cases/index.ts'
import { esvUrl, parse, query, type Reference, type Verse } from './passage.ts'

/** The KV namespace's binding, as much of it as the store uses (wrangler.jsonc). */
export interface KV {
  get(key: string, type: 'json'): Promise<unknown>
  put(key: string, value: string): Promise<void>
}

/** How the fill reaches the ESV; the test hands in its own. */
export type Fetcher = (url: string, init: RequestInit) => Promise<Response>

/** A passage kept: its verses, and when the ESV gave them, in milliseconds since the epoch. */
export interface Kept {
  readonly at: number
  readonly verses: readonly Verse[]
}

/** The store: each passage kept, by the ESV's own name for it — `1 Kings 21`, `1 Samuel 17:4-4`. */
export type Store = Readonly<Record<string, Kept>>

/** Every registered case's passage, by that name: all the store keeps, and all the Worker serves. */
export const registered: ReadonlyMap<string, Reference> = new Map(
  cases.flatMap((c) => c.structure.passages).map((p) => [query(p), p]),
)

/** The ESV's fourth condition: no more than 500 verses stored locally. */
export const BOUND = 500
/** A passage kept a day is asked for again, so a correction at the ESV reaches the store. */
const DAY = 24 * 60 * 60 * 1000
/** A copy the ESV hasn't given again in thirty days goes, as a device's copy does (Gate 04 A4). */
const MONTH = 30 * DAY
/**
 * The most the ESV is asked in one fill: under its 60 a minute, and the free plan's 50 requests out.
 * The registry test holds the registered passages to it, so every due passage is asked at every
 * fill, and one that keeps failing never crowds out another (#12 [Q18]).
 */
export const PER_FILL = 20

/** The store under its one key, as the fill wrote it, or an empty one before the first fill. */
export const read = async (kv: KV) => ((await kv.get('passages', 'json')) ?? {}) as Store

/** The one passage in the ESV's reply, when the reply has the endpoint's shape. */
const passage = (reply: unknown): string | undefined => {
  if (typeof reply !== 'object' || reply === null || !('passages' in reply)) return undefined
  const first: unknown = Array.isArray(reply.passages) ? reply.passages[0] : undefined
  return typeof first === 'string' ? first : undefined
}

/** A reference's verses as the ESV gives them, or none when it fails, is slow, or has no verse. */
async function ask(ref: Reference, token: string, fetcher: Fetcher) {
  const reply = await fetcher(esvUrl(ref), {
    headers: { authorization: `Token ${token}` },
    signal: AbortSignal.timeout(8000),
  }).catch(() => undefined)
  if (reply === undefined || !reply.ok) return undefined
  const text = passage(await reply.json().catch(() => undefined))
  const verses = text === undefined ? [] : parse(text)
  return verses.length === 0 ? undefined : verses
}

/**
 * One fill, on the schedule (wrangler.jsonc): each registered passage the store lacks, or has kept
 * a day, is asked of the ESV, at most twenty a fill; one the ESV doesn't answer keeps its last
 * copy for up to thirty days; one no longer registered goes; and one that would take the store
 * past 500 verses is not kept. The store is written only when it changed.
 */
export async function fill(
  kv: KV,
  token: string,
  now: number,
  fetcher: Fetcher,
  passages = registered,
) {
  const old = await read(kv)
  const next: Record<string, Kept> = {}
  let asked = 0
  let total = 0
  for (const [name, ref] of passages) {
    const kept: Kept | undefined = old[name]
    const due = kept === undefined || now - kept.at >= DAY
    const verses = due && asked++ < PER_FILL ? await ask(ref, token, fetcher) : undefined
    const last = kept !== undefined && now - kept.at < MONTH ? kept : undefined
    const entry = verses === undefined ? last : { at: now, verses }
    if (entry === undefined || total + entry.verses.length > BOUND) continue
    next[name] = entry
    total += entry.verses.length
  }
  if (JSON.stringify(next) !== JSON.stringify(old)) await kv.put('passages', JSON.stringify(next))
}
