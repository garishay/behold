import type { CaseStructure } from '../types.ts'

// Case six: Naaman and Gehazi (2 Kings 5). Its one new idea is a lie: the prophet's servant tells
// the commander his master sent him, and tells his master he went nowhere, and the second block
// sets each claim against what the pictures show, with the claim's own word among the rivals. The
// first-encounter mark rings the first of those blanks on Solve (`teach`). There is no paper: the
// faces' names come from people's words, the servant's muttered plan naming the commander and the
// prophet's question naming his servant, as rule 6 allows. The boxes are fitted to the pictures as
// they were generated from the scene briefs (scenes.md, world rules §6).
export const naaman = {
  id: 'naaman',
  thumb: 'road',
  passages: [{ book: '2KI', chapter: 5 }],
  moments: [
    {
      id: 'road',
      picture: 'road.jpg',
      size: [900, 1125],
      spots: [
        {
          id: 'runner',
          box: [8, 20, 28, 32],
          words: ['asked-for', 'one'],
          person: 'f2',
          cites: '5:21-22',
        },
        { id: 'greeting', box: [36, 16, 27, 39], words: [], person: 'f1', cites: '5:21' },
        { id: 'chariot', box: [65, 19, 27, 23], words: ['chariot', 'horse'], cites: '5:21' },
        { id: 'bags', box: [10, 52, 49, 42], words: ['two'], cites: '5:23' },
        { id: 'laden', box: [57, 46, 35, 32], words: [], cites: '5:17' },
      ],
    },
    {
      id: 'house',
      picture: 'house.jpg',
      size: [900, 1125],
      spots: [
        { id: 'alcove', box: [8, 22, 19, 45], words: [], cites: '5:24' },
        { id: 'servant', box: [28, 24, 25, 61], words: [], person: 'f2', cites: '5:25-27' },
        { id: 'master', box: [57, 38, 35, 42], words: ['gehazi'], cites: '5:25' },
        { id: 'door', box: [61, 13, 25, 30], words: [], cites: '5:24' },
      ],
    },
    {
      id: 'gift',
      picture: 'gift.jpg',
      size: [900, 1125],
      spots: [
        { id: 'doorway', box: [8, 29, 14, 23], words: ['naaman'], person: 'f2', cites: '5:20' },
        { id: 'prophet', box: [19, 31, 18, 29], words: ['elisha', 'refused'], cites: '5:15-16' },
        {
          id: 'commander',
          box: [41, 31, 18, 30],
          words: ['accepted'],
          person: 'f1',
          cites: '5:14-15',
        },
        { id: 'gifts', box: [59, 35, 33, 29], words: ['silver', 'gold', 'ten'], cites: '5:5' },
        { id: 'mules', box: [8, 62, 84, 27], words: ['earth', 'mule'], cites: '5:17' },
      ],
    },
  ],
  words: {
    naaman: 'name',
    gehazi: 'name',
    elisha: 'name',
    refused: 'action',
    accepted: 'action',
    'asked-for': 'action',
    two: 'number',
    one: 'number',
    ten: 'number',
    earth: 'noun',
    silver: 'noun',
    gold: 'noun',
    chariot: 'noun',
    horse: 'noun',
    mule: 'noun',
  },
  faces: [
    { id: 'f1', picture: 'f1.jpg', answer: 'naaman' },
    { id: 'f2', picture: 'f2.jpg', answer: 'gehazi' },
  ],
  order: ['gift', 'road', 'house'],
  blocks: [
    { id: 'account', blanks: { a1: 'earth', a2: 'chariot' } },
    { id: 'claims', blanks: { l1: 'refused', l2: 'two' } },
  ],
  teach: { blank: 'l1' },
  // What settles each face and blank, and what dates each moment, for a hint (#29): the silver's
  // way from the prophet's door to the servant's hiding place, and the servant's skin at the end.
  evidence: {
    f1: 'doorway',
    f2: 'master',
    a1: 'mules',
    a2: 'chariot',
    l1: 'prophet',
    l2: 'bags',
    gift: 'gifts',
    road: 'bags',
    house: 'servant',
  },
  // The verse that says each answer, and that tells each moment, where the reveal points a miss
  // (#107): the commander named, the servant named as he sets out, the earth, the chariot, the
  // refusal, and the two talents; the gift pressed at the door, the silver given to two servants,
  // and the servant gone white.
  verses: {
    f1: '5:1',
    f2: '5:20',
    a1: '5:17',
    a2: '5:21',
    l1: '5:16',
    l2: '5:23',
    gift: '5:15',
    road: '5:23',
    house: '5:27',
  },
} as const satisfies CaseStructure
