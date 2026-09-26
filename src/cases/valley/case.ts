import type { CaseStructure } from '../types.ts'

// The tutorial: the valley of Elah (world rules §1), one moment, guided by steps. Ids, boxes,
// answers, and references only; every word the player reads is in en.ts. The sheath lies inside
// the giant's box and is drawn over it, the smaller on top (#26 [7]).
export const valley = {
  id: 'valley',
  thumb: 'valley',
  passages: [
    { book: '1SA', chapter: 17, from: 4, to: 4 },
    { book: '1SA', chapter: 17, from: 17, to: 18 },
    { book: '1SA', chapter: 17, from: 38, to: 51 },
  ],
  moments: [
    {
      id: 'valley',
      picture: 'valley.jpg',
      size: [900, 1200],
      spots: [
        { id: 'brook', box: [0, 80, 100, 20], words: ['stones', 'five'], cites: '17:40' },
        {
          id: 'giant',
          box: [0, 44, 80, 26],
          words: ['goliath', 'six', 'spear'],
          person: 'd2',
          cites: '17:4',
        },
        { id: 'sheath', box: [6, 46, 26, 15], words: ['sword'], cites: '17:51' },
        { id: 'bearer', box: [2, 8, 46, 38], words: ['shield'], cites: '17:41' },
        {
          id: 'boy',
          box: [60, 18, 34, 42],
          words: ['david', 'sling'],
          person: 'd1',
          cites: '17:40',
        },
        {
          id: 'basket',
          box: [80, 40, 20, 14],
          words: ['ten', 'brothers', 'commander'],
          cites: '17:17-18',
        },
        { id: 'armor', box: [64, 62, 36, 24], words: ['saul', 'king', 'sword'], cites: '17:38-39' },
      ],
    },
  ],
  words: {
    david: 'name',
    goliath: 'name',
    saul: 'name',
    five: 'number',
    six: 'number',
    ten: 'number',
    sling: 'noun',
    spear: 'noun',
    shield: 'noun',
    stones: 'noun',
    sword: 'noun',
    brothers: 'noun',
    commander: 'noun',
    king: 'noun',
  },
  faces: [
    { id: 'd1', picture: 'd1.jpg', answer: 'david' },
    { id: 'd2', picture: 'd2.jpg', answer: 'goliath' },
  ],
  blocks: [
    {
      id: 'account',
      blanks: { t1: 'ten', t2: 'commander', t3: 'six', t4: 'sling', t5: 'goliath' },
    },
  ],
  steps: [
    { id: 'step1', until: { tapped: 'boy' } },
    { id: 'step2', until: { filled: 'd1' } },
    { id: 'step3', until: { filled: 't4' } },
    { id: 'step4' },
  ],
} as const satisfies CaseStructure
