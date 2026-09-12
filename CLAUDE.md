# CLAUDE.md

Behold is a Bible mystery game for the phone: each case is a passage, and the player studies the
pictures of its moments, works out who is who and what happened, and fills the blanks of the
account before the reveal shows the text itself. The world rules — the accuracy and art
constraints every picture and every case is checked against — are `docs/world-rules.md`. The
owner's operating model lives in the user-level CLAUDE.md; this file holds what is Behold's.

## Guardrails (non-negotiable)

- **Scripture is fetched, never shipped.** Case scripture appears verbatim only in the reveal,
  fetched from the translation service at display time — never in the repo or the bundle. The one
  exception is the title screen's epigraph and its notice (Gate 01 A6), which ship in the bundle
  as app copy; the exception is about shipping the verse, not where it sits.
- **Nothing the player reads lives in code.** Two kinds of player text, both data: case content —
  every caption, document, sentence, word-bank word, and hint — in case files keyed by id, one
  file per language, the case-file gate's job (#4); and app copy — the interface's own words, the
  title screen's and the toast's included — in one keyed strings module, `src/strings/en.ts`, a
  sibling per language later. A component renders by key and carries no sentence of its own.
- **The ESV token exists only in the password manager and the Worker's secret store** — never in
  the repo, a chat, or the app.

## Stack and commands

Vite · React · TypeScript (strict) · vite-plugin-pwa · Vitest · ESLint · Prettier. Scripts are
Node; there is no Python on the dev machine.

`npm run dev` · `npm run build` · `npm run lint` · `npm run format:check` · `npm run typecheck` ·
`npm run test` · `npm run icons` · `npm run review:threads -- <pr>`

CI runs lint (the conflict-marker scan first, then ESLint, then the Prettier check), typecheck,
test, and build on every PR push; the four are the required checks on `main`. Red CI is a stop.
Every push to `main` deploys to GitHub Pages.

## Conventions

- Every PR starts as a GitHub Issue: feature PRs carry a mini-PRD (user story, acceptance
  criteria); cleanup PRs bundle owner-routed Issues. An agent-filed Issue declares its origin in
  its first line; the owner's routing comment makes it bundle-eligible.
- Branch `feat/pr-01b-pwa-deploy` — kind, PR number, short slug. Conventional-ish commit subjects,
  imperative mood. Squash-merge and branch deletion are repo settings. A pushed branch is never
  rebased: it updates by merging `main`, and the squash absorbs the merge commit.
- A PR body uses a closing keyword only for an Issue the merge is meant to close, and says nothing
  else with one — GitHub reads "does not close #1" as `close #1`. A PR that leaves its gate open
  says "leaves #1 open."
- Size: ~400 implementation lines is a gate-time estimate check, not a rule at open. The gate
  estimate lists App wiring and CSS as their own rows, states the actual-to-estimate ratio of the
  last three merged feature PRs — pooled: the three actuals summed over the three estimates, never
  a mean of three ratios; 1.0 with no history, 257 / 150 ≈ 1.7 from #11 alone at Gate 01 — and
  scales its total by it; the ~400 check runs on the scaled number.
  The budget counts implementation only. Tests, comments, and fixtures sit outside it — a size
  target that discourages any of the three is buying small diffs with the things that make the
  diff trustworthy — but they are reported, not ignored. Implementation is counted one way at the
  gate and at open: insertions in non-test source, comments and blanks excluded, new files
  included. At open the PR reports raw / implementation / tests, the deltas by file, and a reading
  order. Growth past the scaled cap mid-build is a budget change: stop and re-gate. Once built and
  verified, reviewability decides; no post-hoc split.
- One test per behavior change. A test paired with a fix is shown failing on the pre-fix code,
  and the PR or the thread reply says so; a test that cannot tell the fix from the code before it
  is disclosed as pinning the shape instead. No dead code, no `console` noise.
- Never type the reviewer's mention in an Issue or a comment unless a run is wanted, and then only
  on the PR it should act on; write "the review mention."

## The path

Every PR walks the same path:

1. **AI code review** — automatic on PR open; the review mention for a re-run. The reviewer is
   not the merge authority and its checks are not the gate — step 2 is.
2. **Automated tests** — CI must be green; red CI is a stop, not a suggestion.
3. **Engineering review** — self-review with the checklist below, on the GitHub diff, not in the
   editor.
4. **Comments + iteration** — reply to every review comment with a fix or a reasoned "won't fix."
5. **Merge** — squash-merge, delete branch.

**Self-review checklist:** read the full diff cold; run the app and exercise the change; check
every acceptance criterion of the originating Issue(s); at least one test per behavior change, and
a test paired with a fix shown failing on the pre-fix code; no dead code or console noise.

## Review

Codex's hosted review is this repository's reviewer, running on PR open under the owner's account
and reading `AGENTS.md`, which points it at this file. Its receipt takes two forms: the thumbs-up
reaction with no comment when it found nothing, and a "Codex Review" comment with inline threads
when it has findings. Eyes means it is still reading; no reaction means it did not run, and the
review mention on the PR starts it. The thread rule and closure below do not change with the
reviewer.

## The plan gate

Every PR is planned and approved before it is built. Read the notes on every open Issue, not just
the target — rulings get parked on the Issue they will land in — and mark each as a **ruling** or
an **assumption**, saying which when parking a note of your own. User-visible work brings a
mockup; the mockup in the plan comment on the PR's Issue is the referent for what is approved. A
gate checks every invariant it claims against its own mockup's numbers before it posts — the
wording against the ruling, the arithmetic against the table — and shows the check. A cleanup PR
bundling owner-routed Issues at ≤50 implementation lines is pre-approved by those Issues, mockup
included; one that outgrows its cap stops and queues, with the split or a raised cap as the
options.

Mid-build, judge a deviation by what it touches. One that changes neither the approved design nor
the budget: flag it, keep going, disclose it at open. One that changes either: stop and re-gate on
the adjudication queue with the conflict, the proposed change, and the revised estimate. A ruling
names an outcome and a means: when the ruled means cannot meet the ruled outcome, the lane builds
the smallest change that does, discloses it with the alternative and an opt-out, and proceeds; a
change that moves the outcome stops and re-gates.

## Decision rights

Plan gates, closure declarations, and merges are the owner's alone.

**Precedence, when two rules apply:** an owner ruling on the item; the PR's own plan-gate approval
or closure declaration; a rule naming the case; the proceed list; the stop-and-queue list. A case
nothing above matches is queued.

**Proceed without asking — log it on the PR thread:** review-round triage, read from the PR's
inline review threads as well as its comments — the comment view misses the threads, an unresolved
one blocks the merge, and `npm run review:threads -- <pr>` lists them before a round is reported
clean; thread reconciliation; filing follow-up Issues; branch updates and changelog conflicts in
the known ordering; retriggering CI; fixes to factual errors within the approved design and
budget; cleanup PRs of routed Issues at ≤50 lines.

**Stop and queue** — append to the pinned Adjudication queue, **#12**, with options and a
recommendation; the queued item waits, unrelated work continues: any change to what a user sees
beyond the approved mockup, on-screen wording included; scope adds or cuts; data provenance,
privacy, licensing, a new dependency, any new network call; design or budget changes mid-build;
conflicts between doc rules; changes to review tooling; a collision between rulings that
precedence does not settle. The owner answers the queue in batches. A lane whose open PR is
blocked on the queue waits; idle is acceptable.

**Closure and factual errors:** the review loop ends when the owner declares closure. After it,
findings become follow-up Issues — except a factual error (a broken requirement or wrong
behavior), which is fixed in the PR that finds it when it lies in that PR's files, still blocking
its merge, and otherwise filed as a blocking follow-up the owning lane takes next.

**Thread resolution:** the lane resolves a thread it answered with a fix once a CI run on that
head exists and passed — a conflicting branch runs none, and "no checks reported" is not green —
and any thread whose reply cites an owner ruling by ID. The round that produced the fix is the
last round unless the owner calls another, and a called round can reopen. Won't-fix and
no-code-change judgment threads are the owner's to resolve.

**Cadence:** governance text is revised in batches. Findings against it that are not factual
errors file to the standing Governance revisions Issue, **#13**, and land in the next governance
PR, never per-round; a factual error follows the factual-error rule.

## Lanes

One session and one git worktree per lane; one open PR per lane. A session's first act is to check
out `main` and pull: the hook and the rulebook are the checkout's. Surfaces are disjoint by default
— features to Lane A, scripts and docs to Lane B — but routing beats default: the lane holding an
Issue owns every file its fix touches for the life of that PR, unless the other lane has an open
PR touching that file, in which case the file is claimed on the queue. New files belong to the PR
that creates them. The lane whose PR merges second reconciles: the changelog in its known ordering
(versions newest first, entries within a version by PR number, lead sentence maintained),
renumbering its own entry to the next free version if both lanes reserved the same one. Changelog
entries are written while the PR they record is open, at merge-time reconciliation, or as a
doc-only fix repairing a merged entry's ordering or a factual error.

## Enforced, not written

`main` is branch-protected: PR required, the four CI jobs required with the branch up to date,
squash the only merge, review threads resolved, no bypass. Secret scanning with push protection is
on. `scripts/review-threads.ts` lists a PR's unresolved inline review threads and exits non-zero
while any remain — and refuses, rather than reads as clean, a payload with no pull request or an
incomplete page — so "clean" is a computed claim. A PreToolUse hook in `.claude/settings.json`,
`scripts/tool-guard.ts`, blocks pushes to `main`, force pushes, and dependency adds — a dependency
is asked for on the queue — and blocks what it cannot judge, naming the error, so it never fails
open. If a hook blocks something you believe is right, stop and queue it; do not work around it.
