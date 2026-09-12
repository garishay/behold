/**
 * PreToolUse hook (CLAUDE.md, "Enforced, not written"): blocks a shell command that would push to
 * `main`, force-push, or add a dependency — the three rules Enforced-not-written names. Wired by
 * `.claude/settings.json` for the Bash and PowerShell tools; Claude Code feeds the tool call as
 * JSON on stdin, and an exit code of 2 blocks the call and hands stderr back as the reason.
 *
 * The judgement is a pure function of the command text and the current branch, so the test can
 * drive it directly. A quoted string is judged as a command of its own unless it sits in a prose
 * position — the value of `-m`, `--body`, `--title`, or a heredoc body — so a PR description that
 * *mentions* `git push origin main` is not a push, while `bash -c "git push origin main"` and
 * `echo "$(git push origin main)"` are (#15 review). A guard that cannot judge a command blocks it
 * and says so — a quote it cannot place, a command that is a variable or a substitution's output,
 * an executor handed a variable, an encoded command, or its stdin, a bare push after a branch or
 * directory change, a refspec it cannot read, a package-manager subcommand it cannot locate —
 * since a hook that crashes exits non-blocking, and this one must never fail open.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

/** Why a command is blocked, or null when it may run. */
export function judge(command: string, currentBranch: string): string | null {
  const text = withoutHeredocProse(command)
  return judgeText(text, currentBranch, changesBranchOrDirectory(text), true)
}

/**
 * Heredoc bodies are prose and come out before judging (the terminator may be indented after
 * `<<-`) — unless the delimiter is unquoted and the body carries a substitution, which the shell
 * would expand: that body stays in and is judged.
 */
function withoutHeredocProse(command: string): string {
  return command.replace(
    /<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1[^\n]*\n([\s\S]*?)\n[ \t]*\2(?=\n|$)/g,
    (_, quote: string, _delimiter: string, body: string) =>
      quote === '' && /\$\(|`/.test(body) ? body : '',
  )
}

/** A branch or directory change anywhere in the command makes a bare push unjudgeable. */
function changesBranchOrDirectory(text: string): boolean {
  return /(^|[\s;&|(`])((cd|pushd|popd|sl|Set-Location|Push-Location)(\s|$)|git\s+(-C\s|--git-dir|--work-tree|switch(\s|$)|checkout(\s|$)))/m.test(
    text,
  )
}

interface Token {
  text: string
  /** Built from a quoted string, in whole or in part. */
  quoted: boolean
}

interface Segment {
  tokens: Token[]
  /** Opened by `$(` or a backtick where a command name would go: its output runs. */
  substitutionAsCommand: boolean
}

/**
 * The command split at the shell separators — `&&`, `||`, `;`, `|`, a newline, parentheses, `$(`,
 * a backtick — into tokens; a quoted string becomes one token that keeps its inner text and its
 * quotedness, so `git push origin "main"` still says `main`. Null on a quote that never closes.
 * In `plain` mode quotes are ordinary characters, for text that is not itself well-formed shell.
 */
function tokenize(text: string, plain: boolean): Segment[] | null {
  const segments: Segment[] = []
  let segment: Segment = { tokens: [], substitutionAsCommand: false }
  let current = ''
  let quoted = false
  let open = false
  const endToken = () => {
    if (open) segment.tokens.push({ text: current, quoted })
    current = ''
    quoted = false
    open = false
  }
  const endSegment = (substitutionAsCommand = false) => {
    endToken()
    if (segment.tokens.length > 0) segments.push(segment)
    segment = { tokens: [], substitutionAsCommand }
  }
  for (let i = 0; i < text.length;) {
    const ch = text[i]
    if (!plain && ch === "'") {
      const end = text.indexOf("'", i + 1)
      if (end < 0) return null
      current += text.slice(i + 1, end)
      quoted = open = true
      i = end + 1
    } else if (!plain && ch === '"') {
      let j = i + 1
      for (; j < text.length && text[j] !== '"'; j++) {
        if (text[j] === '\\' && '"\\$`'.includes(text[j + 1] ?? '')) j++
        current += text[j]
      }
      if (j >= text.length) return null
      quoted = open = true
      i = j + 1
    } else if (ch === '\\' && i + 1 < text.length) {
      current += text[i + 1]
      open = true
      i += 2
    } else if (text.startsWith('$(', i) || ch === '`') {
      endSegment(!open && segment.tokens.length === 0)
      i += ch === '`' ? 1 : 2
    } else if (text.startsWith('&&', i) || text.startsWith('||', i)) {
      endSegment()
      i += 2
    } else if (';|\n()'.includes(ch)) {
      endSegment()
      i += 1
    } else if (/\s/.test(ch)) {
      endToken()
      i += 1
    } else {
      current += ch
      open = true
      i += 1
    }
  }
  endSegment()
  return segments
}

/** A word list, written as one string so the table reads as a table. */
const list = (words: string) => new Set(words.split(' '))

/** Options whose value is prose — a message, a body, a title — never a command. */
const PROSE_OPTIONS = list('-m --message -b --body -t --title --notes')
const PROSE_ASSIGNMENT = /^(--message|--body|--title|--notes|-m|-b|-t)=/

/** Words that only hand the command on: the command word is the first after them. */
const WRAPPERS = list('sudo doas env time nohup nice command exec xargs')

/** The index of the word that names the command: past environment assignments and wrappers. */
function commandIndex(words: string[]): number {
  let i = 0
  while (i < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i])) i++
  while (i < words.length && WRAPPERS.has(words[i])) {
    i++
    while (i < words.length && words[i].startsWith('-')) i++
  }
  return i
}

const UNPLACED =
  'Blocked: tool-guard could not place a quoted string — a quote never closes. Fix the command before working around it.'
const PLAINLY = 'Write the command plainly.'

function judgeText(text: string, branch: string, switched: boolean, top: boolean): string | null {
  let segments = tokenize(text, false)
  if (!segments) {
    if (top) return UNPLACED
    // A string that is not itself well-formed shell — an apostrophe in prose, JSON — is read with
    // its quotes as plain characters, so its words are still judged.
    segments = tokenize(text, true) ?? []
  }
  for (const segment of segments) {
    if (top && segment.substitutionAsCommand)
      return `Blocked: tool-guard cannot judge a command that is a substitution's output. ${PLAINLY}`
    const words: string[] = []
    for (const [i, token] of segment.tokens.entries()) {
      if (token.quoted) {
        const prose =
          PROSE_OPTIONS.has(segment.tokens[i - 1]?.text ?? '') || PROSE_ASSIGNMENT.test(token.text)
        // Prose is blanked — unless a substitution inside it would run.
        if (prose && !/\$\(|`/.test(token.text)) {
          words.push('""')
          continue
        }
        if (/\s/.test(token.text)) {
          const inner = judgeText(token.text, branch, switched, false)
          if (inner) return inner
          words.push('""')
          continue
        }
      }
      words.push(token.text)
    }
    const command = words[commandIndex(words)]
    if (top && command !== undefined && (command.startsWith('$') || command === '""'))
      return `Blocked: tool-guard cannot judge a command whose name is a variable or a quoted string. ${PLAINLY}`
    const reason =
      judgeExecutor(segment.tokens, words) ??
      judgePush(words, branch, switched) ??
      judgeDependencyAdd(words)
    if (reason) return reason
  }
  return null
}

/**
 * Programs that run a string handed to them, with the options that carry it. PowerShell's options
 * abbreviate and ignore case, so they are matched by prefix instead.
 */
const EXECUTORS: Record<string, string[]> = {
  sh: ['-c'],
  bash: ['-c'],
  zsh: ['-c'],
  dash: ['-c'],
  ksh: ['-c'],
  cmd: ['/c', '/C', '/k', '/K'],
  node: ['-e', '--eval', '-p', '--print'],
  python: ['-c'],
  python3: ['-c'],
  perl: ['-e', '-E'],
  ruby: ['-e'],
  pwsh: [],
  powershell: [],
  eval: [],
}
const POWERSHELL = list('pwsh powershell')
const TERMINAL = list('-v -V --version -h --help -?')

/** A string the guard cannot read as a command: empty, a variable, or carrying a substitution. */
const unreadable = (token: Token) =>
  token.text === '' || token.text.startsWith('$') || /\$\(|`/.test(token.text)

function judgeExecutor(tokens: Token[], words: string[]): string | null {
  const at = words.findIndex((word) => Object.hasOwn(EXECUTORS, word))
  if (at < 0) return null
  const exe = words[at]
  const rest = tokens.slice(at + 1)
  const cannot = (what: string) =>
    `Blocked: tool-guard cannot judge what ${exe} would run — ${what}. ${PLAINLY}`
  // A literal handed to an executor was judged as a command when its token was read; what is
  // left to refuse is a string the guard could not read at all.
  if (exe === 'eval') return rest.some(unreadable) ? cannot('a variable or a substitution') : null
  for (const [i, token] of rest.entries()) {
    const option = token.text
    const abbreviated =
      POWERSHELL.has(exe) && option.startsWith('-') ? option.slice(1).toLowerCase() : ''
    if (abbreviated !== '' && 'encodedcommand'.startsWith(abbreviated))
      return cannot('an encoded command')
    if (
      (abbreviated !== '' && 'command'.startsWith(abbreviated)) ||
      EXECUTORS[exe].includes(option)
    ) {
      const code = rest[i + 1]
      if (!code) return cannot('nothing follows the option')
      return unreadable(code) ? cannot('the command is a variable or a substitution') : null
    }
  }
  // No code option: a script argument runs that; none, and the executor reads its commands from
  // stdin — judged only where the executor is the command itself, since `which node` names it too.
  if (at !== commandIndex(words)) return null
  const argument = rest.some((token) => !/^[-/]/.test(token.text))
  const terminal = rest.some((token) => TERMINAL.has(token.text))
  return argument || terminal ? null : cannot('it would read its commands from stdin')
}

/** Git's global options that take a separate value, which must be skipped with them. */
const GIT_VALUE_OPTIONS = list('-C -c --git-dir --work-tree --namespace --exec-path')

/** The words after `git <subcommand>`, or null when the segment is not that git subcommand. */
function gitArgs(words: string[], subcommand: string): string[] | null {
  const at = words.indexOf('git')
  if (at < 0) return null
  let i = at + 1
  while (i < words.length && words[i].startsWith('-')) {
    i += GIT_VALUE_OPTIONS.has(words[i]) ? 2 : 1
  }
  return words[i] === subcommand ? words.slice(i + 1) : null
}

function judgePush(words: string[], currentBranch: string, switched: boolean): string | null {
  const args = gitArgs(words, 'push')
  if (!args) return null
  const flags = args.filter((word) => word.startsWith('-'))
  const positional = args.filter((word) => !word.startsWith('-'))
  const isForce = (flag: string) =>
    /^(-[A-Za-z0-9]*f[A-Za-z0-9]*|--force|--force-with-lease(=.*)?|--force-if-includes|--mirror)$/.test(
      flag,
    )
  if (flags.some(isForce))
    return 'Blocked: force push. History on a shared branch is not rewritten.'
  if (positional.some((word) => word.startsWith('+')))
    return 'Blocked: force push (a + refspec). History on a shared branch is not rewritten.'
  const refspecs = positional.slice(1)
  if (refspecs.some((word) => /[$`{}]/.test(word) || word === '""'))
    return 'Blocked: push with a refspec the guard cannot read — a variable, a substitution, or a placeholder. Name the branch.'
  const everyBranch = flags.some((flag) => flag === '--all' || flag === '--branches')
  if (refspecs.length === 0 && !everyBranch && switched)
    return 'Blocked: a bare push after a branch or directory change cannot be judged from the current branch. Name the refspec.'
  const destination = (refspec: string) => {
    const target = refspec.includes(':') ? refspec.slice(refspec.indexOf(':') + 1) : refspec
    return target === 'HEAD' || target === '@' ? currentBranch : target
  }
  const targetsMain = (refspec: string) =>
    ['main', 'refs/heads/main'].includes(destination(refspec))
  if (
    refspecs.some(targetsMain) ||
    everyBranch ||
    (refspecs.length === 0 && currentBranch === 'main')
  )
    return 'Blocked: push to main. Work on a branch and open a PR; main is merged only through one.'
  return null
}

interface Manager {
  /** Subcommands that add a dependency when given a package name. */
  adders: Set<string>
  /** The rest of the manager's subcommands; a word that is neither cannot be located. */
  others: Set<string>
  /** Options that take a separate value, skipped with it when they come before the subcommand. */
  valued: Set<string>
}

const MANAGERS: Record<string, Manager> = {
  npm: {
    adders: list(
      'install i in ins inst insta instal isntall add install-test it install-ci-test cit link ln',
    ),
    others: list(
      'access adduser audit bugs cache ci clean-install completion config c create dedupe ddp deprecate diff dist-tag docs doctor edit exec x explain why explore find-dupes fund get help help-search home info init innit issues la list ll login logout ls org outdated owner pack ping pkg prefix profile prune publish query r rb rebuild remove repo restart rm root run run-script rum s sbom se search set show shrinkwrap star stars start stop t team test token tst un uninstall unlink unpublish unstar up update upgrade urn v version view whoami',
    ),
    valued: list(
      '--prefix -C --registry --userconfig --globalconfig --cache --loglevel --tag --otp --scope --workspace -w --script-shell --depth --omit --include --access --proxy --https-proxy --before --cafile --auth-type',
    ),
  },
  pnpm: {
    adders: list('add install i link ln'),
    others: list(
      'approve-builds audit bin cat-file cat-index config c create dedupe deploy dlx doctor env exec fetch find-hash help ignored-builds import init install-test it licenses list ls outdated pack patch patch-commit patch-remove prune publish rebuild rb remove rm root run run-script self-update server setup start store test t uninstall un unlink update up upgrade why',
    ),
    valued: list(
      '--dir -C --filter -F --prefix --registry --loglevel --store-dir --virtual-store-dir --modules-dir --lockfile-dir --config --reporter --workspace-concurrency --fetch-retries --network-concurrency',
    ),
  },
  yarn: {
    adders: list('add'),
    others: list(
      'audit autoclean bin cache check config constraints create dedupe dlx exec explain generate-lock-entry global help import info init install licenses link list login logout node npm outdated owner pack patch patch-commit plugin policies prune publish rebuild remove run search self-update set stage tag team test unlink unplug up upgrade upgrade-interactive version versions why workspace workspaces',
    ),
    valued: list(
      '--cwd --registry --modules-folder --cache-folder --global-folder --link-folder --mutex --network-timeout --network-concurrency --use-yarnrc --proxy --https-proxy',
    ),
  },
  bun: {
    adders: list('add install i link'),
    others: list(
      'audit build completions create dev discord exec help info init outdated patch pm publish remove repl rm run start test uninstall unlink update upgrade why x',
    ),
    valued: list(
      '--cwd --registry --config -c --filter -F --backend --linker --cache-dir --concurrent-scripts --network-concurrency --omit --env-file --shell --preload -r --port',
    ),
  },
}

function judgeDependencyAdd(words: string[]): string | null {
  const at = words.findIndex((word) => Object.hasOwn(MANAGERS, word))
  if (at < 0) return null
  const name = words[at]
  const manager = MANAGERS[name]
  let i = at + 1
  while (i < words.length && words[i].startsWith('-')) {
    if (TERMINAL.has(words[i])) return null // a version or help: nothing runs
    i += words[i].includes('=') || !manager.valued.has(words[i]) ? 1 : 2
  }
  const subcommand = words[i]
  if (subcommand === undefined) return null // options alone: nothing to add
  if (
    !/^[A-Za-z][A-Za-z0-9-]*$/.test(subcommand) ||
    !(manager.adders.has(subcommand) || manager.others.has(subcommand))
  )
    return `Blocked: tool-guard could not locate the ${name} subcommand ("${subcommand}"). Write it plainly: ${name} <subcommand> …`
  if (!manager.adders.has(subcommand)) return null
  const packages = words.slice(i + 1).filter((word) => !word.startsWith('-'))
  if (packages.length === 0) return null // a bare install from the lockfile is fine
  return `Blocked: dependency add (${packages.join(' ')}). A dependency is asked for on the adjudication queue, #12, with what it is for and what it costs.`
}

function main(): void {
  let reason: string | null
  try {
    const input = JSON.parse(readFileSync(0, 'utf8')) as {
      tool_name?: string
      tool_input?: { command?: string }
    }
    const command = input.tool_input?.command
    if (!command || !['Bash', 'PowerShell'].includes(input.tool_name ?? '')) return
    let branch = ''
    try {
      branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
        encoding: 'utf8',
      }).trim()
    } catch {
      // Not in a repository: nothing to protect.
    }
    reason = judge(command, branch)
  } catch (error) {
    reason = `Blocked: tool-guard could not judge this command (${String(error)}). Fix the guard before working around it.`
  }
  if (reason) {
    process.stderr.write(`${reason}\n`)
    process.exit(2)
  }
}

if (process.argv[1] && basename(process.argv[1]) === 'tool-guard.ts') main()
