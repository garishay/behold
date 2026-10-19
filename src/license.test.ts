// @vitest-environment node
// LICENSE (Gate 35, #79): the MIT License, word for word, then what it does not cover, named by
// path. Each path it names is in the repository, and every picture and every sound the repository
// tracks lies under one of them, so a new file or a moved folder can't leave LICENSE wrong.
/// <reference types="node" />
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const licence = readFileSync('LICENSE', 'utf8')
const [mit, rest = ''] = licence.split(/\n-{3,}\n/)
const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean)

/** Every path the section after the MIT License names: a folder, ending in a slash, or a file. */
const named = rest.match(/(?:[\w.-]+\/)+(?:\w[\w.-]*\w)?|\b[\w-]+\.(?:md|jpg|png)\b/g) ?? []
const under = (paths: readonly string[]) => (file: string) =>
  paths.some((path) => (path.endsWith('/') ? file.startsWith(path) : file === path))

const pictures = [
  'public/cases/',
  'public/title.jpg',
  'public/icons/',
  'assets/',
  'android/app/src/main/res/',
]
const sounds = ['public/audio/']

describe('LICENSE (Gate 35, #79)', () => {
  it('keeps the MIT License word for word above what it does not cover', () => {
    expect(createHash('sha256').update(mit.trimEnd()).digest('hex')).toBe(
      'cbd85847971e711017025368f56feee874e5753ee777c3c104c2e6256b920d78',
    )
  })

  it('names the cases, the pictures, and the sounds by paths the repository holds', () => {
    expect(named).toEqual(expect.arrayContaining(['src/cases/', ...pictures, ...sounds]))
    for (const path of named) expect(tracked.some(under([path])), path).toBe(true)
  })

  it('leaves out every picture the repository tracks', () => {
    const images = tracked.filter((file) =>
      /\.(png|jpe?g|webp|gif|svg|ico|avif|bmp|tiff?|heic|heif|jxl)$/i.test(file),
    )
    expect(images.filter((file) => !under(pictures)(file))).toEqual([])
  })

  it('leaves out every sound the repository tracks', () => {
    const audio = tracked.filter((file) =>
      /\.(m4a|mp3|wav|ogg|opus|flac|aac|aiff?|aifc|caf|wma|oga|weba)$/i.test(file),
    )
    expect(audio.filter((file) => !under(sounds)(file))).toEqual([])
  })
})
