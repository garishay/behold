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
  // Each blank asks what the story turns on (docs/case-design.md, rule 7; #96): why the boy came,
  // the giant's measure, whose armor the boy took off, how he fought, and whose sword. The loaves'
  // count and the commander's cheeses stay in the account as details. The blanks are listed in the
  // account's order, the order a hint and the first ring take them in; Saul's keeps the id t2, so
  // a valley kept from before keeps its words, as misses (B5).
  blocks: [
    {
      id: 'account',
      blanks: { t1: 'brothers', t3: 'six', t2: 'saul', t4: 'sling', t5: 'goliath' },
    },
  ],
  steps: [
    { id: 'step1', until: { tapped: 'boy' } },
    // The boy's tap found two words, and the dock's line says so (#77).
    { id: 'step2', until: { read: 'found' } },
    { id: 'step3', until: { view: 'solve' } },
    // Both fills lead with the slot, so the valley practises twice the way that narrows the bank:
    // the slot under the boy dims sling for a name, and sling's blank dims David for a thing (#77).
    { id: 'step4', until: { filled: 'd1' }, slotFirst: true },
    { id: 'step5', until: { filled: 't4' }, slotFirst: true },
    { id: 'step6', until: { found: 'all' } },
    { id: 'step7' },
  ],
  // The one answer the tutorial asks the player to work out, on a miss: whose sword it was (#77).
  ask: 't5',
  // What settles each face and blank, for a hint to point at (#29).
  evidence: {
    d1: 'boy',
    d2: 'giant',
    t1: 'basket',
    t2: 'armor',
    t3: 'giant',
    t4: 'boy',
    t5: 'giant',
  },
  // The verse that says each answer, where the reveal points a miss (#107).
  verses: {
    d1: '17:50',
    d2: '17:4',
    t1: '17:17',
    t2: '17:38',
    t3: '17:4',
    t4: '17:40',
    t5: '17:50-51',
  },
} as const satisfies CaseStructure
