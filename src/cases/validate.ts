/**
 * The validator (Gate 02 A6, layer 2): the checks the types cannot make — a reference resolving,
 * a word reachable, a count, a box inside its picture, a string with words in it — over a case
 * and one of its texts. One sentence per problem; an empty list is a valid case. The test job
 * runs it over every registered case (`cases.test.ts`); the checks are A6's list, (a) to (i),
 * and the reference is `docs/case-file.md`.
 */
import type { CaseStructure, CaseText, Passage } from './types.ts'

/** An id (docs/case-file.md, Ids). */
const slug = /^[a-z][a-z0-9-]*$/
/** A picture: a slug with the JPEG extension, and no path (Pictures). */
const file = /^[a-z][a-z0-9-]*\.jpg$/
/** A USFM book code: three capitals, the first a digit for a numbered book — `PSA`, `1SA`. */
const book = /^[1-3A-Z][A-Z]{2}$/
/** A cite: a verse or a run of verses within a chapter, with or without the book in front. */
const cite = /^(?:([1-3A-Z][A-Z]{2}) )?([1-9]\d*):([1-9]\d*)(?:-([1-9]\d*))?$/

/** A whole number of one or more: a chapter, a verse. */
const counts = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 1
const q = (s: string) => JSON.stringify(s)
/** A passage as a problem names it: `1SA 17:17-18`, or `1KI 21` for a whole chapter. */
const ref = (p: Passage) =>
  `${p.book} ${p.chapter}` +
  (p.from === undefined && p.to === undefined ? '' : `:${p.from}-${p.to}`)

/** A cite read: the book when it is in front, the chapter, the first and the last verse. */
type Cite = { book?: string; chapter: number; from: number; to: number }

/** A cite's parts, or nothing when the string is not one: `1KI 21:1`, `17:38-39`. */
function parseCite(s: string): Cite | undefined {
  const m = cite.exec(s)
  if (!m) return undefined
  const [prefix, chapter, from, to] = [m.at(1), +m[2], +m[3], +(m.at(4) ?? m[3])]
  return from <= to ? { book: prefix, chapter, from, to } : undefined
}

/** Every string in a value with its path — `text.captions.boy`, `text.blocks.account.parts.0.t`. */
function strings(value: unknown, path: string): (readonly [string, string])[] {
  if (typeof value === 'string') return [[path, value]]
  if (typeof value !== 'object' || value === null) return []
  return Object.entries(value).flatMap(([key, v]) => strings(v, `${path}.${key}`))
}

/**
 * The problems with a case and one of its texts, one sentence each; none for a valid case. A
 * problem names the thing by its id and says what the reference asks of it.
 */
export function validate(structure: CaseStructure, text: CaseText<CaseStructure>): string[] {
  const problems: string[] = []
  const fail = (problem: string) => void problems.push(problem)
  const { moments, faces, blocks, passages, order } = structure
  const spots = moments.flatMap((m) => m.spots)
  const steps = structure.steps ?? []

  // (a) Ids are slugs and unique within their kind — blank ids across every block. The list is
  // of ids, or of the things that carry one.
  const ids = (kind: string, list: readonly (string | { readonly id: string })[]) => {
    const seen = new Set<string>()
    for (const item of list) {
      const id = typeof item === 'string' ? item : item.id
      if (!slug.test(id)) fail(`${kind} ${q(id)} is not a slug`)
      if (seen.has(id)) fail(`${kind} ${q(id)} is declared twice`)
      seen.add(id)
    }
    return seen
  }
  ids('case', [structure.id])
  const momentIds = ids('moment', moments)
  const spotIds = ids('spot', spots)
  const words = ids('word', Object.keys(structure.words))
  const faceIds = ids('face', faces)
  ids('block', blocks)
  const blanks = blocks.flatMap((b) => Object.keys(b.blanks))
  const blankIds = ids('blank', blanks)
  ids('step', steps)

  // (b) The thumb is a moment; a passage is a book code, a chapter, and a verse range or none.
  if (!momentIds.has(structure.thumb)) fail(`thumb ${q(structure.thumb)} is not a moment`)
  for (const p of passages) {
    if (!book.test(p.book)) fail(`passage ${ref(p)} has no book code`)
    if (!counts(p.chapter)) fail(`passage ${ref(p)} has no chapter`)
    const whole = p.from === undefined && p.to === undefined
    if (!whole && !(counts(p.from) && counts(p.to) && p.from <= p.to))
      fail(`passage ${ref(p)} is not a verse range`)
  }

  // (c) A moment's picture is a file name and it has one to eight spots (world rules §6); a
  // spot's box lies inside the picture, its words are words, its person a face, its paper a
  // slug, and its cite lies within a passage — the book in front exactly when the passages span
  // more than one book (Gate 02 ruling [1]).
  const spans = new Set(passages.map((p) => p.book)).size > 1
  const within = (c: Cite) =>
    passages.some(
      (p) =>
        (c.book ?? p.book) === p.book &&
        p.chapter === c.chapter &&
        c.from >= (p.from ?? 1) &&
        c.to <= (p.to ?? Infinity),
    )
  for (const m of moments) {
    if (!file.test(m.picture)) fail(`moment ${q(m.id)} picture ${q(m.picture)} is not a file name`)
    if (m.spots.length < 1 || m.spots.length > 8)
      fail(`moment ${q(m.id)} has ${m.spots.length} spots, not one to eight`)
    for (const s of m.spots) {
      const [left, top, width, height] = s.box
      const inside = left >= 0 && top >= 0 && width > 0 && height > 0
      if (!inside || left + width > 100 || top + height > 100)
        fail(`spot ${q(s.id)} box [${s.box.join(', ')}] does not lie inside the picture`)
      for (const w of s.words) if (!words.has(w)) fail(`spot ${q(s.id)} yields ${q(w)}, not a word`)
      if (s.person !== undefined && !faceIds.has(s.person))
        fail(`spot ${q(s.id)} shows ${q(s.person)}, not a face`)
      if (s.paper !== undefined && !slug.test(s.paper))
        fail(`spot ${q(s.id)} opens ${q(s.paper)}, not a slug`)
      if (s.cites === undefined) continue
      const c = parseCite(s.cites)
      if (!c) fail(`spot ${q(s.id)} cites ${q(s.cites)}, not a cite`)
      else if ((c.book !== undefined) !== spans)
        fail(
          `spot ${q(s.id)} cites ${q(s.cites)} ${c.book ? 'with' : 'without'} its book in front, and the passages ${spans ? 'span more than one book' : 'are one book'}`,
        )
      else if (!within(c)) fail(`spot ${q(s.id)} cites ${q(s.cites)}, outside the passages`)
    }
  }

  // (d) Every word is yielded by some spot.
  const yielded = new Set(spots.flatMap((s) => s.words))
  for (const w of words) if (!yielded.has(w)) fail(`word ${q(w)} is yielded by no spot`)

  // (e) A face's picture is a file name and its answer a name word.
  for (const f of faces) {
    if (!file.test(f.picture)) fail(`face ${q(f.id)} picture ${q(f.picture)} is not a file name`)
    if (structure.words[f.answer] !== 'name')
      fail(`face ${q(f.id)} answers ${q(f.answer)}, not a name word`)
  }

  // (f) At least one block; a blank's answer is a word, and the blank appears exactly once in
  // its block's text.
  if (blocks.length === 0) fail('the case has no block')
  for (const b of blocks)
    for (const [blank, answer] of Object.entries(b.blanks)) {
      if (!words.has(answer)) fail(`blank ${q(blank)} answers ${q(answer)}, not a word`)
      const times = text.blocks[b.id].parts.filter((p) => p.b === blank).length
      if (times !== 1)
        fail(`blank ${q(blank)} appears ${times} times in block ${q(b.id)}, not once`)
    }

  // (g) An order, when present, is the moments in some order.
  const permutes =
    order === undefined ||
    (order.length === moments.length &&
      new Set(order).size === order.length &&
      order.every((id) => momentIds.has(id)))
  if (!permutes) fail(`order [${order.join(', ')}] is not the moments in some order`)

  // (h) Every step but the last has an until and the last has none; an until names a spot, or a
  // face or a blank.
  steps.forEach((s, i) => {
    const last = i === steps.length - 1
    if (last && s.until) fail(`step ${q(s.id)} is last and has an until`)
    if (!last && !s.until) fail(`step ${q(s.id)} is not last and lacks an until`)
    const tapped = s.until?.tapped
    const filled = s.until?.filled
    if (tapped !== undefined && !spotIds.has(tapped))
      fail(`step ${q(s.id)} waits on ${q(tapped)}, not a spot`)
    if (filled !== undefined && !faceIds.has(filled) && !blankIds.has(filled))
      fail(`step ${q(s.id)} waits on ${q(filled)}, not a face or a blank`)
  })

  // (i) No text is empty: whitespace alone is empty — but for a part's run of text, which may be
  // the space between two blanks.
  for (const [path, s] of strings(text, 'text'))
    if ((/\.parts\.\d+\.t$/.test(path) ? s : s.trim()) === '') fail(`${path} is empty`)

  return problems
}
