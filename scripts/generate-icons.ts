/**
 * Writes the placeholder app icons (Gate 01 A2): a flat oil lamp — the shallow clay saucer with a
 * pinched spout that the world rules name as the Behold icon — on the night colour, as three PNGs
 * in `public/icons/`: 192 and 512 for `any`, and a 512 `maskable` with the lamp drawn inside the
 * safe zone. Drawn from shapes here rather than exported from a tool so the files' provenance is
 * this script, and deterministic so a test can hold the committed pixels to the function that made
 * them. The real icon is #10.
 *
 * Run: `npm run icons`
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { deflateSync } from 'node:zlib'

type Rgb = readonly [number, number, number]

/** The manifest's theme colour; the icons' ground. */
export const NIGHT: Rgb = [0x23, 0x2a, 0x3d]
const CLAY: Rgb = [0xcd, 0xbb, 0x93]
const CLAY_SHADE: Rgb = [0x8b, 0x7a, 0x55]
const GOLD: Rgb = [0xc9, 0xa9, 0x4e]
const MIST: Rgb = [0xe6, 0xe1, 0xd6]

/** The three files the manifest names. `scale` shrinks the lamp toward the centre. */
export const ICONS = [
  { file: 'icon-192.png', size: 192, scale: 1 },
  { file: 'icon-512.png', size: 512, scale: 1 },
  // The maskable safe zone is the circle inscribed in the inner 80% of the square.
  { file: 'icon-512-maskable.png', size: 512, scale: 0.8 },
] as const

const ellipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) =>
  ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1

/** Barycentric sign test: the point is inside when it is on the same side of all three edges. */
function triangle(x: number, y: number, ...p: [number, number, number, number, number, number]) {
  const side = (ax: number, ay: number, bx: number, by: number) =>
    (bx - ax) * (y - ay) - (by - ay) * (x - ax)
  const a = side(p[0], p[1], p[2], p[3])
  const b = side(p[2], p[3], p[4], p[5])
  const c = side(p[4], p[5], p[0], p[1])
  return (a >= 0 && b >= 0 && c >= 0) || (a <= 0 && b <= 0 && c <= 0)
}

/** The lamp at a point of the unit square, painter's order — the last shape that holds the point wins. */
export function lampAt(x: number, y: number): Rgb {
  let colour = NIGHT
  // The saucer: the lower half of an ellipse below the rim line, pinched to a spout on the right.
  if (
    (y >= 0.54 && ellipse(x, y, 0.47, 0.54, 0.34, 0.15)) ||
    triangle(x, y, 0.75, 0.495, 0.86, 0.54, 0.75, 0.585)
  )
    colour = CLAY
  // The opening, seen from a little above.
  if (ellipse(x, y, 0.47, 0.54, 0.34, 0.05)) colour = CLAY_SHADE
  // The flame, rising from the spout: a round base drawn up to a point, with a pale core.
  if (ellipse(x, y, 0.82, 0.465, 0.05, 0.05) || triangle(x, y, 0.77, 0.465, 0.87, 0.465, 0.82, 0.3))
    colour = GOLD
  if (ellipse(x, y, 0.82, 0.475, 0.02, 0.02)) colour = MIST
  return colour
}

/** The icon's RGB rows, 3 × 3 samples per pixel so the flat shapes keep a clean edge. */
export function lampPixels(size: number, scale: number): Uint8Array {
  const pixels = new Uint8Array(size * size * 3)
  const samples = 3
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const sum = [0, 0, 0]
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const x = 0.5 + ((px + (sx + 0.5) / samples) / size - 0.5) / scale
          const y = 0.5 + ((py + (sy + 0.5) / samples) / size - 0.5) / scale
          const [r, g, b] = lampAt(x, y)
          sum[0] += r
          sum[1] += g
          sum[2] += b
        }
      }
      const at = (py * size + px) * 3
      sum.forEach((channel, i) => (pixels[at + i] = Math.round(channel / (samples * samples))))
    }
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

/** A PNG of the RGB rows: 8-bit truecolour, no alpha, no interlace, filter 0 on every row. */
export function png(size: number, pixels: Uint8Array): Buffer {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr.set([8, 2, 0, 0, 0], 8)
  const raw = Buffer.alloc((size * 3 + 1) * size)
  for (let row = 0; row < size; row++)
    raw.set(pixels.subarray(row * size * 3, (row + 1) * size * 3), row * (size * 3 + 1) + 1)
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', new Uint8Array()),
  ])
}

async function main(): Promise<void> {
  await mkdir('public/icons', { recursive: true })
  for (const { file, size, scale } of ICONS) {
    await writeFile(`public/icons/${file}`, png(size, lampPixels(size, scale)))
    process.stdout.write(`wrote public/icons/${file}\n`)
  }
}

if (process.argv[1] && basename(process.argv[1]) === 'generate-icons.ts') await main()
