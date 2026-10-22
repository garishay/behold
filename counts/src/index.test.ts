// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { most } from '../../src/counted.ts'
import { handle, type D1, type Env, type Statement } from './index.ts'

const site = 'https://play.beholdgame.com'
const at = 'https://behold-counts.example.workers.dev'

/** A database that keeps what each batch bound, in order, and fails when told to. */
const db = (fails = false) => {
  const bound: (readonly (string | number)[])[] = []
  const prepared: string[] = []
  const statement = (
    values: readonly (string | number)[] = [],
  ): Statement & { values: typeof values } => ({
    values,
    bind: (...v) => statement(v),
  })
  const d1: D1 = {
    prepare: (query) => {
      prepared.push(query)
      return statement()
    },
    batch: vi.fn<D1['batch']>((statements) => {
      if (fails) return Promise.reject(new Error('D1_ERROR: limit'))
      for (const s of statements) bound.push((s as ReturnType<typeof statement>).values)
      return Promise.resolve([])
    }),
  }
  return { d1, bound, prepared }
}

const env = (d1: D1): Env => ({ ORIGINS: site, DB: d1 })

/** A beacon as the game sends it: text, with the origin the browser adds and the address Cloudflare adds. */
const post = (body: unknown, origin: string | null = site, method = 'POST', path = '/count') =>
  new Request(`${at}${path}`, {
    method,
    body: method === 'GET' ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    headers: {
      'content-type': 'text/plain;charset=UTF-8',
      'cf-connecting-ip': '203.0.113.9',
      ...(origin === null ? {} : { origin }),
    },
  })

const day = new Date('2026-11-12T23:59:30Z')

describe('the count service (#7)', () => {
  it('adds each count of a beacon to its total for the day, in one batch', async () => {
    const { d1, bound, prepared } = db()
    const beacon = [
      ['open', '', 'new', 1],
      ['case', 'valley', 'new', 1],
      ['step', 'valley', '3/<1m', 2],
    ]
    const reply = await handle(post(beacon), env(d1), day)
    expect(reply.status).toBe(204)
    expect(reply.headers.get('access-control-allow-origin')).toBe(site)
    expect(d1.batch).toHaveBeenCalledTimes(1)
    expect(bound).toEqual([
      ['2026-11-12', 'open', '', 'new', 1],
      ['2026-11-12', 'case', 'valley', 'new', 1],
      ['2026-11-12', 'step', 'valley', '3/<1m', 2],
    ])
    expect(prepared[0]).toMatch(
      /ON CONFLICT \(day, name, at, detail\) DO UPDATE SET n = n \+ excluded\.n/,
    )
  })

  it('refuses another origin, or none, with no CORS header, and keeps nothing', async () => {
    for (const origin of ['https://example.com', null]) {
      const { d1 } = db()
      const reply = await handle(post([['open', '', 'new', 1]], origin), env(d1), day)
      expect(reply.status).toBe(403)
      expect(reply.headers.get('access-control-allow-origin')).toBeNull()
      expect(d1.batch).not.toHaveBeenCalled()
    }
  })

  it('takes only a POST to /count', async () => {
    const { d1 } = db()
    expect((await handle(post(null, site, 'GET'), env(d1), day)).status).toBe(405)
    expect(
      (await handle(post([['open', '', 'new', 1]], site, 'POST', '/'), env(d1), day)).status,
    ).toBe(404)
    expect(d1.batch).not.toHaveBeenCalled()
  })

  it('refuses a beacon whole for one count the game never sends, and keeps nothing of it', async () => {
    const good = ['open', '', 'new', 1]
    const bad = [
      'not json',
      [],
      {},
      [good, ['who', '', 'new', 1]],
      [good, ['case', 'Valley', 'new', 1]],
      [good, ['case', 'valley', 'a detail far longer than any the game sends, by far', 1]],
      [good, ['case', 'valley', 'new', 0]],
      [good, ['case', 'valley', 'new', 1.5]],
      [good, ['case', 'valley', 'new', most.each + 1]],
      [good, ['case', 'valley', 'new']],
      Array.from({ length: most.counts + 1 }, () => good),
    ]
    for (const beacon of bad) {
      const { d1 } = db()
      const reply = await handle(post(beacon), env(d1), day)
      expect(reply.status, JSON.stringify(beacon).slice(0, 60)).toBe(400)
      expect(d1.batch).not.toHaveBeenCalled()
    }
  })

  it('lets a beacon go when the database refuses it, the day’s writes spent', async () => {
    const { d1 } = db(true)
    const reply = await handle(post([['open', '', 'back', 1]]), env(d1), day)
    expect(reply.status).toBe(503)
  })

  it('never reads the player’s address', async () => {
    const { d1 } = db()
    const request = post([['open', '', 'new', 1]])
    const read = vi.spyOn(request.headers, 'get')
    await handle(request, env(d1), day)
    expect(read.mock.calls.map(([name]) => name.toLowerCase())).toEqual(['origin'])
  })
})
