import type { CaseStructure } from '../types.ts'

// Case seven: Jehu at Jezreel (2 Kings 9, with Elijah's word in 1 Kings 21:17–29). Its one new idea
// is a word kept: what happens at Jezreel is what Elijah said in the vineyard, and the second block
// sets each part of the word beside the picture that keeps it, with the word's own name among the
// rivals. The first-encounter mark rings the first of those blanks on Solve (`teach`). There is no
// paper: the faces' names come from people's words, the officers' shout and the fleeing king's
// cry, as rule 6 allows. The passages span two books, so every cite carries its book. The boxes are
// fitted to the pictures as they were generated from the scene briefs (scenes.md, world rules §6).
export const jehu = {
  id: 'jehu',
  thumb: 'plot',
  passages: [
    { book: '1KI', chapter: 21, from: 17, to: 29 },
    { book: '2KI', chapter: 9 },
  ],
  moments: [
    {
      id: 'plot',
      picture: 'plot.jpg',
      size: [900, 1125],
      spots: [
        {
          id: 'bow',
          box: [28, 30, 24, 36],
          words: ['chariot'],
          person: 'f1',
          cites: '2KI 9:24-25',
        },
        { id: 'aide', box: [9, 36, 19, 21], words: ['ahab'], cites: '2KI 9:25-26' },
        { id: 'king', box: [57, 41, 35, 27], words: ['joram', 'ahaziah'], cites: '2KI 9:21-24' },
        { id: 'fleeing', box: [64, 6, 28, 28], words: [], person: 'f2', cites: '2KI 9:21-27' },
        {
          id: 'horsemen',
          box: [8, 20, 27, 16],
          words: ['horsemen', 'driving'],
          cites: '2KI 9:17-20',
        },
        { id: 'beds', box: [54, 69, 38, 29], words: [], cites: '2KI 9:21' },
      ],
    },
    {
      id: 'window',
      picture: 'window.jpg',
      size: [900, 1125],
      spots: [
        { id: 'queen', box: [38, 13, 18, 17], words: ['zimri'], cites: '2KI 9:30-31' },
        { id: 'eunuchs', box: [65, 13, 20, 17], words: ['eunuchs'], cites: '2KI 9:32' },
        {
          id: 'gate',
          box: [37, 40, 55, 52],
          words: ['horses'],
          person: 'f1',
          cites: '2KI 9:31-33',
        },
        { id: 'dogs', box: [8, 72, 23, 20], words: [], cites: '1KI 21:23' },
      ],
    },
    {
      id: 'steps',
      picture: 'steps.jpg',
      size: [900, 1125],
      spots: [
        { id: 'runner', box: [9, 40, 18, 22], words: ['jeroboam', 'baasha'], cites: '2KI 9:1-10' },
        { id: 'anointed', box: [36, 24, 26, 44], words: [], person: 'f1', cites: '2KI 9:6-13' },
        { id: 'horn', box: [65, 31, 27, 26], words: ['jehu'], cites: '2KI 9:13' },
        { id: 'cloaks', box: [8, 56, 84, 37], words: ['officers'], cites: '2KI 9:13' },
      ],
    },
  ],
  words: {
    jehu: 'name',
    ahaziah: 'name',
    joram: 'name',
    ahab: 'name',
    zimri: 'name',
    jeroboam: 'name',
    baasha: 'name',
    driving: 'noun',
    horses: 'noun',
    chariot: 'noun',
    eunuchs: 'noun',
    officers: 'noun',
    horsemen: 'noun',
  },
  faces: [
    { id: 'f1', picture: 'f1.jpg', answer: 'jehu' },
    { id: 'f2', picture: 'f2.jpg', answer: 'ahaziah' },
  ],
  order: ['steps', 'plot', 'window'],
  blocks: [
    { id: 'account', blanks: { a1: 'driving', a2: 'zimri' } },
    { id: 'word', blanks: { w1: 'joram', w2: 'eunuchs' } },
  ],
  teach: { blank: 'w1' },
  // What settles each face and blank, and what dates each moment, for a hint (#29): the officers'
  // shout at the start, the king's stopped chariot, and the queen's greeting at the gate.
  evidence: {
    f1: 'horn',
    f2: 'king',
    a1: 'horsemen',
    a2: 'queen',
    w1: 'aide',
    w2: 'eunuchs',
    steps: 'horn',
    plot: 'king',
    window: 'queen',
  },
  // The verse that says each answer, and that tells each moment, where the reveal points a miss
  // (#107): Jehu drawing his bow, the cry that names Ahaziah, the lookout on his driving, the
  // queen's greeting, Joram shot and thrown on the plot, and the eunuchs who threw her down; the
  // shout on the bare steps, the arrow, and the queen at her window.
  verses: {
    f1: '2KI 9:24',
    f2: '2KI 9:23',
    a1: '2KI 9:20',
    a2: '2KI 9:31',
    w1: '2KI 9:24-25',
    w2: '2KI 9:32-33',
    steps: '2KI 9:13',
    plot: '2KI 9:24',
    window: '2KI 9:30',
  },
} as const satisfies CaseStructure
