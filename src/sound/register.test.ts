// The test reads the register and the audio folder from disk under Vitest, which runs on Node; the
// app project declares no Node types, so this file brings them in itself, as the pins test does.
/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { effects } from './engine.ts'

const register = readFileSync('docs/sound.md', 'utf8')
const files = readdirSync('public/audio').sort()
/** The table's rows, by file: every cell after the file's. */
const rows = new Map(
  [...register.matchAll(/^\| `([^`]+)` +\|(.*)\|$/gm)].map(([, file, rest]) => [
    file,
    rest.split('|').map((cell) => cell.trim()),
  ]),
)

describe('the sound register, docs/sound.md (Gate 10 A7)', () => {
  it('has a row for every file in public/audio, and a file for every row', () => {
    expect([...rows.keys()].sort()).toEqual(files)
  })

  it('holds every file to an open licence: CC0 1.0 or CC BY 4.0 (A1)', () => {
    for (const [file, cells] of rows) expect(['CC0 1.0', 'CC BY 4.0'], file).toContain(cells.at(-1))
  })

  it('records the command that made each file, ending in the file it made', () => {
    for (const file of files) {
      const name = file.replace('.', '\\.')
      const command = new RegExp(
        `^### ${name}\\n[^#]*?\\n\`\`\`\\nffmpeg .* ${name}\\n\`\`\`$`,
        'm',
      )
      expect(register, file).toMatch(command)
    }
  })

  it('plays only files it registers: every effect is a file in public/audio', () => {
    for (const file of Object.values(effects)) expect(files).toContain(file)
  })
})
