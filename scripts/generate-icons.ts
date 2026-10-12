/**
 * Writes Behold's icons (Gate 18, #10) from the master, `assets/icon.png`: a scroll on two rollers
 * under a lens, with a blank in gold under the glass, generated in ChatGPT Images and retouched in
 * code (`docs/icon.md`). The master's ground is the manifest's background colour to every edge, so
 * each file frames it on that colour — the art at a share of the width, centred on the art's box —
 * and averages it down to the file's size. No image library: the script reads the one PNG it is
 * given and writes its own, so the files' provenance is the master and this script, and a test
 * holds the committed pixels to the function that made them.
 *
 * Run: `npm run icons`
 */

import { readFile, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { deflateSync, inflateSync } from 'node:zlib'

export const MASTER = 'assets/icon.png'

/** The manifest's background colour: the master's ground, and every frame's. */
export const GROUND = [0x1b, 0x20, 0x33] as const

/** The art's box in the master, edges inclusive: the knobs, the rollers, and the lens's handle. */
export const ART = { left: 53, top: 146, right: 1199, bottom: 1129 } as const

/**
 * The master's outer band, in its pixels, that fades to the ground exactly. The master's ground
 * sits up to a level below #1B2033 at its edges, and a level's step in that dark blue would show as
 * a square on the splash. Nothing in the band is more than 5 levels off the ground, and the art is
 * 53 px in at its nearest.
 */
const FADE = 40

/** The art's share of the store's icon, as the owner approved it and ruled: the master at 82%. */
const STORE = 0.75

/**
 * The files the manifest and the page name, each with the art's share of its width. The 512 is
 * also the store's icon. Bubblewrap draws its splash at 300 dp from the largest `any` icon, up to
 * 1,200 px, so the 1024 gives it the art rather than the 512 enlarged (Gate 18's ruling). It lays
 * the maskable image over 91 dp of the launcher's 108 and shows the middle 72, so the launcher
 * shows the store's framing, and the whole art sits inside the 66 dp circle no mask clips. A
 * browser's tab draws the favicon at 16 px, unmasked.
 */
export const ICONS = [
  { file: 'icon-192.png', size: 192, share: STORE },
  { file: 'icon-512.png', size: 512, share: STORE },
  { file: 'icon-1024.png', size: 1024, share: STORE },
  { file: 'icon-512-maskable.png', size: 512, share: STORE * (72 / 91) },
  { file: 'favicon-48.png', size: 48, share: 0.9 },
] as const

export interface Raster {
  width: number
  height: number
  /** RGB, three bytes a pixel, row by row. */
  pixels: Uint8Array
}

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/** The Paeth predictor (PNG, filter type 4): whichever neighbour is closest to a + b − c. */
function paeth(a: number, b: number, c: number): number {
  const p = a + b - c
  const [pa, pb, pc] = [Math.abs(p - a), Math.abs(p - b), Math.abs(p - c)]
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}

/** Reads an 8-bit RGB PNG, not interlaced — the master's kind, and the only kind this reads. */
export function decode(file: Buffer): Raster {
  if (!file.subarray(0, 8).equals(SIGNATURE)) throw new Error('not a PNG')
  let [width, height] = [0, 0]
  const idat: Buffer[] = []
  for (let at = 8; at < file.length;) {
    const length = file.readUInt32BE(at)
    const type = file.toString('ascii', at + 4, at + 8)
    const data = file.subarray(at + 8, at + 8 + length)
    if (type === 'IHDR') {
      ;[width, height] = [data.readUInt32BE(0), data.readUInt32BE(4)]
      if (data[8] !== 8 || data[9] !== 2 || data[12] !== 0)
        throw new Error('the master must be an 8-bit RGB PNG, not interlaced')
    }
    if (type === 'IDAT') idat.push(data)
    at += 12 + length
  }
  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * 3
  const pixels = new Uint8Array(stride * height)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    for (let x = 0; x < stride; x++) {
      const at = y * stride + x
      const a = x >= 3 ? pixels[at - 3] : 0
      const b = y > 0 ? pixels[at - stride] : 0
      const c = x >= 3 && y > 0 ? pixels[at - stride - 3] : 0
      const predicted = [0, a, b, (a + b) >> 1, paeth(a, b, c)][filter]
      pixels[at] = (raw[y * (stride + 1) + 1 + x] + predicted) & 0xff
    }
  }
  return { width, height, pixels }
}

/** Each output pixel's span along one axis: the master's pixels it covers, with each one's share. */
function spans(size: number, start: number, step: number) {
  return Array.from({ length: size }, (_, i) => {
    const [from, to] = [start + i * step, start + (i + 1) * step]
    const span: { at: number; weight: number }[] = []
    for (let at = Math.floor(from); at < to; at++)
      span.push({ at, weight: Math.min(at + 1, to) - Math.max(at, from) })
    return span
  })
}

/**
 * The master framed for one file: a square on the ground whose width the art fills at `share`,
 * centred on the art's box, each output pixel the average of the master's pixels it covers — the
 * ground beyond the master's edges, and its outer band faded to the ground. RGBA, opaque: the
 * store asks for a 32-bit PNG.
 */
export function frame(master: Raster, size: number, share: number): Uint8Array {
  const side = (ART.right + 1 - ART.left) / share
  const step = side / size
  const columns = spans(size, (ART.left + ART.right + 1 - side) / 2, step)
  const rows = spans(size, (ART.top + ART.bottom + 1 - side) / 2, step)
  const pixels = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const sum = [0, 0, 0]
      for (const row of rows[y])
        for (const column of columns[x]) {
          const edge = Math.min(
            row.at,
            column.at,
            master.height - 1 - row.at,
            master.width - 1 - column.at,
          )
          const fade = Math.min(1, Math.max(0, (edge + 1) / FADE))
          const at = (row.at * master.width + column.at) * 3
          for (let k = 0; k < 3; k++) {
            const value =
              fade > 0 ? GROUND[k] + fade * (master.pixels[at + k] - GROUND[k]) : GROUND[k]
            sum[k] += row.weight * column.weight * value
          }
        }
      const at = (y * size + x) * 4
      for (let k = 0; k < 3; k++) pixels[at + k] = Math.round(sum[k] / (step * step))
      pixels[at + 3] = 255
    }
  return pixels
}

const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Uint8Array): Buffer {
  const head = Buffer.alloc(4)
  head.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const tail = Buffer.alloc(4)
  tail.writeUInt32BE(crc32(body))
  return Buffer.concat([head, body, tail])
}

/** A PNG of the RGBA rows: 8 bits a channel, 32 a pixel, no interlace, filter 0 on every row. */
export function png(size: number, pixels: Uint8Array): Buffer {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr.set([8, 6, 0, 0, 0], 8)
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let row = 0; row < size; row++)
    raw.set(pixels.subarray(row * size * 4, (row + 1) * size * 4), row * (size * 4 + 1) + 1)
  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', new Uint8Array()),
  ])
}

async function main(): Promise<void> {
  const master = decode(await readFile(MASTER))
  for (const { file, size, share } of ICONS) {
    await writeFile(`public/icons/${file}`, png(size, frame(master, size, share)))
    process.stdout.write(`wrote public/icons/${file}\n`)
  }
}

if (process.argv[1] && basename(process.argv[1]) === 'generate-icons.ts') await main()
