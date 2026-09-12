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
 * and says so — a quote it cannot place, a command or a git subcommand that is a variable or a
 * substitution's output, an executor handed a variable, an encoded command, or its stdin, a bare
 * push (where it goes is git's config, not the command), `HEAD` after a branch or directory
 * change, a refspec it cannot read, a package-manager subcommand it cannot locate — since a hook
 * that crashes exits non-blocking, and this one must never fail open.
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

/** A branch or directory change anywhere in the command: `HEAD` no longer means this branch. */
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

/** What a substitution stands for in the command that encloses it: a word that cannot be read. */
const SUBSTITUTION = '$(…)'

/**
 * The command split at the shell separators — `&&`, `||`, `;`, `|`, a newline, parentheses — into
 * tokens; a quoted string becomes one token that keeps its inner text and its quotedness, so
 * `git push origin "main"` still says `main`. A substitution (`$( )`, backticks) is its own
 * segment, and stands in the enclosing command as `$(…)`. Null on a quote or a substitution that
 * never closes. In `plain` mode quotes are ordinary characters, for text that is not itself
 * well-formed shell.
 */
function tokenize(text: string, plain: boolean): Segment[] | null {
  const segments: Segment[] = []
  const enclosing: { segment: Segment; current: string; quoted: boolean; backtick: boolean }[] = []
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
  const endSegment = () => {
    endToken()
    if (segment.tokens.length > 0 || segment.substitutionAsCommand) segments.push(segment)
    segment = { tokens: [], substitutionAsCommand: false }
  }
  const openSubstitution = (backtick: boolean) => {
    const asCommand = !open && segment.tokens.length === 0
    enclosing.push({ segment, current: open ? current : '', quoted, backtick })
    segment = { tokens: [], substitutionAsCommand: asCommand }
    current = ''
    quoted = false
    open = false
  }
  const closeSubstitution = () => {
    endSegment()
    const outer = enclosing.pop()
    if (!outer) return
    segment = outer.segment
    current = outer.current + SUBSTITUTION
    quoted = outer.quoted
    open = true
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
    } else if (text.startsWith('$(', i)) {
      openSubstitution(false)
      i += 2
    } else if (ch === '`') {
      if (enclosing.at(-1)?.backtick) closeSubstitution()
      else openSubstitution(true)
      i += 1
    } else if (ch === ')') {
      if (enclosing.length > 0 && !enclosing.at(-1)?.backtick) closeSubstitution()
      else endSegment()
      i += 1
    } else if (text.startsWith('&&', i) || text.startsWith('||', i)) {
      endSegment()
      i += 2
    } else if (';|\n('.includes(ch)) {
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
  while (enclosing.length > 0) {
    if (!plain) return null
    closeSubstitution()
  }
  endSegment()
  return segments
}

/** A word list, written as one string so a table reads as a table. */
const list = (words: string) => new Set(words.split(' '))

/** The program a word names: its basename, without a Windows extension. */
const name = (word: string) => word.replace(/^.*[\\/]/, '').replace(/\.(exe|cmd|bat)$/i, '')

/** A word the guard cannot read as one: empty, a variable, or a substitution. */
const unreadable = (word: string) => word === '' || word.startsWith('$') || word.includes('`')

/** Options whose value is prose — a message, a body, a title — never a command. */
const PROSE_OPTIONS = list('-m --message -b --body -t --title --notes')
const PROSE_ASSIGNMENT = /^(--message|--body|--title|--notes|-m|-b|-t)=/

/** A redirection is not a word of the command; what follows `<`, `<<<`, `>`, or `>>` is its operand. */
const REDIRECTION = /^[\d&]*[<>]{1,3}[&\d]*$/
const SELF_CONTAINED_REDIRECTION = /^\d*[<>]+&\d+$/

/** Words that only hand the command on: the command word is the first after them. */
const WRAPPERS = list('sudo doas env time nohup nice command exec xargs')

/** The index of the word that names the command: past environment assignments and wrappers. */
function commandIndex(words: string[]): number {
  let i = 0
  while (i < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i])) i++
  while (i < words.length && WRAPPERS.has(name(words[i]))) {
    i++
    while (i < words.length && words[i].startsWith('-')) i++
  }
  return i
}

const UNPLACED =
  'Blocked: tool-guard could not place this command — a quote or a substitution never closes. Fix the command before working around it.'
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
    let stdin = false
    for (let i = 0; i < segment.tokens.length; i++) {
      const token = segment.tokens[i]
      if (!token.quoted && REDIRECTION.test(token.text)) {
        if (token.text.includes('<')) stdin = true
        if (!SELF_CONTAINED_REDIRECTION.test(token.text)) {
          // The operand is not a word of the command either — but a here-string runs.
          const operand = segment.tokens[++i]
          if (operand?.quoted && /\s/.test(operand.text)) {
            const inner = judgeText(operand.text, branch, switched, false)
            if (inner) return inner
          }
        }
        continue
      }
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
          // What the string stands for in its command: a variable or a substitution is still
          // unreadable there, a quoted path with spaces in it still names its program.
          words.push(
            /^\$|\$\(|`/.test(token.text)
              ? SUBSTITUTION
              : /[\\/]/.test(token.text)
                ? name(token.text)
                : '""',
          )
          continue
        }
      }
      words.push(token.text)
    }
    const command = words[commandIndex(words)]
    if (top && command !== undefined && (unreadable(command) || command === '""'))
      return `Blocked: tool-guard cannot judge a command whose name is a variable, a substitution, or a quoted string. ${PLAINLY}`
    const reason =
      judgeExecutor(words, stdin) ?? judgePush(words, branch, switched) ?? judgeDependencyAdd(words)
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

function judgeExecutor(words: string[], redirectedStdin: boolean): string | null {
  const at = words.findIndex((word) => Object.hasOwn(EXECUTORS, name(word)))
  if (at < 0) return null
  const exe = name(words[at])
  const rest = words.slice(at + 1)
  const cannot = (what: string) =>
    `Blocked: tool-guard cannot judge what ${exe} would run — ${what}. ${PLAINLY}`
  // A literal handed to an executor was judged as a command when its token was read; what is
  // left to refuse is a string the guard could not read at all.
  if (exe === 'eval') return rest.some(unreadable) ? cannot('a variable or a substitution') : null
  for (const [i, option] of rest.entries()) {
    const abbreviated =
      POWERSHELL.has(exe) && option.startsWith('-') ? option.slice(1).toLowerCase() : ''
    if (abbreviated !== '' && 'encodedcommand'.startsWith(abbreviated))
      return cannot('an encoded command')
    if (
      (abbreviated !== '' && 'command'.startsWith(abbreviated)) ||
      EXECUTORS[exe].includes(option)
    ) {
      const code = rest[i + 1]
      if (code === undefined) return cannot('nothing follows the option')
      return unreadable(code) ? cannot('the command is a variable or a substitution') : null
    }
  }
  // No code option: a script argument runs that; a redirection into the executor, `-s`, or no
  // argument at all means it reads its commands from stdin — judged only where the executor is
  // the command itself, since `which node` names it too.
  if (at !== commandIndex(words)) return null
  if (redirectedStdin || rest.includes('-s')) return cannot('it would read its commands from stdin')
  const argument = rest.some((word) => !/^[-/]/.test(word))
  const terminal = rest.some((word) => TERMINAL.has(word))
  return argument || terminal ? null : cannot('it would read its commands from stdin')
}

/** Git's global options that take a separate value, which must be skipped with them. */
const GIT_VALUE_OPTIONS = list('-C -c --git-dir --work-tree --namespace --exec-path')

/** The git subcommand in the segment and the words after it, or null when git is not invoked. */
function gitCall(words: string[]): { subcommand: string | undefined; args: string[] } | null {
  const at = words.findIndex((word) => name(word) === 'git')
  if (at < 0) return null
  let i = at + 1
  while (i < words.length && words[i].startsWith('-')) {
    i += GIT_VALUE_OPTIONS.has(words[i]) ? 2 : 1
  }
  return { subcommand: words[i], args: words.slice(i + 1) }
}

function judgePush(words: string[], currentBranch: string, switched: boolean): string | null {
  const call = gitCall(words)
  if (!call) return null
  if (call.subcommand !== undefined && (unreadable(call.subcommand) || call.subcommand === '""'))
    return `Blocked: tool-guard cannot judge a git subcommand that is a variable or a substitution. ${PLAINLY}`
  if (call.subcommand !== 'push') return null
  const flags = call.args.filter((word) => word.startsWith('-'))
  const positional = call.args.filter((word) => !word.startsWith('-'))
  const isForce = (flag: string) =>
    /^(-[A-Za-z0-9]*f[A-Za-z0-9]*|--force|--force-with-lease(=.*)?|--force-if-includes|--mirror)$/.test(
      flag,
    )
  if (flags.some(isForce))
    return 'Blocked: force push. History on a shared branch is not rewritten.'
  if (positional.some((word) => word.startsWith('+')))
    return 'Blocked: force push (a + refspec). History on a shared branch is not rewritten.'
  const refspecs = positional.slice(1)
  const everyBranch = flags.some((flag) => flag === '--all' || flag === '--branches')
  if (refspecs.length === 0 && !everyBranch)
    return "Blocked: a bare push cannot be judged — where it goes is git's config, not the command. Name the refspec: git push origin <branch>."
  if (refspecs.some((word) => /[$`{}]/.test(word) || word === '""'))
    return 'Blocked: push with a refspec the guard cannot read — a variable, a substitution, or a placeholder. Name the branch.'
  const destination = (refspec: string) =>
    refspec.includes(':') ? refspec.slice(refspec.indexOf(':') + 1) : refspec
  const isHead = (target: string) => target === 'HEAD' || target === '@'
  if (switched && refspecs.some((refspec) => isHead(destination(refspec))))
    return 'Blocked: HEAD in a command that changes branch or directory cannot be judged from the current branch. Name the branch.'
  const targetsMain = (refspec: string) => {
    const target = destination(refspec)
    return ['main', 'refs/heads/main'].includes(isHead(target) ? currentBranch : target)
  }
  if (refspecs.some(targetsMain) || everyBranch)
    return 'Blocked: push to main. Work on a branch and open a PR; main is merged only through one.'
  return null
}

interface Manager {
  /** Subcommands that add a dependency when given a package name. */
  adders: Set<string>
  /** The rest of the manager's subcommands; a word that is neither cannot be located. */
  others: Set<string>
  /** Options that take a separate value, skipped with it wherever they stand. */
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
  const at = words.findIndex((word) => Object.hasOwn(MANAGERS, name(word)))
  if (at < 0) return null
  const manager = name(words[at])
  const { adders, others, valued } = MANAGERS[manager]
  const skip = (i: number) => (words[i].includes('=') || !valued.has(words[i]) ? 1 : 2)
  let i = at + 1
  while (i < words.length && words[i].startsWith('-')) {
    if (TERMINAL.has(words[i])) return null // a version or help: nothing runs
    i += skip(i)
  }
  const subcommand = words[i]
  if (subcommand === undefined) return null // options alone: nothing to add
  if (
    !/^[A-Za-z][A-Za-z0-9-]*$/.test(subcommand) ||
    !(adders.has(subcommand) || others.has(subcommand))
  )
    return `Blocked: tool-guard could not locate the ${manager} subcommand ("${subcommand}"). Write it plainly: ${manager} <subcommand> …`
  if (!adders.has(subcommand)) return null
  const packages: string[] = []
  for (i += 1; i < words.length; i += words[i].startsWith('-') ? skip(i) : 1) {
    if (!words[i].startsWith('-')) packages.push(words[i])
  }
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
