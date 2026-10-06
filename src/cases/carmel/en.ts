import type { CaseText } from '../types.ts'
import type { carmel } from './case.ts'

// Case two's English text, keyed by the ids in case.ts. Captions describe by marker and carry the
// passage's detail; every sentence is the game's own voice, never the translation's.
export const en = {
  title: 'The mountain',
  subtitle: 'Case one',
  brief:
    'Two altars on a mountain, a bull on each, and all Israel watching. What did the people answer, what was poured out, and what did the fire burn?',
  // The first case with more than one picture says what a picker's dot means (#77).
  note: 'Three pictures this time. A dot means more to find there.',
  passages: ['1 Kings 18:17–40'],
  moments: { water: 'The water', fire: 'The fire', baal: 'Baal’s altar' },
  captions: {
    altar:
      'An altar of twelve great stones, one for each tribe, built where the LORD’s altar lay thrown down. The wood and the bull on it stream with water.',
    pourers:
      'Four men tip four big jars over the bull and the wood, and the water runs down the stones.',
    caller:
      'A wild-haired man in a cloak of hair and a leather belt, a staff in one hand and three fingers raised on the other: again, a third time.',
    trench:
      'A trench dug all the way around the altar, wide enough to hold two measures of seed. It is full of water.',
    spent:
      'Across the ground, men in tall caps and saffron robes sit by their own cold altar, worn out. Midday has passed.',
    fire: 'Fire falls on the altar and burns all of it: the bull, the wood, the very stones, and the dust around them.',
    dry: 'The trench is dry. Steam rises where the water stood.',
    faces: 'The people are down on their faces, saying over and over that the LORD is God.',
    praying:
      'The man in the hair cloak stands at the altar with his arms lifted. It is the hour of the offering.',
    prophets:
      'A crowd of men in tall caps and saffron robes circles an altar with a bull on its wood, crying aloud to Baal. No fire has come. Four hundred and fifty of them, by the prophet’s count.',
    mocker:
      'A wild-haired man in a cloak of hair and a leather belt, leaning on his staff, a hand cupped to his ear, calling out to them with a grin. The sun stands at noon.',
    crowd:
      'The people of Israel, watching from the slope. Asked how long they would waver between the LORD and Baal, they said not a word.',
    king: 'A man in a wine-red robe and a gold circlet, seated under an awning among his guards, watching.',
    ruin: 'At the edge of the ground, the stones of an old altar lie scattered where it was thrown down.',
  },
  words: {
    elijah: 'Elijah',
    ahab: 'Ahab',
    baal: 'Baal',
    'said-nothing': 'said nothing',
    'fell-on-faces': 'fell on their faces',
    'cried-aloud': 'cried aloud',
    stones: 'stones',
    prophets: 'prophets',
    jars: 'jars',
  },
  faces: { c1: 'the man in the hair cloak', c2: 'the man under the awning' },
  papers: {},
  blocks: {
    account: {
      heading: 'The account',
      parts: [
        {
          t: 'Ahab gathered all Israel to Mount Carmel, and the prophets of Baal with them. Elijah asked the people how long they would waver between the LORD and Baal, and they ',
        },
        { b: 'a1' },
        { t: '. Baal’s prophets called on their god from morning to noon, and past noon they ' },
        { b: 'a2' },
        {
          t: ', and no answer came. Then Elijah rebuilt the LORD’s altar, dug a trench around it, laid the bull on the wood, and had four jars of water poured over it, three times over, until the trench was full. He prayed, and fire fell. It burned the bull, the wood, even the ',
        },
        { b: 'a3' },
        { t: ', and dried the trench. At the sight of the fire, the people ' },
        { b: 'a4' },
        { t: '.' },
      ],
    },
  },
  teach: 'These are out of order. Which happened first?',
  reveal: [
    'The man in the hair cloak was Elijah, the LORD’s prophet, who stood alone against Baal’s four hundred and fifty. The man under the awning was Ahab, king of Israel, who met him as the troubler of Israel and gathered the people and the prophets to Mount Carmel at his word.',
    'Asked how long they would waver, the people said not a word. Baal’s prophets called from morning past noon, and no one answered. Elijah rebuilt the LORD’s altar with twelve stones, one for each tribe, and had it soaked, four jars three times over, until the trench ran full. At the hour of the offering he prayed, and the fire of the LORD fell. It consumed the offering, the wood, the stones, and the dust, and dried up the water in the trench. The people fell on their faces and confessed that the LORD is God, and at Elijah’s word Baal’s prophets were seized and taken down to the brook Kishon.',
  ],
} satisfies CaseText<typeof carmel>
