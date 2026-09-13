import type { CaseText } from '../types.ts'
import type { valley } from './case.ts'

// The tutorial's English text, keyed by the ids in case.ts. The account's parts carry the blanks
// in this language's word order; every sentence is the game's own voice, never the translation's.
export const en = {
  title: 'The valley',
  subtitle: 'Learn to play · about five minutes',
  brief:
    'A giant lies face-down in a valley, and the boy standing over him has no sword. Work out how.',
  passages: ['1 Samuel 17:17–18', '1 Samuel 17:38–51'],
  moments: { valley: 'The valley' },
  captions: {
    brook: 'A brook. Smooth stones in the shallows. He chose five, and one of them is gone.',
    giant:
      'The Philistine champion, face-down: Goliath of Gath. His helmet knocked off, his spear never thrown.',
    bearer:
      'The giant’s shield-bearer, still holding the shield he was meant to carry in front of his master.',
    boy: 'A shepherd boy, sling still swinging. The armies know him: David, youngest of Jesse’s sons. His other hand is empty.',
    basket: 'Ten loaves and ten cheeses, sent from home. He came here carrying food.',
    armor:
      'A king’s armor — coat of mail and sword — set aside in a heap. Tried on, then taken off.',
  },
  words: {
    david: 'David',
    goliath: 'Goliath',
    five: 'five',
    sling: 'sling',
    spear: 'spear',
    shield: 'shield',
    stones: 'stones',
    armor: 'armor',
    sword: 'sword',
    cheeses: 'cheeses',
    loaves: 'loaves',
  },
  faces: { d1: 'the boy', d2: 'the fallen giant' },
  papers: {},
  blocks: {
    account: {
      heading: 'The account',
      parts: [
        { t: 'A boy came to the valley bringing bread and ' },
        { b: 't1' },
        { t: ' for his brothers — not a sword. The king dressed him in his own ' },
        { b: 't2' },
        { t: ', and the boy took it off; he had never tested it. He chose ' },
        { b: 't3' },
        { t: ' smooth stones from the brook and went down with a staff and a ' },
        { b: 't4' },
        { t: '. The giant fell face-down, and there was no ' },
        { b: 't5' },
        { t: ' in the boy’s hand.' },
      ],
    },
  },
  steps: {
    step1: 'Tap the boy with the sling.',
    step2: 'Open Think at the top, then name him: tap David, then tap the slot under the boy.',
    step3: 'Fill a blank the same way: tap sling, then tap the blank after “a staff and a”.',
    step4:
      'Now it’s yours. Everything you need is in the picture. A blank only takes its own kind of word, and a ✓ means it’s right.',
  },
  reveal: [
    'The boy was David, sent to the valley of Elah with food for his brothers. The fallen giant was Goliath of Gath. Saul had dressed David in his own armor and David took it off untested, chose five smooth stones from the brook, and went down with a staff and a sling.',
    'Goliath fell face-down with a stone in his forehead, and there was no sword in David’s hand.',
  ],
} satisfies CaseText<typeof valley>
