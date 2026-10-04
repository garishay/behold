import type { CaseText } from '../types.ts'
import type { valley } from './case.ts'

// The tutorial's English text, keyed by the ids in case.ts. The account's parts carry the blanks
// in this language's word order; every sentence is the game's own voice, never the translation's.
export const en = {
  title: 'The valley',
  subtitle: 'Learn to play · take your time',
  brief:
    'A giant lies face-down in a valley, and a boy with a sling stands near him. Who are they, and how does it end?',
  passages: ['1 Samuel 17:4', '1 Samuel 17:17–18', '1 Samuel 17:38–51'],
  moments: { valley: 'The valley' },
  captions: {
    brook:
      'A brook across the valley floor, smooth stones in its shallows. Five were picked from here.',
    giant:
      'The Philistines’ champion from Gath, face-down in the dust, a sheathed sword at his side and his spear on the ground beside him. Laid out, he is six cubits and a span.',
    bearer:
      'A shield-bearer with a tall shield, still on his feet, reaching toward the fallen man.',
    boy: 'A shepherd boy in a plain tunic, a sling raised in one hand and a shepherd’s pouch at his hip. His other hand is empty.',
    basket:
      'A basket from home. The ten loaves were for his brothers; the ten cheeses, for the commander over their thousand.',
    armor:
      'Saul the king’s armor and his sword, set down in a heap. Strapped on the boy, then taken off: he had not tested them.',
  },
  words: {
    david: 'David',
    goliath: 'Goliath',
    saul: 'Saul',
    five: 'five',
    six: 'six',
    ten: 'ten',
    sling: 'sling',
    spear: 'spear',
    shield: 'shield',
    stones: 'stones',
    sword: 'sword',
    brothers: 'brothers',
    commander: 'commander',
    king: 'king',
  },
  faces: { d1: 'the boy', d2: 'the fallen giant' },
  papers: {},
  blocks: {
    account: {
      heading: 'The account',
      parts: [
        { t: 'A boy came down to the valley with ' },
        { b: 't1' },
        { t: ' loaves for his brothers, and cheeses for the ' },
        { b: 't2' },
        { t: '. Against Israel stood a champion of ' },
        { b: 't3' },
        {
          t: ' cubits and a span. Saul dressed the boy in his own armor, and the boy took it off, untested. From the brook he picked five smooth stones, and he went down with a staff and a ',
        },
        { b: 't4' },
        {
          t: '. One stone, and the giant fell on his face. Then the boy stood over him and cut off his head with the sword of ',
        },
        { b: 't5' },
        { t: '.' },
      ],
    },
  },
  steps: {
    step1: 'Tap the boy with the sling.',
    step2: 'Open Solve to name him.',
    step3: 'Tap David, then the slot under the boy.',
    step4: 'Now tap sling, then its blank.',
    step5: 'Find the other words in the picture.',
    step6: 'Fill the rest, then close the case.',
  },
  retry: 'Some are wrong. Look closer, then try again.',
  ask: 'Whose sword? Look closer at the picture.',
  reveal: [
    'The boy was David, sent by his father Jesse with ten loaves for his brothers and ten cheeses for the commander over their thousand. The fallen giant was Goliath of Gath, the Philistines’ champion, six cubits and a span tall.',
    'Saul dressed David in his armor, and David took it off untested. He went down with his staff, five smooth stones, and his sling; one stone struck the giant’s forehead, and he fell on his face. David had no sword, so he drew Goliath’s own from its sheath and cut off his head with it.',
  ],
} satisfies CaseText<typeof valley>
