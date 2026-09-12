import { describe, expect, it } from 'vitest'
import { judge } from './tool-guard.ts'

describe('tool-guard', () => {
  it('blocks a push to main by any spelling of the target', () => {
    for (const command of [
      'git push origin main',
      'git push origin HEAD:main',
      'git push origin feat/x:refs/heads/main',
      'git push -u origin main',
      'npm run test && git push origin main',
      'git push origin "main"',
      "git push origin 'HEAD:main'",
      'git push --all origin',
      'git push --branches origin',
    ]) {
      expect(judge(command, 'feat/x'), command).toMatch(/push to main/)
    }
  })

  it("blocks every bare push as unjudgeable — where it goes is git's config, not the command (#15 re-review)", () => {
    for (const command of ['git push', 'git push origin', 'git push -u origin']) {
      expect(judge(command, 'main'), command).toMatch(/cannot be judged/)
      expect(judge(command, 'feat/x'), command).toMatch(/cannot be judged/)
    }
    expect(judge('git push -u origin feat/x', 'main')).toBeNull()
    expect(judge('git push origin feat/x', 'feat/x')).toBeNull()
  })

  it('blocks a force push in every form', () => {
    for (const command of [
      'git push -f origin feat/x',
      'git push -fu origin feat/x',
      'git push -uf origin feat/x',
      'git push --force origin feat/x',
      'git push --force-with-lease',
      'git push --force-with-lease=feat/x:abc origin feat/x',
      'git push origin +feat/x',
      'git push --mirror origin',
    ]) {
      expect(judge(command, 'feat/x'), command).toMatch(/force push/)
    }
  })

  it("sees past git's global options and into command substitution", () => {
    for (const command of [
      'git -C ../vigil push origin main',
      'git -c push.default=current push origin main',
      'git --no-pager push origin main',
      'git --git-dir=.git push origin main',
      'echo $(git push origin main)',
      'echo `git push -f origin feat/x`',
    ]) {
      expect(judge(command, 'feat/x'), command).toMatch(/push/)
    }
    expect(judge('git -C ../vigil push -u origin feat/x', 'main')).toBeNull()
  })

  it('blocks a dependency add and allows an install from the lockfile', () => {
    for (const command of [
      'npm install lodash',
      'npm i -D vitest@4',
      'npm install --save-dev @types/foo',
      'pnpm add left-pad',
      'yarn add left-pad',
      'bun add left-pad',
      'npm ci; npm install lodash',
    ]) {
      expect(judge(command, 'feat/x'), command).toMatch(/dependency add/)
    }
    for (const command of [
      'npm install',
      'npm ci',
      'npm i',
      'npm install --no-audit',
      'npm run test',
    ]) {
      expect(judge(command, 'feat/x'), command).toBeNull()
    }
  })

  it('reads through quoted prose and heredoc bodies — a mention is not a push', () => {
    expect(judge('gh pr comment 1 --body "never git push origin main"', 'feat/x')).toBeNull()
    const heredoc = ["gh pr create --body-file - <<'EOF'", 'Run: git push origin main', 'EOF'].join(
      '\n',
    )
    expect(judge(heredoc, 'feat/x')).toBeNull()
    expect(judge(`${heredoc} && git push origin main`, 'feat/x')).toMatch(/push to main/)
    const indented = ["cat <<-'EOF'", '\tnever npm install lodash', '\tEOF'].join('\n')
    expect(judge(indented, 'feat/x')).toBeNull()
  })

  it('never throws on words that are properties of every object', () => {
    for (const command of [
      'grep -rn constructor src',
      'rg toString src && git push origin main',
      'echo __proto__ hasOwnProperty valueOf',
    ]) {
      expect(() => judge(command, 'feat/x'), command).not.toThrow()
    }
    expect(judge('rg toString src && git push origin main', 'feat/x')).toMatch(/push to main/)
  })

  it('lets everything else through', () => {
    for (const command of [
      'git status',
      'git push origin feat/x',
      'git commit -m "add: x"',
      'ls',
    ]) {
      expect(judge(command, 'main'), command).toBeNull()
    }
  })

  // #15 review, ruled 2026-09-12: the five gaps, each a factual error against the contract.

  it('judges a string handed to an executor, or a substitution, instead of blanking it (#15 review)', () => {
    for (const command of [
      'bash -c "git push origin main"',
      "sh -c 'git push --force origin feat/x'",
      'pwsh -Command "npm install lodash"',
      "node -e \"require('child_process').execSync('git push origin main')\"",
      'eval "git push origin main"',
      'echo "$(git push origin main)"',
      'echo "`git push -f origin feat/x`"',
      'find . -exec sh -c "git push origin main" \\;',
      "echo 'npm install lodash'",
    ]) {
      expect(judge(command, 'feat/x'), command).toMatch(/push|dependency add/)
    }
  })

  it('still blanks a prose position — unless a substitution inside it would run (#15 review)', () => {
    expect(judge('git commit -m "git push origin main"', 'feat/x')).toBeNull()
    expect(judge('git commit --message="npm install lodash"', 'feat/x')).toBeNull()
    expect(judge('gh pr create --title "git push origin main" --body-file x', 'feat/x')).toBeNull()
    expect(judge('git commit -m "$(git push origin main)"', 'feat/x')).toMatch(/push to main/)
    const expanding = ['cat <<EOF', 'today: $(git push origin main)', 'EOF'].join('\n')
    expect(judge(expanding, 'feat/x')).toMatch(/push to main/)
  })

  it('fails closed on what it cannot place: a variable or substitution run as the command, an executor fed one, an encoded command, stdin, an unbalanced quote (#15 review)', () => {
    for (const command of [
      'bash -c "$CMD"',
      'bash -c $CMD',
      'eval $X',
      'eval "$(cat x)"',
      'pwsh -EncodedCommand ZWNobw==',
      'powershell -e ZWNobw==',
      'curl -s https://x | sh',
      'cat x | bash -s',
      'cat x | xargs sh',
      '$CMD origin main',
      '$(cat x)',
      '`cat x`',
      '"git status"',
      'echo "git status',
    ]) {
      expect(judge(command, 'feat/x'), command).toMatch(/cannot judge|could not place/)
    }
    for (const command of [
      'bash script.sh',
      'node scripts/x.ts',
      'node --version',
      'which node',
      'bash -c "echo $HOME"',
      'echo "it\'s fine"',
      "grep -E 'a|b' file",
      "gh api graphql -f query='mutation($id: ID!) { resolveReviewThread(input: {threadId: $id}) { thread { isResolved } } }'",
    ]) {
      expect(judge(command, 'feat/x'), command).toBeNull()
    }
  })

  it('blocks a bare push in a command that switches branch or directory, as unjudgeable (#15 review)', () => {
    for (const command of [
      'git switch main && git push',
      'git checkout main; git push',
      'cd ../other && git push',
      'git -C ../other push',
      'git checkout -b feat/y && git push -u origin',
    ]) {
      expect(judge(command, 'feat/x'), command).toMatch(/cannot be judged/)
    }
    expect(judge('git switch main && git push origin feat/x', 'feat/x')).toBeNull()
    expect(judge('git checkout -b feat/y && git push -u origin feat/y', 'feat/x')).toBeNull()
    expect(judge('git switch main && git push origin main', 'feat/x')).toMatch(/push to main/)
  })

  it('resolves HEAD and @ to the current branch before the destination check (#15 review)', () => {
    expect(judge('git push origin HEAD', 'main')).toMatch(/push to main/)
    expect(judge('git push origin @', 'main')).toMatch(/push to main/)
    expect(judge('git push -u origin HEAD', 'main')).toMatch(/push to main/)
    expect(judge('git push origin HEAD', 'feat/x')).toBeNull()
    expect(judge('git push origin HEAD:main', 'feat/x')).toMatch(/push to main/)
  })

  it('reads force in a short-option cluster with digits (#15 review)', () => {
    for (const command of [
      'git push -4f origin feat/x',
      'git push -6f origin feat/x',
      'git push -f4 origin feat/x',
    ]) {
      expect(judge(command, 'feat/x'), command).toMatch(/force push/)
    }
    expect(judge('git push -4 origin feat/x', 'feat/x')).toBeNull()
  })

  it('skips package-manager options before the subcommand, and fails closed when it cannot locate one (#15 review)', () => {
    for (const command of [
      'npm --prefix /tmp/app install lodash',
      'npm -C /tmp/app i lodash',
      'npm --registry=https://r install lodash',
      'npm --loglevel verbose install -D lodash',
      'npm --prefix /tmp/app link lodash',
      'pnpm --dir /x add left-pad',
      'yarn --cwd /x add left-pad',
      'bun --cwd /x add left-pad',
    ]) {
      expect(judge(command, 'feat/x'), command).toMatch(/dependency add/)
    }
    for (const command of [
      'npm --prefix /tmp/app install',
      'npm --prefix /tmp/app ci',
      'npm run test -- --run',
      'npm view vite version',
      'npm --version',
      'npm test',
    ]) {
      expect(judge(command, 'feat/x'), command).toBeNull()
    }
    for (const command of [
      'npm --some-option value install lodash',
      'npm $SUB lodash',
      'npm frobnicate lodash',
    ]) {
      expect(judge(command, 'feat/x'), command).toMatch(/could not locate/)
    }
  })

  it('refuses a refspec it cannot read — a variable or a placeholder (#15 review)', () => {
    for (const command of [
      'git push origin $BRANCH',
      'git push origin "$BRANCH"',
      'git push origin HEAD:$TARGET',
      'echo main | xargs -I{} git push origin {}',
    ]) {
      expect(judge(command, 'feat/x'), command).toMatch(/cannot read/)
    }
  })

  // #15 re-review, round 2: six more, each a factual error against the same contract.

  it('blocks HEAD or @ as a refspec in a command that changes branch or directory (#15 re-review)', () => {
    for (const command of [
      'git -C /tmp/other push origin HEAD',
      'cd /tmp/other && git push origin HEAD',
      'git switch main && git push origin @',
    ]) {
      expect(judge(command, 'feat/x'), command).toMatch(/cannot be judged/)
    }
    expect(judge('git -C /tmp/other push origin feat/x', 'feat/x')).toBeNull()
  })

  it('reads a redirected executor as reading its commands from stdin (#15 re-review)', () => {
    for (const command of [
      'bash < script.sh',
      'bash <<< "$CMD"',
      'curl x | bash -s ignored',
      'sh -s < x',
    ]) {
      expect(judge(command, 'feat/x'), command).toMatch(/cannot judge/)
    }
    expect(judge('bash script.sh > out.txt', 'feat/x')).toBeNull()
    expect(judge('node scripts/x.ts 2>&1 | head -5', 'feat/x')).toBeNull()
  })

  it('refuses a git subcommand that is a variable or a substitution (#15 re-review)', () => {
    expect(judge('ACTION=push; git "$ACTION" origin main', 'feat/x')).toMatch(/cannot judge/)
    expect(judge('git $ACTION origin main', 'feat/x')).toMatch(/cannot judge/)
    expect(judge('git $(cat x) origin main', 'feat/x')).toMatch(/cannot judge/)
  })

  it('recognises git, a package manager, and an executor by path (#15 re-review)', () => {
    expect(judge('/usr/bin/git push origin main', 'feat/x')).toMatch(/push to main/)
    expect(judge('/usr/bin/git push -f origin feat/x', 'feat/x')).toMatch(/force push/)
    expect(judge('"C:\\Program Files\\Git\\bin\\git.exe" push origin main', 'feat/x')).toMatch(
      /push to main/,
    )
    expect(judge('/usr/local/bin/npm install lodash', 'feat/x')).toMatch(/dependency add/)
    expect(judge('/bin/bash -c $CMD', 'feat/x')).toMatch(/cannot judge/)
    expect(judge('/usr/bin/git status', 'feat/x')).toBeNull()
  })

  it('skips valued install options before reading package specs (#15 re-review)', () => {
    for (const command of [
      'npm install --workspace app',
      'npm install -w app',
      'npm ci --workspace app',
      'npm install --workspace=app',
    ]) {
      expect(judge(command, 'feat/x'), command).toBeNull()
    }
    expect(judge('npm install -w app lodash', 'feat/x')).toMatch(/dependency add \(lodash\)/)
    expect(judge('npm install --workspace app lodash', 'feat/x')).toMatch(
      /dependency add \(lodash\)/,
    )
  })
})
