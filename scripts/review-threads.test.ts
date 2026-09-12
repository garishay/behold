import { describe, expect, it } from 'vitest'
import { readThreads, report, type ThreadsPayload } from './review-threads.ts'

const thread = (
  isResolved: boolean,
  path: string,
  line: number | null,
  body: string,
  login: string | null = 'reviewer',
) => ({
  isResolved,
  path,
  line,
  comments: { nodes: [{ author: login === null ? null : { login }, body }] },
})

const payload = (nodes: ReturnType<typeof thread>[], hasNextPage = false): ThreadsPayload => ({
  data: { repository: { pullRequest: { reviewThreads: { pageInfo: { hasNextPage }, nodes } } } },
})

describe('review-threads (ported from Vigil, its #45 [G28])', () => {
  it('lists only the unresolved threads, in order, with the first line of the first comment', () => {
    const reading = readThreads(
      payload([
        thread(true, 'src/App.tsx', 12, '**Fixed already.**\nMore.'),
        thread(false, 'src/main.tsx', 15, '\n\n**The toast never closes**\n\nDetail.'),
        thread(false, 'README.md', null, 'The live URL is missing.', null),
      ]),
    )
    expect(reading).toEqual({
      more: false,
      threads: [
        {
          path: 'src/main.tsx',
          line: 15,
          author: 'reviewer',
          summary: '**The toast never closes**',
        },
        { path: 'README.md', line: null, author: 'unknown', summary: 'The live URL is missing.' },
      ],
    })
  })

  it('reads a PR with only resolved threads as clean', () => {
    expect(readThreads(payload([thread(true, 'a.ts', 1, 'done')]))).toEqual({
      threads: [],
      more: false,
    })
    expect(readThreads(payload([]))).toEqual({ threads: [], more: false })
  })

  it('refuses to read an absent PR as clean — a wrong number is a null, not an error', () => {
    expect(readThreads({})).toEqual({ refused: 'absent' })
    expect(readThreads({ data: { repository: { pullRequest: null } } })).toEqual({
      refused: 'absent',
    })
    expect(readThreads({ data: { repository: null } })).toEqual({ refused: 'absent' })
  })

  it('refuses an incomplete page — a missing or null reviewThreads, nodes, or pageInfo is not clean (#14 review)', () => {
    const withThreads = (reviewThreads: unknown) =>
      readThreads({ data: { repository: { pullRequest: { reviewThreads } } } } as ThreadsPayload)
    const page = { pageInfo: { hasNextPage: false }, nodes: [] }
    expect(withThreads(undefined)).toEqual({ refused: 'incomplete', missing: 'reviewThreads' })
    expect(withThreads(null)).toEqual({ refused: 'incomplete', missing: 'reviewThreads' })
    expect(withThreads({ ...page, nodes: undefined })).toEqual({
      refused: 'incomplete',
      missing: 'nodes',
    })
    expect(withThreads({ ...page, nodes: null })).toEqual({
      refused: 'incomplete',
      missing: 'nodes',
    })
    expect(withThreads({ ...page, pageInfo: undefined })).toEqual({
      refused: 'incomplete',
      missing: 'pageInfo',
    })
    expect(withThreads({ ...page, pageInfo: null })).toEqual({
      refused: 'incomplete',
      missing: 'pageInfo',
    })
    expect(withThreads(page)).toEqual({ threads: [], more: false })
  })

  it('says when a page was left unread rather than claiming clean over one page', () => {
    const reading = readThreads(payload([thread(true, 'a.ts', 1, 'done')], true))
    expect(reading).toEqual({ threads: [], more: true })
  })

  it('reports one line per open thread, and the clean claim when there are none', () => {
    expect(report([])).toBe('No unresolved review threads.')
    expect(
      report([
        { path: 'src/App.tsx', line: 661, author: 'reviewer', summary: 'A stale refusal.' },
        { path: 'README.md', line: null, author: 'reviewer', summary: 'Missing link.' },
      ]),
    ).toBe(
      [
        '2 unresolved review threads:',
        '  src/App.tsx:661  [reviewer] A stale refusal.',
        '  README.md:-  [reviewer] Missing link.',
      ].join('\n'),
    )
    expect(report([{ path: 'a.ts', line: 1, author: 'x', summary: 's' }]).split('\n')[0]).toBe(
      '1 unresolved review thread:',
    )
  })
})
