import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { deflateSync, inflateSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { GROUND, ICONS, MASTER, decode, frame, png } from './generate-icons.ts'

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

/**
 * A written icon's size and RGBA rows. The encoder's own form only — 8 bits a channel, colour type
 * 6, filter 0 on every row — so this reads the file without the script's reader.
 */
function read(file: Buffer): { size: number; pixels: Uint8Array } {
  expect([...file.subarray(0, 8)]).toEqual(SIGNATURE)
  let size = 0
  const idat: Buffer[] = []
  for (let at = 8; at < file.length;) {
    const length = file.readUInt32BE(at)
    const type = file.toString('ascii', at + 4, at + 8)
    const data = file.subarray(at + 8, at + 8 + length)
    if (type === 'IHDR') {
      size = data.readUInt32BE(0)
      expect(data.readUInt32BE(4)).toBe(size)
      expect([...data.subarray(8)]).toEqual([8, 6, 0, 0, 0])
    }
    if (type === 'IDAT') idat.push(data)
    at += 12 + length
  }
  const raw = inflateSync(Buffer.concat(idat))
  const stride = size * 4 + 1
  const pixels = new Uint8Array(size * size * 4)
  for (let row = 0; row < size; row++) {
    expect(raw[row * stride]).toBe(0)
    pixels.set(raw.subarray(row * stride + 1, (row + 1) * stride), row * size * 4)
  }
  return { size, pixels }
}

/** How far a pixel is from the ground, in levels: its farthest channel. */
const fromGround = (pixels: Uint8Array, at: number) =>
  Math.max(...GROUND.map((level, k) => Math.abs(pixels[at + k] - level)))

const master = decode(await readFile(MASTER))

describe('generate-icons (Gate 18, #10)', () => {
  it('reads the master the record names: its SHA-256 is the one docs/icon.md records', async () => {
    const record = await readFile('docs/icon.md', 'utf8')
    const recorded = /^The master, `assets\/icon\.png`: .*SHA-256 `([0-9a-f]{64})`\.$/m.exec(record)
    const hash = createHash('sha256').update(await readFile(MASTER))
    expect(recorded?.[1]).toBe(hash.digest('hex'))
  })

  it.each(ICONS)('$file is the master framed at $size — not a hand edit', async (icon) => {
    const { size, pixels } = read(await readFile(`public/icons/${icon.file}`))
    expect(size).toBe(icon.size)
    expect(Buffer.from(pixels).equals(frame(master, icon.size, icon.share))).toBe(true)
  })

  it('writes the store’s icon as Play asks: a 32-bit PNG, 512 square, opaque, within 1024 KB', async () => {
    const file = await readFile('public/icons/icon-512.png')
    const { size, pixels } = read(file)
    expect(size).toBe(512)
    expect(pixels.filter((_, i) => i % 4 === 3).every((alpha) => alpha === 255)).toBe(true)
    expect(file.length).toBeLessThanOrEqual(1024 * 1024)
  })

  it.each(ICONS)(
    'meets the ground exactly at every edge of $file, so the splash shows no square',
    (icon) => {
      const { size, share } = icon
      const pixels = frame(master, size, share)
      for (let i = 0; i < size; i++)
        for (const [x, y] of [
          [i, 0],
          [i, size - 1],
          [0, i],
          [size - 1, i],
        ])
          expect(fromGround(pixels, (y * size + x) * 4)).toBe(0)
    },
  )

  it('keeps the whole maskable art inside the 66 dp circle no launcher’s mask clips', () => {
    const { size, share } = ICONS.find((icon) => icon.file === 'icon-512-maskable.png')!
    const pixels = frame(master, size, share)
    const centre = size / 2
    let art = 0
    for (let at = 0; at < size * size; at++) {
      if (fromGround(pixels, at * 4) <= 12) continue
      art++
      const [x, y] = [(at % size) + 0.5, Math.floor(at / size) + 0.5]
      expect(Math.hypot(x - centre, y - centre)).toBeLessThanOrEqual((33 / 91) * size)
    }
    expect(art).toBeGreaterThan(size * size * 0.2)
  })

  it('reads all five of PNG’s row filters', () => {
    // A 3 × 5 RGB raster, each row written under its own filter by the spec's forward rule.
    const [width, height] = [3, 5]
    const source = Uint8Array.from({ length: width * height * 3 }, (_, i) => (i * 97 + 13) % 256)
    const paeth = (a: number, b: number, c: number) => {
      const p = a + b - c
      const [pa, pb, pc] = [Math.abs(p - a), Math.abs(p - b), Math.abs(p - c)]
      return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
    }
    const raw: number[] = []
    for (let y = 0; y < height; y++) {
      raw.push(y)
      for (let x = 0; x < width * 3; x++) {
        const at = y * width * 3 + x
        const a = x >= 3 ? source[at - 3] : 0
        const b = y > 0 ? source[at - width * 3] : 0
        const c = x >= 3 && y > 0 ? source[at - width * 3 - 3] : 0
        raw.push((source[at] - [0, a, b, (a + b) >> 1, paeth(a, b, c)][y] + 256) % 256)
      }
    }
    // Each chunk's CRC is left zero: the reader doesn't check them, and the master's hash guards it.
    const chunk = (type: string, data: Buffer) => {
      const head = Buffer.alloc(4)
      head.writeUInt32BE(data.length)
      return Buffer.concat([head, Buffer.from(type), data, Buffer.alloc(4)])
    }
    const ihdr = Buffer.alloc(13)
    ihdr.writeUInt32BE(width, 0)
    ihdr.writeUInt32BE(height, 4)
    ihdr.set([8, 2, 0, 0, 0], 8)
    const file = Buffer.concat([
      Buffer.from(SIGNATURE),
      chunk('IHDR', ihdr),
      chunk('IDAT', deflateSync(Buffer.from(raw))),
      chunk('IEND', Buffer.alloc(0)),
    ])
    expect(decode(file)).toEqual({ width, height, pixels: source })
  })

  it('refuses a PNG of any other kind than the master’s, rather than misread it', () => {
    expect(() => decode(png(2, new Uint8Array(16)))).toThrow('8-bit RGB')
  })
})
