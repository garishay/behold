import type { CaseStructure } from '../types.ts'

// Case four: Micaiah and the four hundred, and the battle at Ramoth-gilead (1 Kings 22:1–40, #53).
// Its one new idea is a disguise: the king of Israel goes into battle without his marker, and the
// player names him by what the pictures show happening, never by his face. The first-encounter mark
// rings his face on Solve (`teach`). The case has no paper: the faces' names come from other
// people's words, as rule 6 allows from the vineyard on — the king's, naming the one prophet he
// hates (`kings`), and Micaiah's vision, naming the king who will fall (`plain`). The boxes are
// fitted to the pictures as they were generated from the scene briefs (scenes.md, world rules §6).
export const micaiah = {
  id: 'micaiah',
  thumb: 'battle',
  passages: [{ book: '1KI', chapter: 22, from: 1, to: 40 }],
  moments: [
    {
      id: 'battle',
      picture: 'battle.jpg',
      size: [900, 1125],
      spots: [
        { id: 'robed', box: [0, 15.5, 33, 35.5], words: ['robes'], cites: '22:30-32' },
        { id: 'captains', box: [34, 9, 64.5, 19], words: ['thirty-two'], cites: '22:31-33' },
        {
          id: 'rider',
          box: [61.5, 27, 33.5, 39],
          words: ['armor', 'breastplate'],
          person: 'm1',
          cites: '22:30-34',
        },
        { id: 'archer', box: [6, 42, 52, 58], words: [], cites: '22:34' },
      ],
    },
    {
      id: 'pool',
      picture: 'pool.jpg',
      size: [900, 1125],
      spots: [
        { id: 'chariot', box: [8.5, 22.5, 60, 38], words: [], cites: '22:35-38' },
        { id: 'pool', box: [0, 67, 100, 33], words: ['pool'], cites: '22:38' },
        { id: 'dogs', box: [0, 52.5, 27.5, 16.5], words: [], cites: '22:38' },
        { id: 'armor', box: [66.5, 51.5, 33, 11.5], words: [], cites: '22:34' },
      ],
    },
    {
      id: 'thrones',
      picture: 'thrones.jpg',
      size: [900, 1125],
      spots: [
        {
          id: 'kings',
          box: [48.5, 15, 36, 24],
          words: ['two', 'refrain', 'jehoshaphat', 'micaiah'],
          cites: '22:6-10',
        },
        {
          id: 'prophets',
          box: [0, 23, 33, 70],
          words: ['four-hundred', 'go-up'],
          cites: '22:6-12',
        },
        { id: 'horns', box: [30, 28, 37, 63], words: ['zedekiah'], cites: '22:11-24' },
        {
          id: 'plain',
          box: [67.5, 40.5, 20.5, 51],
          words: ['go-home', 'ahab'],
          person: 'm2',
          cites: '22:15-24',
        },
        { id: 'gate', box: [29, 2, 71, 39], words: ['gate', 'threshing-floor'], cites: '22:10' },
      ],
    },
  ],
  words: {
    ahab: 'name',
    micaiah: 'name',
    jehoshaphat: 'name',
    zedekiah: 'name',
    'go-up': 'action',
    refrain: 'action',
    'go-home': 'action',
    'four-hundred': 'number',
    'thirty-two': 'number',
    two: 'number',
    robes: 'noun',
    armor: 'noun',
    breastplate: 'noun',
    pool: 'noun',
    gate: 'noun',
    'threshing-floor': 'noun',
  },
  faces: [
    { id: 'm1', picture: 'm1.jpg', answer: 'ahab' },
    { id: 'm2', picture: 'm2.jpg', answer: 'micaiah' },
  ],
  order: ['thrones', 'battle', 'pool'],
  blocks: [
    {
      id: 'account',
      blanks: {
        b1: 'four-hundred',
        b2: 'go-up',
        b3: 'zedekiah',
        b4: 'robes',
        b5: 'thirty-two',
        b6: 'pool',
      },
    },
  ],
  teach: { face: 'm1' },
  // What settles each face and blank, and what dates each moment, for a hint (#29): the question
  // put to the prophets, the rider in the fight, his armor laid empty.
  evidence: {
    m1: 'captains',
    m2: 'kings',
    b1: 'prophets',
    b2: 'plain',
    b3: 'horns',
    b4: 'robed',
    b5: 'captains',
    b6: 'pool',
    thrones: 'kings',
    battle: 'rider',
    pool: 'armor',
  },
} as const satisfies CaseStructure
