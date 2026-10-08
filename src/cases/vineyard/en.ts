import type { CaseText } from '../types.ts'
import type { vineyard } from './case.ts'

// Case three's English text, keyed by the ids in case.ts.
export const en = {
  title: 'The vineyard',
  subtitle: 'Case two',
  brief:
    'A man walks a vineyard as if it were his, and a prophet has come to meet him. Whose vineyard was it, and what became of its owner?',
  passages: ['1 Kings 21'],
  moments: { vineyard: 'The vineyard', bedchamber: 'Bedchamber', gate: 'The gate' },
  captions: {
    'man-rows':
      'A man in a wine-red robe and a gold circlet, hands behind his back, walking the rows as if they were his.',
    cord: 'Servants stretching a cord and driving stakes, laying out straight beds where the vines were pulled up.',
    prophet:
      'A wild-haired man in a cloak of hair and a leather belt, a staff in his hand, at the gap in the wall. One hand is raised at the man in the rows.',
    stain:
      'Outside the town, past the vineyard wall: two lean dogs at a dark stain among scattered stones.',
    balcony:
      'A woman in teal and a gold headdress, on the balcony above the vineyard, a note in her hand.',
    window:
      'Through the window, a neighbor’s vineyard. It runs right up to the wall of this house.',
    'man-bed':
      'A man in a wine-red robe and a gold circlet lies with his face turned to the wall, his back to the room.',
    tray: 'Bread, figs, and a cup of wine beside the bed. Untouched.',
    woman: 'A woman in teal and a gold headdress at the table.',
    seal: 'A gold signet ring with a dark stone beside her hand. On the corner of the papyrus, a lump of red clay carries its impression.',
    sheets: 'Blank sheets of papyrus and a reed pen on the table.',
    purse: 'A leather pouch on the table, tied shut at the neck and heavy with silver.',
    crowd: 'The people of the city, gathered at the gate. Nobody is eating.',
    stones: 'Through the gate, outside the city, a heap of stones on open ground.',
    seated:
      'A grey-bearded man in the chief seat, before all the people. He does not look honored.',
    accusers:
      'Two men stand facing him. One points at him; the other raises a hand, as if to swear.',
    letter: 'Elders on the bench. One holds an opened letter, its seal broken.',
    law: 'An open scroll on the elders’ bench.',
  },
  words: {
    ahab: 'Ahab',
    jezebel: 'Jezebel',
    naboth: 'Naboth',
    elijah: 'Elijah',
    'turned-away': 'turned away',
    'would-not-eat': 'would not eat',
    'taken-possession': 'taken possession',
    killed: 'killed',
    stoned: 'stoned',
    cursed: 'cursed',
    vineyard: 'vineyard',
    garden: 'garden',
    silver: 'silver',
    inheritance: 'inheritance',
    seal: 'seal',
    letters: 'letters',
    fast: 'fast',
    'the-people': 'the people',
    'the-elders': 'the elders',
    'the-king': 'the king',
    blood: 'blood',
    dogs: 'dogs',
  },
  faces: { p1: 'the man on the bed', p2: 'the woman at the table', p3: 'the seated man' },
  papers: {
    seal: { title: 'The seal', body: 'Its impression reads:\nBELONGING TO AHAB, KING.' },
    letter: {
      title: 'The letter',
      body: 'To the elders and leaders of Naboth’s city:\nCall a fast, and give Naboth the chief seat before the people. Have two scoundrels sit facing him and swear that he spoke curses against God and the king. Then lead him out and stone him.\n\nSealed: BELONGING TO AHAB, KING.',
    },
    law: {
      title: 'The Law',
      body: 'One witness is not enough to put a man to death. A charge stands only on the word of two or three witnesses.\n\nThe land is not to be sold for good, for the land belongs to the LORD. A family’s inheritance stays with the family.',
    },
    note: {
      title: 'The note',
      body: 'To Jezebel:\nIt is done. Naboth was stoned, and he is dead.',
    },
  },
  blocks: {
    account: {
      heading: 'The account',
      parts: [
        { t: 'A vineyard lay beside the king’s house, and the king wanted it, to make it his ' },
        { b: 's1' },
        { t: '. He offered its owner a better ' },
        { b: 's2' },
        { t: ' for it, or its worth in silver. The owner refused: the vineyard was the ' },
        { b: 's3' },
        {
          t: ' of his fathers. The king went home, lay down with his face turned away, and would not eat. Then letters went out to the elders of the owner’s city, sealed with the king’s seal but written by ',
        },
        { b: 's4' },
        {
          t: '. A fast was called and the owner seated before the people, and two scoundrels swore he had cursed God and ',
        },
        { b: 's5' },
        {
          t: '. He was led out of the city and stoned. As soon as the king heard he was dead, he went down to the vineyard to take it for his own.',
        },
      ],
    },
    verdict: {
      heading: 'The prophet’s words',
      parts: [
        { t: 'First you ' },
        { b: 'v1' },
        { t: ' him, and now you have ' },
        { b: 'v2' },
        { t: '?' },
      ],
    },
  },
  teach: 'Who is he? Find what bears his name.',
  reveal: [
    'The man on the bed was Ahab, king of Israel. The woman at the table was Jezebel, his wife. The seated man was Naboth, who owned the vineyard and would not give up his fathers’ inheritance. Jezebel wrote the letters in Ahab’s name and sealed them with his seal. The prophet at the wall was Elijah.',
    'When Ahab heard the prophet’s words, he tore his clothes, put on sackcloth, and fasted. And the word of the LORD came again: because he has humbled himself, the disaster will not come in his days — but it will come on his house in the days of his son.',
  ],
} satisfies CaseText<typeof vineyard>
