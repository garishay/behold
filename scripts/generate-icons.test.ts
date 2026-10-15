import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { deflateSync, inflateSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { ART, GROUND, ICONS, MASTER, decode, frame, png } from './generate-icons.ts'

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

/**
 * The dp of a launcher icon's 108 that Chrome's install lays a maskable icon over: it pads the icon
 * so the spec's 80% safe circle meets Android's 66 dp one (Chromium's `WebappsIconUtils`, 4/5
 * against 66/108), and the middle 72 dp show (#129).
 */
const CHROME = 82.5

/**
 * The files a platform masks, each with the dp its width spans of the 72 the mask shows (#133): the
 * launcher shows the middle 72 of the maskable's 82.5, and the iPhone and Play show the whole
 * square, read as the same 72.
 */
const MASKED: Record<string, number> = {
  'public/icons/icon-512-maskable.png': CHROME,
  'public/icons/apple-touch-icon-180.png': 72,
  'assets/store-icon.png': 72,
}
const masked = ICONS.filter((icon) => icon.file in MASKED)
const unmasked = ICONS.filter((icon) => !(icon.file in MASKED))

/**
 * The lens, out to its ring's outer edge, and the blank as retouched, in the master's pixels
 * (`docs/icon.md`): the art the circle no mask clips must hold (#133).
 */
const LENS = { x: 622, y: 577, radius: 284 }
const BLANK = { left: 522, top: 596, right: 712, bottom: 626 }
const inLens = (x: number, y: number) =>
  Math.hypot(x + 0.5 - LENS.x, y + 0.5 - LENS.y) <= LENS.radius
const inBlank = (x: number, y: number) =>
  x >= BLANK.left && x < BLANK.right && y >= BLANK.top && y < BLANK.bottom

/**
 * The art in a file's pixels, each pixel more than 12 levels off the ground, as Gate 18 measured
 * it: its box's width and middle across, its mass (the mean of its pixels' places), and its
 * farthest pixel from the centre.
 */
function art(pixels: Uint8Array, size: number) {
  let [left, right, count, x0, y0, farthest] = [size, -1, 0, 0, 0, 0]
  for (let at = 0; at < size * size; at++) {
    if (fromGround(pixels, at * 4) <= 12) continue
    const [x, y] = [(at % size) + 0.5, Math.floor(at / size) + 0.5]
    ;[left, right, count, x0, y0] = [
      Math.min(left, x),
      Math.max(right, x),
      count + 1,
      x0 + x,
      y0 + y,
    ]
    farthest = Math.max(farthest, Math.hypot(x - size / 2, y - size / 2))
  }
  const mass = { x: x0 / count, y: y0 / count }
  return { width: right + 1 - left, middle: (left + right) / 2, mass, count, farthest }
}

const master = decode(await readFile(MASTER))

/** The master with only the pixels `kept` names left, and the ground everywhere else. */
function only(kept: (x: number, y: number) => boolean) {
  const pixels = new Uint8Array(master.pixels)
  for (let y = 0; y < master.height; y++)
    for (let x = 0; x < master.width; x++)
      if (!kept(x, y)) pixels.set(GROUND, (y * master.width + x) * 3)
  return { ...master, pixels }
}

describe('generate-icons (Gate 18, #10)', () => {
  it('reads the master the record names: its SHA-256 is the one docs/icon.md records', async () => {
    const record = await readFile('docs/icon.md', 'utf8')
    const recorded = /^The master, `assets\/icon\.png`: .*SHA-256 `([0-9a-f]{64})`\.$/m.exec(record)
    const hash = createHash('sha256').update(await readFile(MASTER))
    expect(recorded?.[1]).toBe(hash.digest('hex'))
  })

  it.each(ICONS)('$file is the master framed at $size — not a hand edit', async (icon) => {
    const { size, pixels } = read(await readFile(icon.file))
    expect(size).toBe(icon.size)
    const framed = frame(master, icon.size, icon.share, icon.centre)
    expect(Buffer.from(pixels).equals(framed)).toBe(true)
  })

  it('writes the store’s icon as Play asks: a 32-bit PNG, 512 square, opaque, within 1024 KB', async () => {
    const file = await readFile('assets/store-icon.png')
    const { size, pixels } = read(file)
    expect(size).toBe(512)
    expect(pixels.filter((_, i) => i % 4 === 3).every((alpha) => alpha === 255)).toBe(true)
    expect(file.length).toBeLessThanOrEqual(1024 * 1024)
  })

  // The feature graphic is committed as the owner accepted it (Gate 18 A7), so its record's hash
  // holds it, as the master's does; Play takes "JPEG or 24-bit PNG (no alpha)" at 1024 × 500.
  it('keeps the store’s feature graphic as accepted: its recorded SHA-256, 1024 × 500, no alpha', async () => {
    const file = await readFile('assets/feature-graphic.png')
    const record = await readFile('docs/icon.md', 'utf8')
    const recorded =
      /^The feature graphic, `assets\/feature-graphic\.png`: .*SHA-256 `([0-9a-f]{64})`\.$/m.exec(
        record,
      )
    expect(recorded?.[1]).toBe(createHash('sha256').update(file).digest('hex'))
    expect([...file.subarray(0, 8)]).toEqual(SIGNATURE)
    expect(file.toString('ascii', 12, 16)).toBe('IHDR')
    // Its width and height, then 8 bits a channel, colour type 2 (RGB, no alpha), and no interlace.
    const ihdr = [file.readUInt32BE(16), file.readUInt32BE(20), file[24], file[25], file[28]]
    expect(ihdr).toEqual([1024, 500, 8, 2, 0])
  })

  it.each(ICONS)(
    'meets the ground exactly at every edge of $file, so the splash shows no square',
    (icon) => {
      const { size, share, centre } = icon
      const pixels = frame(master, size, share, centre)
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

  // Under a mask, the lens and the blank stay inside the circle no mask clips, and the knobs, the
  // rollers' ends, and the handle's end may run past it (#133, which retires Gate 18's whole art
  // inside it). The master is framed with only the lens and the blank kept, as the file frames it.
  it.each(masked)('keeps the lens and the blank of $file inside the 66 dp circle', (icon) => {
    const { size, share, centre } = icon
    const lensAndBlank = only((x, y) => inLens(x, y) || inBlank(x, y))
    const { count, farthest } = art(frame(lensAndBlank, size, share, centre), size)
    expect(count).toBeGreaterThan(size * size * 0.05)
    expect(farthest).toBeLessThanOrEqual((33 / MASKED[icon.file]) * size)
  })

  // The owner's point, x 622, y 590 of the master, is the middle of each masked file (#133): the
  // blank, framed alone as the file frames the master, lands where that point puts it.
  it.each(masked)('sets the master’s x 622, y 590 at the middle of $file', (icon) => {
    const { size, share, centre } = icon
    const { mass } = art(frame(only(inBlank), size, share, centre), size)
    const scale = (size * share) / (ART.right + 1 - ART.left)
    expect(mass.x).toBeCloseTo(size / 2 + ((BLANK.left + BLANK.right) / 2 - 622) * scale, 0)
    expect(mass.y).toBeCloseTo(size / 2 + ((BLANK.top + BLANK.bottom) / 2 - 590) * scale, 0)
  })

  it.each(masked)(
    'shows the art’s box across 88% of what the mask over $file shows',
    async (icon) => {
      const { size, pixels } = read(await readFile(icon.file))
      expect(((art(pixels, size).width / size) * MASKED[icon.file]) / 72).toBeCloseTo(0.88, 2)
    },
  )

  it.each(unmasked)('centres $file on the art’s mass down and on its box across', async (icon) => {
    const { size, pixels } = read(await readFile(icon.file))
    const { middle, mass } = art(pixels, size)
    expect(Math.abs(mass.y - size / 2) / size).toBeLessThan(0.005)
    expect(Math.abs(middle - size / 2) / size).toBeLessThan(0.005)
  })

  it('links the iPhone’s icon from the app’s page: a file framed for its mask', async () => {
    const html = await readFile('index.html', 'utf8')
    const link = /<link rel="apple-touch-icon" href="\/([^"]+)"/.exec(html)?.[1]
    expect(MASKED[`public/${link}`]).toBe(72)
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
