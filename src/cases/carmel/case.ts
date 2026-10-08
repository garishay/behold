import type { CaseStructure } from '../types.ts'

// Case two: the contest on Mount Carmel (1 Kings 18:17–40), the bridge between the valley and the
// vineyard (#30). Its one new idea is several moments and the order they happened in, so it has no
// papers, and every name comes from a person's tap, as in the valley (docs/case-design.md, rule
// 6). The first-encounter mark rings the order's pictures and slots (`teach`). With the valley it
// teaches the loop, so from its second failed close a close marks the answers (`marks`, #106). The
// boxes are fitted to the pictures as they were generated from the scene briefs (scenes.md, world
// rules §6).
// The trench runs behind the altar, so its box is the larger and the altar is drawn over it.
export const carmel = {
  id: 'carmel',
  thumb: 'water',
  passages: [{ book: '1KI', chapter: 18, from: 17, to: 40 }],
  moments: [
    {
      id: 'water',
      picture: 'water.jpg',
      size: [900, 1125],
      spots: [
        { id: 'altar', box: [25.5, 33.5, 51, 30.5], words: [], cites: '18:30-32' },
        { id: 'pourers', box: [27, 20, 45, 17], words: ['jars'], cites: '18:33' },
        {
          id: 'caller',
          box: [4, 14, 23, 43.5],
          words: ['elijah'],
          person: 'c1',
          cites: '18:34',
        },
        { id: 'trench', box: [8.5, 52.5, 85.5, 19], words: [], cites: '18:32-35' },
        { id: 'spent', box: [74.5, 24, 24, 18], words: [], cites: '18:29' },
      ],
    },
    {
      id: 'fire',
      picture: 'fire.jpg',
      size: [900, 1125],
      spots: [
        { id: 'fire', box: [31.5, 0, 40.5, 66], words: ['stones'], cites: '18:38' },
        { id: 'dry', box: [10, 57, 79, 14], words: [], cites: '18:38' },
        { id: 'faces', box: [3, 71, 94, 28], words: ['fell-on-faces'], cites: '18:39' },
        {
          id: 'praying',
          box: [12, 24.5, 19.5, 33.5],
          words: [],
          person: 'c1',
          cites: '18:36-37',
        },
      ],
    },
    {
      id: 'baal',
      picture: 'baal.jpg',
      size: [900, 1125],
      spots: [
        {
          id: 'prophets',
          box: [2, 23, 65.5, 28],
          words: ['cried-aloud', 'prophets', 'baal'],
          cites: '18:22-29',
        },
        { id: 'mocker', box: [75, 21.5, 21, 30], words: ['elijah'], person: 'c1', cites: '18:27' },
        { id: 'crowd', box: [2, 69.5, 96, 30], words: ['said-nothing'], cites: '18:21' },
        { id: 'king', box: [67.5, 0, 32.5, 21], words: ['ahab'], person: 'c2', cites: '18:20' },
        { id: 'ruin', box: [2, 54, 44, 15], words: [], cites: '18:30' },
      ],
    },
  ],
  words: {
    elijah: 'name',
    ahab: 'name',
    baal: 'name',
    'said-nothing': 'action',
    'fell-on-faces': 'action',
    'cried-aloud': 'action',
    stones: 'noun',
    prophets: 'noun',
    jars: 'noun',
  },
  faces: [
    { id: 'c1', picture: 'c1.jpg', answer: 'elijah' },
    { id: 'c2', picture: 'c2.jpg', answer: 'ahab' },
  ],
  order: ['baal', 'water', 'fire'],
  blocks: [
    {
      id: 'account',
      blanks: { a1: 'said-nothing', a2: 'cried-aloud', a3: 'stones', a4: 'fell-on-faces' },
    },
  ],
  teach: 'order',
  marks: true,
  // What settles each face and blank, and the sun that dates each moment, for a hint (#29).
  evidence: {
    c1: 'caller',
    c2: 'king',
    a1: 'crowd',
    a2: 'prophets',
    a3: 'fire',
    a4: 'faces',
    baal: 'mocker',
    water: 'spent',
    fire: 'praying',
  },
} as const satisfies CaseStructure
