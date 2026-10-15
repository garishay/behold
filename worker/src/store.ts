/**
 * The Worker's store (#3, 04c; Gate 33 A1): the verses of every registered case's passage, kept in
 * KV under one key with the FUMS token each came with, and filled on a schedule, so a player's
 * request is answered from the store and never itself reaches API.Bible (#9, Gate 19 A2). The
 * registry is the one source of what is kept, and Biblica's permission bounds it: the NIV quoted
 * up to 500 verses.
 */
import { cases } from '../../src/cases/index.ts'
import { bibleUrl, cite, parse, type Reference, type Verse } from './passage.ts'

/** The KV namespace's binding, as much of it as the store uses (wrangler.jsonc). */
export interface KV {
  get(key: string, type: 'json'): Promise<unknown>
  put(key: string, value: string): Promise<void>
}

/** How the Worker reaches API.Bible; the test hands in its own. */
export type Fetcher = (url: string, init: RequestInit) => Promise<Response>

/** A passage's copy: its verses, the FUMS token they came with, and when API.Bible gave them. */
export interface Copy {
  readonly at: number
  readonly verses: readonly Verse[]
  readonly token: string
}

/**
 * A passage in the store: when API.Bible was last asked for it, and its copy, once one has come.
 * Times are milliseconds since the epoch.
 */
export interface Entry {
  readonly asked: number
  readonly copy?: Copy
}

/** The store: each passage's entry, by its name — `1 Kings 21`, `1 Samuel 17:4-4`. */
export type Store = Readonly<Record<string, Entry>>

/** Every registered case's passage, by that name: all the store keeps, and all the Worker serves. */
export const registered: ReadonlyMap<string, Reference> = new Map(
  cases.flatMap((c) => c.structure.passages).map((p) => [cite(p), p]),
)

/** Biblica's permission: the NIV quoted up to 500 verses, which the store keeps within. */
export const BOUND = 500
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
/** A copy a week old is asked for again, so a correction at API.Bible reaches the store. */
const WEEK = 7 * DAY
/** A copy API.Bible hasn't given again in thirty days goes (Terms §11), as a device's does. */
const MONTH = 30 * DAY
/** An ask that failed waits six hours, so a failing key asks for a passage four times a day. */
const RETRY = 6 * HOUR
/**
 * The most API.Bible is asked in one fill: within the free plan's 50 requests out. The registry
 * test holds the registered passages to it, so every due passage is asked at every fill, and one
 * that keeps failing never crowds out another (#12 [Q18]).
 */
export const PER_FILL = 20

/** The store under its one key, as the fill wrote it, or an empty one before the first fill. */
export const read = async (kv: KV) => ((await kv.get('passages', 'json')) ?? {}) as Store

/** A field of an object in a reply, or nothing when the reply has no such object. */
const field = (x: unknown, key: string): unknown =>
  typeof x === 'object' && x !== null ? (x as Record<string, unknown>)[key] : undefined

/** A reference's copy as API.Bible gives it, or none when it fails, is slow, or has no verse or token. */
async function ask(ref: Reference, key: string, bible: string, now: number, fetcher: Fetcher) {
  const reply = await fetcher(bibleUrl(ref, bible), {
    headers: { 'api-key': key },
    signal: AbortSignal.timeout(8000),
  }).catch(() => undefined)
  if (reply === undefined || !reply.ok) return undefined
  const body: unknown = await reply.json().catch(() => undefined)
  const text = field(field(body, 'data'), 'content')
  const token = field(field(body, 'meta'), 'fumsToken')
  if (typeof text !== 'string' || typeof token !== 'string' || token === '') return undefined
  const verses = parse(text)
  return verses.length === 0 ? undefined : { at: now, verses, token }
}

/**
 * One fill, on the schedule (wrangler.jsonc): each registered passage with no copy, or a copy a week
 * old, is asked of API.Bible, at most twenty a fill, unless an ask for it failed in the last six
 * hours. One API.Bible doesn't answer keeps its last copy until thirty days from when it was given;
 * one no longer registered goes; and a copy that would take the store past 500 verses is not kept.
 * With no key, the fill asks no one and leaves the store as it is. The store is written only when
 * it changed.
 */
export async function fill(
  kv: KV,
  key: string | undefined,
  bible: string,
  now: number,
  fetcher: Fetcher,
  passages = registered,
) {
  if (key === undefined) return
  const old = await read(kv)
  const next: Record<string, Entry> = {}
  let asks = 0
  let total = 0
  for (const [name, ref] of passages) {
    const kept: Entry | undefined = old[name]
    const last = kept?.copy !== undefined && now - kept.copy.at < MONTH ? kept.copy : undefined
    const due =
      (last === undefined || now - last.at >= WEEK) &&
      (kept === undefined || now - kept.asked >= RETRY)
    const entry =
      due && asks++ < PER_FILL
        ? { asked: now, copy: (await ask(ref, key, bible, now, fetcher)) ?? last }
        : kept && { asked: kept.asked, copy: last }
    if (entry === undefined) continue
    const copy =
      entry.copy !== undefined && total + entry.copy.verses.length <= BOUND ? entry.copy : undefined
    next[name] = { asked: entry.asked, copy }
    total += copy?.verses.length ?? 0
  }
  if (JSON.stringify(next) !== JSON.stringify(old)) await kv.put('passages', JSON.stringify(next))
}
