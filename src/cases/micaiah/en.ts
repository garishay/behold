import type { CaseText } from '../types.ts'
import type { micaiah } from './case.ts'

// Case four's English text, keyed by the ids in case.ts. Captions describe by marker, and the
// disguised man's by what he wears. The account calls the king what the passage does, the king of
// Israel, and never says who went in disguise; the names the faces need come from people's words,
// the king's naming Micaiah and Micaiah's vision naming Ahab.
export const en = {
  title: 'The battle',
  subtitle: 'Case four · ten to fifteen minutes',
  brief:
    'A crowd of prophets tells a king to go to war, and one plain man is sent to prison. Then two kings ride into battle, and only one of them is dressed as a king. Who is the man in plain armor, and what became of his chariot?',
  passages: ['1 Kings 22:1–40'],
  moments: { battle: 'The battle', pool: 'The pool', thrones: 'The thrones' },
  captions: {
    robed:
      'A man in a deep blue royal robe and a plain gold band stands in a chariot trimmed in blue and gold, one arm raised, crying out.',
    captains:
      'Chariots of Syria, their captains in tall pointed helmets, pull up and wheel away from the man in blue. Thirty-two captains were sent out, all of them for one man: the king of Israel.',
    rider:
      'A man in plain bronze scale armor, a breastplate over it, rides in a chariot at the edge of the fight, his driver beside him.',
    archer: 'A Syrian archer draws his bow high over the fight, aimed at no one in particular.',
    chariot:
      'A chariot drawn up at the water’s edge. Two men sluice out its floor, and the water runs off it dark.',
    pool: 'The pool of Samaria, below the city walls on their hill.',
    dogs: 'Two lean dogs lap at the pool’s edge, beside the washing.',
    armor:
      'Plain bronze scale armor and a breastplate lie empty, side by side, on the stones by the chariot.',
    kings:
      'Two kings on two thrones, in their robes: one in wine-red with a gold circlet, one in deep blue with a plain gold band. The question put to the prophets: go up to war, or refrain? The king of Israel names one more prophet, Micaiah son of Imlah, whom he hates: Micaiah never foretells him good.',
    prophets:
      'Prophets crowd the threshing floor, about four hundred of them, all saying the same thing with one voice: go up, and win.',
    horns:
      'A prophet holds up a pair of iron horns, high over his head: with these, he says, the king will gore the Syrians. His other hand is still raised.',
    plain:
      'The plainest man at the gate, in undyed wool, one hand pressed to his cheek. Asked, he first gave the prophets’ own answer; then he told of all Israel strewn over the hills like sheep, every man going home, and of the question in his vision: who will lure Ahab up to fall at Ramoth-gilead?',
    gate: 'Behind the thrones, the gate of Samaria. The kings sit before it, at the threshing floor, a broad floor of beaten earth.',
  },
  words: {
    ahab: 'Ahab',
    micaiah: 'Micaiah',
    jehoshaphat: 'Jehoshaphat',
    zedekiah: 'Zedekiah',
    'go-up': 'go up',
    refrain: 'refrain',
    'go-home': 'go home',
    'four-hundred': 'four hundred',
    'thirty-two': 'thirty-two',
    two: 'two',
    robes: 'robes',
    armor: 'armor',
    breastplate: 'breastplate',
    pool: 'pool',
    gate: 'gate',
    'threshing-floor': 'threshing floor',
  },
  faces: { m1: 'the man in plain armor', m2: 'the man in undyed wool' },
  papers: {},
  blocks: {
    account: {
      heading: 'The account',
      parts: [
        { t: 'The king of Israel asked his prophets, about ' },
        { b: 'b1' },
        {
          t: ' of them, whether to go to war for Ramoth-gilead, and every one said go. Jehoshaphat, king of Judah, asked for a prophet of the LORD besides them, and Micaiah was brought. At first he told the king to ',
        },
        { b: 'b2' },
        {
          t: '. Held to the truth, he told of Israel scattered like sheep, and of a spirit that put lies in the prophets’ mouths. ',
        },
        { b: 'b3' },
        {
          t: ' struck him on the cheek, and the king sent him to prison on bread and water. At Ramoth-gilead the two kings rode into battle, Jehoshaphat in his ',
        },
        { b: 'b4' },
        { t: '. The Syrian king had sent ' },
        { b: 'b5' },
        {
          t: ' chariot captains after the king of Israel alone; they gave chase, then turned back. A Syrian loosed an arrow at no one in particular, and it found the king of Israel. Held upright in his chariot to face the enemy, he died at evening. At the ',
        },
        { b: 'b6' },
        { t: ' of Samaria his chariot was washed out, and dogs lapped up his blood.' },
      ],
    },
  },
  teach: 'He’s in disguise. Name him by what happens.',
  reveal: [
    'The man in plain armor was Ahab, king of Israel, in disguise. He sent Jehoshaphat, king of Judah, into the battle in his own royal robes, and the Syrian captains, sent after the king of Israel alone, took Jehoshaphat for him, chased him, and turned back. The man in undyed wool was Micaiah son of Imlah, the one prophet who would say only what the LORD told him.',
    'About four hundred prophets told the king to go up and take Ramoth-gilead. Micaiah first answered as they had; then, held to the truth, he told of Israel scattered like sheep with no shepherd, and of a spirit the LORD sent to put lies in the prophets’ mouths. Zedekiah, who had made himself iron horns, struck him on the cheek, and the king sent him to prison on bread and water. In the battle an arrow shot at no one in particular found the gap between the king’s scale armor and his breastplate. Held upright in his chariot to face the Syrians, he died at evening. His chariot was washed out at the pool of Samaria, where dogs lapped up his blood, as the LORD had said.',
  ],
} satisfies CaseText<typeof micaiah>
