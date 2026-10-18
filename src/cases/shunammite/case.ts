import type { CaseStructure } from '../types.ts'

// Case five: the Shunammite and her son (2 Kings 4:8–37, #57). Its one new idea is a place as
// evidence: the small room she built on her roof for the man of God is known by its four things, a
// bed, a table, a chair, and a lamp, and the last moment shows her son on that bed, so the player
// works out whose bed it was. The first-encounter mark rings that blank on Solve (`teach`). There is
// no paper: the faces' names come from the prophet's own words, calling for the Shunammite and
// calling out to Gehazi, as rule 6 allows. The boxes are fitted to the pictures as they were
// generated from the scene briefs (scenes.md, world rules §6).
export const shunammite = {
  id: 'shunammite',
  thumb: 'carmel',
  passages: [{ book: '2KI', chapter: 4, from: 8, to: 37 }],
  moments: [
    {
      id: 'carmel',
      picture: 'carmel.jpg',
      size: [900, 1125],
      spots: [
        {
          id: 'prophet',
          box: [35, 5, 31, 61],
          words: ['carmel', 'gehazi', 'staff', 'greet'],
          cites: '4:25-29',
        },
        { id: 'feet', box: [42, 38, 47, 38], words: [], person: 'f2', cites: '4:27' },
        {
          id: 'servant',
          box: [64, 20, 28, 50],
          words: ['push-away', 'cloak'],
          person: 'f1',
          cites: '4:27-29',
        },
        { id: 'donkey', box: [8, 33, 21, 33], words: ['donkey', 'shunem'], cites: '4:22-24' },
      ],
    },
    {
      id: 'bed',
      picture: 'bed.jpg',
      size: [900, 1125],
      spots: [
        { id: 'boy', box: [8, 30, 29, 54], words: [], cites: '4:31-35' },
        { id: 'table', box: [22, 37, 14, 23], words: [], cites: '4:10' },
        { id: 'standing', box: [32, 9, 34, 68], words: ['call'], cites: '4:36' },
        { id: 'bowing', box: [46, 60, 46, 29], words: [], person: 'f2', cites: '4:37' },
        { id: 'door', box: [78, 12, 14, 52], words: [], person: 'f1', cites: '4:31-33' },
      ],
    },
    {
      id: 'room',
      picture: 'room.jpg',
      size: [900, 1125],
      spots: [
        { id: 'window', box: [8, 11, 20, 18], words: ['the-field'], cites: '4:18' },
        { id: 'furniture', box: [8, 38, 17, 46], words: ['lamp'], cites: '4:10' },
        { id: 'chair', box: [24, 23, 47, 59], words: ['elisha'], cites: '4:9-11' },
        {
          id: 'caller',
          box: [57, 13, 22, 57],
          words: ['shunammite'],
          person: 'f1',
          cites: '4:12',
        },
        { id: 'doorway', box: [78, 12, 14, 53], words: [], person: 'f2', cites: '4:13-15' },
      ],
    },
  ],
  words: {
    elisha: 'name',
    gehazi: 'name',
    shunammite: 'name',
    'push-away': 'action',
    greet: 'action',
    call: 'action',
    lamp: 'noun',
    staff: 'noun',
    cloak: 'noun',
    donkey: 'noun',
    carmel: 'noun',
    shunem: 'noun',
    'the-field': 'noun',
  },
  faces: [
    { id: 'f1', picture: 'f1.jpg', answer: 'gehazi' },
    { id: 'f2', picture: 'f2.jpg', answer: 'shunammite' },
  ],
  order: ['room', 'carmel', 'bed'],
  blocks: [
    {
      id: 'account',
      blanks: { r1: 'lamp', r2: 'elisha', r3: 'carmel', r4: 'push-away', r5: 'staff' },
    },
  ],
  teach: { blank: 'r2' },
  // What settles each face and blank, and what dates each moment, for a hint (#29): the prophet
  // naming his servant on the mountain and sending him to call her in the room, the room's four
  // things and the chair's owner, and the room new, the staff sent, the boy alive.
  evidence: {
    f1: 'prophet',
    f2: 'caller',
    r1: 'furniture',
    r2: 'chair',
    r3: 'prophet',
    r4: 'servant',
    r5: 'prophet',
    room: 'furniture',
    carmel: 'prophet',
    bed: 'boy',
  },
  // The verse that says each answer, and that tells each moment, where the reveal points a miss
  // (#107): the servant called by name, the room furnished, the boy laid on the man of God's bed,
  // her ride to the mountain, the servant come to push her away, the staff sent ahead, and the
  // child waking.
  verses: {
    f1: '4:12',
    f2: '4:12',
    r1: '4:10',
    r2: '4:21',
    r3: '4:25',
    r4: '4:27',
    r5: '4:29',
    room: '4:10',
    carmel: '4:25',
    bed: '4:35',
  },
} as const satisfies CaseStructure
