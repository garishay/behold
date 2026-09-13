import type { CaseText } from '../types.ts'
import type { vineyard } from './case.ts'

// Case two's English text, keyed by the ids in case.ts.
export const en = {
  title: 'The vineyard',
  subtitle: 'Case two · ten to fifteen minutes',
  brief: 'A king stands in a dead man’s vineyard, and a prophet has come to meet him.',
  passages: ['1 Kings 21'],
  moments: { vineyard: 'The vineyard', bedchamber: 'Bedchamber', gate: 'The gate' },
  captions: {
    'man-rows':
      'The man from the bedchamber, hands behind his back, walking the rows as if he owns them.',
    cord: 'Servants stretching a cord and driving stakes. Vines torn out where the beds will go.',
    prophet:
      'A wild-haired man in a cloak of hair, with a leather belt and a staff, at the gap in the wall. One hand raised, mouth open.',
    stain:
      'Two dogs at a dark stain by the wall. A sandal. A torn, bloodied cloth. Someone died here.',
    balcony:
      'The woman from the bedchamber, on the balcony above the vineyard, a note in her hand.',
    window:
      'Through the window, a neighbor’s vineyard. It runs right up to the wall of this house.',
    'man-bed':
      'A man lies with his face to the wall, his back to the room. He hasn’t moved in hours.',
    tray: 'Bread, figs, a cup of wine. Untouched.',
    woman: 'A woman at the table, looking at him. One hand rests on a gold seal.',
    seal: 'A gold seal, under her hand. Not on his.',
    sheets: 'Papyrus, blank. A reed pen. Nothing written yet.',
    purse:
      'A pouch of silver, tipped open on the table. Whatever it was offered for, it came back with him.',
    lamp: 'An oil lamp, burning. It has been a long night.',
    crowd: 'The whole city, gathered. Nobody is eating.',
    stones: 'Through the gate, a heap of stones on open ground. Waiting.',
    seated: 'A grey-bearded man in the seat of honor. He does not look honored.',
    accusers: 'Two men stand facing him. One points at him. One raises a hand, as if to swear.',
    letter: 'Three elders on the bench. One holds an opened letter, its seal broken.',
    law: 'An open scroll on the elders’ bench.',
    chairs: 'Two chairs draped in purple, for a king and a queen. Empty.',
  },
  words: {
    ahab: 'Ahab',
    jezebel: 'Jezebel',
    naboth: 'Naboth',
    two: 'two',
    three: 'three',
    'face-to-the-wall': 'face to the wall',
    'would-not-eat': 'would not eat',
    'taken-possession': 'taken possession',
    killed: 'killed',
    stoned: 'stoned',
    dead: 'dead',
    vineyard: 'vineyard',
    seal: 'seal',
    letters: 'letters',
    silver: 'silver',
    lamp: 'lamp',
    fast: 'fast',
    elders: 'elders',
    inheritance: 'inheritance',
    'the-people': 'the people',
    garden: 'garden',
    prophet: 'prophet',
    blood: 'blood',
    dogs: 'dogs',
  },
  faces: { p1: 'the man on the bed', p2: 'the woman at the table', p3: 'the seated man' },
  papers: {
    seal: { title: 'The seal', body: 'Its impression reads:\nBELONGING TO AHAB, KING.' },
    letter: {
      title: 'The letter',
      body: 'To the elders and nobles of Jezreel:\nProclaim a fast, and seat Naboth in the place of honor among the people.\n\nSealed: BELONGING TO AHAB, KING.',
    },
    law: {
      title: 'The Law',
      body: 'One witness is not enough to put a man to death. A charge stands only on the word of two or three witnesses.\n\nThe land is not to be sold for good, for the land belongs to the LORD. A family’s inheritance stays with the family.',
    },
    note: {
      title: 'The note',
      body: 'To the queen, Jezebel:\nNaboth has been stoned. He is dead.',
    },
  },
  blocks: {
    account: {
      heading: 'The account',
      parts: [
        { t: 'A vineyard lay beside the king’s house. The king asked for it, to make it a ' },
        { b: 's1' },
        { t: ', and offered its price in ' },
        { b: 's2' },
        { t: '. The owner refused: it was his fathers’ ' },
        { b: 's3' },
        { t: ', which the Law does not let a man sell away. The king went home and ' },
        { b: 's4' },
        {
          t: '. Letters went out to the elders of the city, sealed with the king’s seal but written by ',
        },
        { b: 's5' },
        { t: '. They ordered a fast, with the owner seated in the place of honor, and ' },
        { b: 's6' },
        {
          t: ' men to accuse him — the number the Law requires before a man can be put to death. He was taken outside the city and ',
        },
        { b: 's7' },
        { t: '. The next morning the king walked the vineyard as his own.' },
      ],
    },
    verdict: {
      heading: 'The prophet’s words',
      parts: [{ t: 'Have you ' }, { b: 'v1' }, { t: ', and also ' }, { b: 'v2' }, { t: '?' }],
    },
  },
  reveal: [
    'The man on the bed was Ahab, king of Israel. The woman at the table was Jezebel, his queen. The seated man was Naboth, who owned the vineyard and would not sell his fathers’ land. The prophet at the wall was Elijah.',
    'When the king heard the prophet’s words, he tore his clothes, put on sackcloth, and fasted. And the word of the LORD came again: because he has humbled himself, the disaster will not come in his days — but it will come on his house in the days of his son.',
  ],
} satisfies CaseText<typeof vineyard>
