// The test reads the pictures from disk under Vitest, which runs on Node; the app project declares
// no Node types, so this file brings them in itself rather than widening tsconfig.app.json.
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { cases } from './index.ts'

/** A JPEG's pixel size — width, height — read from its start-of-frame marker. */
function jpegSize(file: Buffer): [number, number] {
  expect(file.readUInt16BE(0)).toBe(0xffd8)
  for (let at = 2; at < file.length; at += 2 + file.readUInt16BE(at + 2)) {
    expect(file[at]).toBe(0xff)
    const marker = file[at + 1]
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
      return [file.readUInt16BE(at + 7), file.readUInt16BE(at + 5)]
  }
  throw new Error('no start-of-frame marker')
}

const each = cases.map((c) => [c.structure.id, c.structure] as const)

describe('the case registry (Gate 02 A1, A5)', () => {
  it('lists each case once', () => {
    const ids = cases.map((c) => c.structure.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(each)('%s: every moment’s picture is in its folder at the declared size', (id, c) => {
    for (const m of c.moments)
      expect(jpegSize(readFileSync(`public/cases/${id}/${m.picture}`)), m.id).toEqual([...m.size])
  })

  it.each(each)('%s: every face’s portrait is in its folder', (id, c) => {
    for (const f of c.faces) {
      const [width, height] = jpegSize(readFileSync(`public/cases/${id}/${f.picture}`))
      expect(width, f.id).toBeGreaterThan(0)
      expect(height, f.id).toBeGreaterThan(0)
    }
  })
})
