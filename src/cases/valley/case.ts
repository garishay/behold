import type { CaseStructure } from '../types.ts'

// The tutorial: the valley of Elah (world rules §1), one moment, guided by steps. Ids, boxes,
// answers, and references only; every word the player reads is in en.ts. The giant's sheathed
// sword is his own tap's, not a spot inside his box: at phone size it did not read alone (#37).
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
      size: [900, 1125],
      spots: [
        { id: 'brook', box: [0, 83, 100, 17], words: ['stones', 'five'], cites: '17:40' },
        {
          id: 'giant',
          box: [0.5, 40, 80, 19.5],
          words: ['goliath', 'six', 'spear', 'sword'],
          person: 'd2',
          cites: '17:4',
        },
        { id: 'bearer', box: [6, 19, 25.5, 25], words: ['shield'], cites: '17:41' },
        {
          id: 'boy',
          box: [55.5, 4, 34, 52.5],
          words: ['david', 'sling'],
          person: 'd1',
          cites: '17:40',
        },
        {
          id: 'basket',
          box: [5.5, 64, 23.5, 11.5],
          words: ['ten', 'brothers', 'commander'],
          cites: '17:17-18',
        },
        {
          id: 'armor',
          box: [47, 64.5, 51, 17.5],
          words: ['saul', 'king', 'sword'],
          cites: '17:38-39',
        },
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
    { id: 'step2', until: { view: 'solve' } },
    { id: 'step3', until: { filled: 'd1' } },
    { id: 'step4', until: { filled: 't4' } },
    { id: 'step5', until: { found: 'all' } },
    // The one answer the tutorial asks the player to work out: whose sword it was (#77).
    { id: 'step6', until: { filled: 't5' }, ask: true },
    { id: 'step7' },
  ],
  // What settles each face and blank, for a hint to point at (#29).
  evidence: {
    d1: 'boy',
    d2: 'giant',
    t1: 'basket',
    t2: 'basket',
    t3: 'giant',
    t4: 'boy',
    t5: 'giant',
  },
} as const satisfies CaseStructure
