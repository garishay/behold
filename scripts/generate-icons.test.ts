import { readFile } from 'node:fs/promises'
import { inflateSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { ICONS, NIGHT, lampPixels, png } from './generate-icons.ts'

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

/** The PNG's size and its rows with the filter bytes stripped — enough to hold a file to the function. */
function decode(file: Buffer): { size: number; pixels: Uint8Array } {
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
      expect([...data.subarray(8)]).toEqual([8, 2, 0, 0, 0])
    }
    if (type === 'IDAT') idat.push(data)
    at += 12 + length
  }
  const raw = inflateSync(Buffer.concat(idat))
  const stride = size * 3 + 1
  const pixels = new Uint8Array(size * size * 3)
  for (let row = 0; row < size; row++)
    pixels.set(raw.subarray(row * stride + 1, (row + 1) * stride), row * size * 3)
  return { size, pixels }
}

const isNight = (pixels: Uint8Array, at: number) =>
  pixels[at] === NIGHT[0] && pixels[at + 1] === NIGHT[1] && pixels[at + 2] === NIGHT[2]

describe('generate-icons (Gate 01 A2)', () => {
  it.each(ICONS)('$file is the function’s output at $size — not a hand edit', async (icon) => {
    const { size, pixels } = decode(await readFile(`public/icons/${icon.file}`))
    expect(size).toBe(icon.size)
    expect(Buffer.from(pixels).equals(lampPixels(icon.size, icon.scale))).toBe(true)
  })

  it('round-trips a raster through its own encoder', () => {
    const pixels = lampPixels(24, 1)
    expect(decode(png(24, pixels))).toEqual({ size: 24, pixels })
  })

  it('draws on the night colour to every corner, and a lamp that is not all night', () => {
    const size = 64
    const pixels = lampPixels(size, 1)
    for (const corner of [0, size - 1, size * (size - 1), size * size - 1])
      expect(isNight(pixels, corner * 3)).toBe(true)
    expect(isNight(pixels, (size * (size / 2) + size / 2) * 3)).toBe(false)
  })

  it('keeps the maskable lamp inside the safe zone — the circle inscribed in the inner 80%', () => {
    const size = 128
    const pixels = lampPixels(size, 0.8)
    const centre = (size - 1) / 2
    for (let at = 0; at < size * size; at++) {
      if (isNight(pixels, at * 3)) continue
      const x = at % size
      const y = Math.floor(at / size)
      expect(Math.hypot(x - centre, y - centre)).toBeLessThanOrEqual(0.4 * size)
    }
  })
})
