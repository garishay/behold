/**
 * Lists a pull request's unresolved inline review threads (CLAUDE.md, "Enforced, not written").
 * Ported from Vigil, where it was its #45 [G28]. `gh pr view` shows a PR's conversation and misses
 * the threads on its Files tab, and an unresolved thread blocks the merge — so "clean" is a
 * computed claim rather than a recollection: this prints every open thread with its file, line,
 * author, and first line, and exits 1 while any remain, 0 when none do.
 *
 *   node scripts/review-threads.ts <pr-number>
 *
 * The reading is a pure function of the GraphQL payload, so the test feeds it payloads and
 * never reaches the network; the two calls — `gh` for the repository's name, then for the
 * threads — are made only by `main`. The clean claim is refused rather than faked (Vigil's #97
 * review; #14 review): a PR the API does not return — a wrong number, or one the token cannot
 * read — a page with `reviewThreads`, `nodes`, or `pageInfo` missing or null, as a field-level
 * error leaves it, and a PR with more threads than the one page read all exit 2 and say so, since
 * a computed "clean" over a payload that never described the PR's threads is the failure the
 * script exists to prevent. The exit code is set, not forced, so a piped listing is not cut off.
 */

import { execFileSync } from 'node:child_process'
import { basename } from 'node:path'

export interface ReviewThread {
  path: string
  line: number | null
  author: string
  /** The first non-empty line of the thread's first comment. */
  summary: string
}

interface ThreadNode {
  isResolved: boolean
  path: string
  line: number | null
  comments: { nodes: { author: { login: string } | null; body: string }[] }
}

export interface ThreadsPayload {
  data?: {
    repository?: {
      pullRequest?: {
        reviewThreads?: {
          pageInfo?: { hasNextPage: boolean } | null
          nodes?: ThreadNode[] | null
        } | null
      } | null
    } | null
  }
}

/** What one page of the API says: the open threads, and whether a page was left unread. */
export interface ThreadsReading {
  threads: ReviewThread[]
  more: boolean
}

/**
 * Why a payload was not read: it holds no pull request at all — the API answers a wrong number
 * or an unreadable PR with a null, not an error — or its thread page is incomplete, a field
 * missing or nulled by a field-level error. Neither is "clean".
 */
export interface ThreadsRefusal {
  refused: 'absent' | 'incomplete'
  missing?: 'reviewThreads' | 'nodes' | 'pageInfo'
}

/** The reading of a payload, or the refusal. */
export function readThreads(payload: ThreadsPayload): ThreadsReading | ThreadsRefusal {
  const pullRequest = payload.data?.repository?.pullRequest
  if (!pullRequest) return { refused: 'absent' }
  const page = pullRequest.reviewThreads
  if (!page) return { refused: 'incomplete', missing: 'reviewThreads' }
  if (!page.nodes) return { refused: 'incomplete', missing: 'nodes' }
  if (!page.pageInfo) return { refused: 'incomplete', missing: 'pageInfo' }
  const threads = page.nodes
    .filter((thread) => !thread.isResolved)
    .map((thread) => {
      const first = thread.comments.nodes[0]
      return {
        path: thread.path,
        line: thread.line,
        author: first?.author?.login ?? 'unknown',
        summary:
          (first?.body ?? '')
            .split('\n')
            .find((line) => line.trim() !== '')
            ?.trim() ?? '',
      }
    })
  return { threads, more: page.pageInfo.hasNextPage }
}

/** One line per thread, or the clean claim. */
export function report(threads: readonly ReviewThread[]): string {
  if (threads.length === 0) return 'No unresolved review threads.'
  return [
    `${threads.length} unresolved review thread${threads.length === 1 ? '' : 's'}:`,
    ...threads.map((t) => `  ${t.path}:${t.line ?? '-'}  [${t.author}] ${t.summary}`),
  ].join('\n')
}

const PAGE = 100

const QUERY = `query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: ${PAGE}) {
        pageInfo { hasNextPage }
        nodes { isResolved path line comments(first: 1) { nodes { author { login } body } } }
      }
    }
  }
}`

function main(): void {
  const number = Number(process.argv[2])
  if (!Number.isInteger(number) || number <= 0) {
    process.stderr.write('usage: node scripts/review-threads.ts <pr-number>\n')
    process.exitCode = 2
    return
  }
  const repo = JSON.parse(
    execFileSync('gh', ['repo', 'view', '--json', 'nameWithOwner'], { encoding: 'utf8' }),
  ) as { nameWithOwner: string }
  const [owner, name] = repo.nameWithOwner.split('/')
  // `gh` exits non-zero when the API attaches an error — a wrong number does — and still hands
  // the payload back on stdout; the null pull request in it is the reading, not the crash.
  let raw: string
  try {
    raw = execFileSync(
      'gh',
      [
        'api',
        'graphql',
        '-f',
        `query=${QUERY}`,
        '-f',
        `owner=${owner}`,
        '-f',
        `name=${name}`,
        '-F',
        `number=${number}`,
      ],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    )
  } catch (error) {
    raw = String((error as { stdout?: string }).stdout ?? '')
  }
  let payload: ThreadsPayload
  try {
    payload = JSON.parse(raw) as ThreadsPayload
  } catch {
    process.stderr.write(`gh returned no readable payload for PR #${number}.\n`)
    process.exitCode = 2
    return
  }
  const reading = readThreads(payload)
  if ('refused' in reading) {
    process.stderr.write(
      reading.refused === 'absent'
        ? `PR #${number} not found in ${repo.nameWithOwner}.\n`
        : `PR #${number}: the API returned its review threads with no ${reading.missing}; the payload is incomplete, so this will not claim clean.\n`,
    )
    process.exitCode = 2
    return
  }
  if (reading.more) {
    process.stderr.write(
      `PR #${number} has more than ${PAGE} review threads; this reads one page, so it will not claim clean.\n`,
    )
    process.exitCode = 2
    return
  }
  process.stdout.write(`${report(reading.threads)}\n`)
  process.exitCode = reading.threads.length === 0 ? 0 : 1
}

if (process.argv[1] && basename(process.argv[1]) === 'review-threads.ts') main()
