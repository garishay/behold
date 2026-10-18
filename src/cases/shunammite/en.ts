import type { CaseText } from '../types.ts'
import type { shunammite } from './case.ts'

// Case five's English text, keyed by the ids in case.ts. The captions describe the room by its
// four things and never say whose bed the boy is on; the names the faces need come from the
// prophet's own words, calling for the Shunammite and calling out to Gehazi. The words follow the
// NIV where Gate 33's audit of the room ruled them (#57).
export const en = {
  title: 'The room',
  subtitle: 'Case four',
  brief:
    'A woman builds a small room on her roof for a holy man who often comes her way. Years later she rides hard to find him, and tells all who ask that everything is all right. Whose room is it, and what happened on its bed?',
  passages: ['2 Kings 4:8–37'],
  moments: { carmel: 'Carmel', bed: 'The bed', room: 'The room' },
  captions: {
    prophet:
      'On the mountain, a bald man in a plain robe with a staff in his hand. Seeing her on the road, he had called out to his servant: Gehazi, there she comes, the Shunammite. Now he gives the staff to his servant: greet no one on the way, and lay it on the child’s face.',
    feet: 'A woman on her knees on the path, holding fast to the bald man’s robe at his feet.',
    servant:
      'His servant, his cloak tucked into his belt for running, has come to push her away. The bald man holds up a hand: leave her alone.',
    donkey:
      'A saddled donkey, lathered, and the servant who drove it all the way from Shunem, as she asked: one servant and one donkey, and no slowing down.',
    boy: 'A small room on a roof at night. A boy sits up on the bed, his eyes open, a staff beside him: laid on his face, it did not wake him.',
    table: 'A table with a lamp on it, lit, the only light in the room.',
    standing:
      'The bald man in the plain robe stands by the bed. He sent word to call her in: take your son.',
    bowing: 'A woman bowed to the ground at the bald man’s feet.',
    door: 'A man at the door. It was shut behind the bald man and the child while he prayed.',
    window: 'Through the window, reapers at work in the fields below the town.',
    furniture:
      'A small walled room built on the roof, holding a bed, a table with a lamp on it, and a chair.',
    chair:
      'A bald man in a plain robe rests in the chair: a holy man who often comes this way. The room was made for him.',
    caller:
      'A man at the door, sent to call her. Call the Shunammite, the man in the chair told him.',
    doorway:
      'A woman in a fine dress, with no royal color, stands in the doorway. Asked what could be done for her, she said she had a home among her own people.',
  },
  words: {
    elisha: 'Elisha',
    gehazi: 'Gehazi',
    shunammite: 'the Shunammite',
    'push-away': 'push her away',
    greet: 'greet her',
    call: 'call her',
    lamp: 'lamp',
    staff: 'staff',
    cloak: 'cloak',
    donkey: 'donkey',
    carmel: 'Carmel',
    shunem: 'Shunem',
    'the-field': 'the field',
  },
  faces: { f1: 'the man at the door', f2: 'the woman in the doorway' },
  papers: {},
  blocks: {
    account: {
      heading: 'The account',
      parts: [
        {
          t: 'A woman of Shunem and her husband built a small room on their roof for the man of God who came their way, and furnished it with a bed, a table, and a chair, and on the table a ',
        },
        { b: 'r1' },
        {
          t: '. She was childless, and her husband was old; about a year later she held the son she had been promised. When the boy had grown, he cried out to his father in the field that his head hurt, and by noon he had died on his mother’s lap. She laid him down on the bed of ',
        },
        { b: 'r2' },
        { t: ', shut the door, and rode to ' },
        { b: 'r3' },
        {
          t: ' to find him, telling her husband only that everything was all right. There she took hold of the prophet’s feet, and his servant came to ',
        },
        { b: 'r4' },
        { t: '. The prophet sent his servant running ahead with his ' },
        { b: 'r5' },
        {
          t: ', to lay it on the child’s face, and the child did not wake. Then the prophet came himself, shut himself in with the boy, and prayed; the child sneezed seven times, then opened his eyes.',
        },
      ],
    },
  },
  teach: 'Whose bed? The room around it will tell.',
  reveal: [
    'The man at the door was Gehazi, Elisha’s servant. The woman in the doorway was the Shunammite, the woman of Shunem who built a small room on her roof for the man of God, with a bed, a table, a lamp, and a chair. The bed the boy lay on was Elisha’s: she laid her dead son there, in the prophet’s own room, and shut the door.',
    'Elisha had told her she would hold a son, and a year later she did. When the boy was grown he cried out to his father in the field about his head, and by noon he died on her lap. She rode to Mount Carmel, telling her husband only that everything was all right, and took hold of Elisha’s feet; Gehazi tried to push her away. Elisha sent Gehazi ahead with his staff to lay on the child’s face, but the child did not wake. Then Elisha came, shut the door, prayed, and stretched himself on the child, who sneezed seven times, then opened his eyes.',
  ],
} satisfies CaseText<typeof shunammite>
