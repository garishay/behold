// The test writes pictures to a folder of its own and reads the config's hashes under Vitest, which
// runs on Node; the app project declares no Node types, so this file brings them in itself, as the
// registry test does.
/// <reference types="node" />
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { pictureHashes, stamp } from '../../vite.config.ts'
import { picture, titlePicture } from './pictures.ts'

describe('the title’s picture (#75)', () => {
  it('is its path stamped with the hash of its file, as a case picture’s is', () => {
    expect(titlePicture).toBe(`/title.jpg?v=${stamp('public/title.jpg')}`)
  })

  // [Q7]'s way: a file's SHA-256 in its record, so neither changes without the other.
  it('is the file its record names, and so is the retouch script beside the record', () => {
    const record = readFileSync('docs/title.md', 'utf8')
    for (const file of ['public/title.jpg', 'docs/title-retouch.py']) {
      const named = new RegExp(`\`${file.replaceAll('.', '\\.')}\`.*SHA-256 \`([0-9a-f]{64})\``)
      expect(named.exec(record)?.[1], file).toBe(
        createHash('sha256').update(readFileSync(file)).digest('hex'),
      )
    }
  })
})

describe('a picture’s address (#45)', () => {
  // The phone keeps a picture by its address, so the address is what must move when the picture
  // does, and hold still when it does not.
  it('changes when its picture changes, and stays when it does not', () => {
    const root = mkdtempSync(join(tmpdir(), 'cases-'))
    try {
      mkdirSync(join(root, 'vineyard'))
      writeFileSync(join(root, 'vineyard', 'bedchamber.jpg'), 'coins from the open pouch')
      writeFileSync(join(root, 'vineyard', 'gate.jpg'), 'the elders at the gate')
      const before = pictureHashes(root)
      writeFileSync(join(root, 'vineyard', 'bedchamber.jpg'), 'the ring, the clay, the pouch shut')
      writeFileSync(join(root, 'vineyard', 'gate.jpg'), 'the elders at the gate')
      const after = pictureHashes(root)
      expect(after['vineyard/bedchamber.jpg']).not.toBe(before['vineyard/bedchamber.jpg'])
      expect(after['vineyard/gate.jpg']).toBe(before['vineyard/gate.jpg'])
    } finally {
      rmSync(root, { recursive: true })
    }
  })

  it('is the picture’s path stamped with the hash of its file as it is', () => {
    const hashes = pictureHashes('public/cases')
    expect(hashes['vineyard/bedchamber.jpg']).toMatch(/^[0-9a-f]{8}$/)
    expect(picture('vineyard', 'bedchamber.jpg')).toBe(
      `/cases/vineyard/bedchamber.jpg?v=${hashes['vineyard/bedchamber.jpg']}`,
    )
  })
})
