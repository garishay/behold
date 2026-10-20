import type { CaseText } from '../types.ts'
import type { naaman } from './case.ts'

// Case six's English text, keyed by the ids in case.ts. The servant's claims are his own words in
// his captions, and nothing in a caption says they are false; the second block sets each against
// what the pictures show. The names the faces need come from people's words: the servant's, under
// his breath, and the prophet's question. The words follow the NIV where Gate 33's audit of the
// gift ruled them (#66).
export const en = {
  title: 'The gift',
  subtitle: 'Case five',
  brief:
    'A commander of Aram comes to Israel’s prophet with leprosy, and goes home clean. Then the prophet’s servant runs after the commander, with an answer for everyone who asks. Who sent him, and where had he been?',
  passages: ['2 Kings 5'],
  moments: { road: 'The road', house: 'The house', gift: 'The gift' },
  captions: {
    runner:
      'The young man in the plain tunic, out of breath from running. Everything is all right, he says. My master sent me: two young prophets have just arrived from the hills of Ephraim. Would you give them some silver, a talent, and two sets of clothes?',
    greeting:
      'The commander in foreign armor, down on the road to meet the young man running after him, asks if everything is all right.',
    chariot:
      'A chariot and its pair of horses, halted on the road, the driver holding them. Seeing someone run after him, the commander stepped down from it.',
    bags: 'Two of the commander’s servants, each bent under a bag of silver tied at the neck, with a set of clothes laid on top. Take two, the commander pressed him, and tied them up.',
    laden: 'By the road, the two mules, their baskets heaped with earth for the way home.',
    alcove:
      'Behind a half-drawn curtain, two bags of silver tied at the neck, and two folded sets of clothes laid on them.',
    servant:
      'The young man in the plain tunic stands before his master. Your servant hasn’t been anywhere, he answers. As he turns to go, his hands and face are white as snow.',
    master:
      'The bald man in the plain robe looks up from his seat as his servant comes in. Where did you go, Gehazi? he asks.',
    door: 'Through the open door, the hill, and two men in short tunics, their beards cut in the foreign way, going away down its path.',
    doorway:
      'A young man in a plain tunic, a satchel on its strap, watches the silver from the doorway. My master won’t take a thing from Naaman the Aramean, he says to himself. I’ll chase him down and get something for myself.',
    prophet:
      'A bald man in a plain robe stands before his door, one hand raised against the gifts held out to him. He will take none of it, he swears by the LORD he serves, however hard the commander presses.',
    commander:
      'A commander in foreign armor, his beard cut in a foreign way, his skin as clean as a young boy’s. Take this gift from your servant, he urges: he knows now that Israel’s God is the only God in the whole world.',
    gifts:
      'His servants hold out what he brought from Aram: silver weighed out in heavy bags, gold, and fine clothes, ten sets of them.',
    mules:
      'Two mules, and the commander’s men filling the baskets on their backs with earth from a heap in the street. If the prophet will take nothing, the commander asked, let him carry home this much earth, to worship the LORD and no other.',
  },
  words: {
    naaman: 'Naaman',
    gehazi: 'Gehazi',
    elisha: 'Elisha',
    refused: 'refused',
    accepted: 'accepted',
    'asked-for': 'asked for',
    two: 'two',
    one: 'one',
    ten: 'ten',
    earth: 'earth',
    silver: 'silver',
    gold: 'gold',
    chariot: 'chariot',
    horse: 'horse',
    mule: 'mule',
  },
  faces: { f1: 'the man in foreign armor', f2: 'the young man with a satchel' },
  papers: {},
  blocks: {
    account: {
      heading: 'The account',
      parts: [
        {
          t: 'The commander of Aram’s army was a great man, and he had leprosy. A young girl taken captive from Israel, who waited on his wife, said the prophet in Samaria could cure him. The prophet did not even come out to him: he sent word to go down into the Jordan and wash seven times, and when at last the commander did, his skin came back like a young boy’s. He returned to the prophet’s door with silver, gold, and fine clothes, and when he left, his two mules went home loaded with ',
        },
        { b: 'a1' },
        {
          t: '. He had gone some distance when the prophet’s servant came running after him, and the commander stepped down from his ',
        },
        { b: 'a2' },
        { t: ' and greeted him.' },
      ],
    },
    claims: {
      heading: 'The servant’s words',
      parts: [
        {
          t: 'He told the commander his master had sent him, for two young prophets just come from the hills. At his own door, the prophet had ',
        },
        { b: 'l1' },
        {
          t: ' the commander’s silver. Back in the house, he told his master he hadn’t gone anywhere. He had asked for one talent, and brought home ',
        },
        { b: 'l2' },
        {
          t: '. His master told him the commander’s leprosy would cling to him and his descendants forever, and he went out white as snow.',
        },
      ],
    },
  },
  teach: 'So the servant says. The pictures will tell.',
  reveal: [
    'The man in foreign armor was Naaman, commander of Aram’s army, made clean when he went down into the Jordan and dipped seven times, as the prophet told him. The young man with a satchel was Gehazi, Elisha’s servant. Elisha had refused Naaman’s silver, and no one sent Gehazi after it: he ran after the chariot on his own, and told Naaman his master had sent him.',
    'Naaman pressed two talents on him, where he had asked for one, and two of his servants carried them as far as the hill. Gehazi hid the silver in the house, and told Elisha he hadn’t gone anywhere. But Elisha’s spirit had been with him, and he knew. Naaman’s leprosy would cling to Gehazi and his descendants forever, and he left his master’s side white as snow.',
  ],
} satisfies CaseText<typeof naaman>
