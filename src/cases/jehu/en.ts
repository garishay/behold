import type { CaseText } from '../types.ts'
import type { jehu } from './case.ts'

// Case seven's English text, keyed by the ids in case.ts. The word Elijah spoke in the vineyard is
// carried in people's words at Jezreel, the young prophet's and the commander's, and the second
// block sets each part of it beside what the pictures show. Every caption's words fit the moment its
// picture shows; what was said before is told as past. The names the faces need come from people's
// words: the officers' shout, and the fleeing king's cry to the other. The words follow the NIV
// where Gate 33's audit of the window ruled them (#67).
export const en = {
  title: 'The window',
  subtitle: 'Case six',
  brief:
    'Years after a prophet’s word against a king, spoken in a vineyard, a commander is anointed in secret and sets out for Jezreel. Two kings ride out to meet him, and a queen watches from her window. On whom was the word kept, and how?',
  passages: ['1 Kings 21:17–29', '2 Kings 9'],
  moments: { plot: 'The plot', window: 'The window', steps: 'The steps' },
  captions: {
    bow: 'The commander in bronze scale armor stands in his dusty chariot, his bow lowered, pointing down at the ground.',
    aide: 'His officer, Bidkar, steps down from the chariot. Lift him out and throw him down on this plot of Naboth’s, the commander tells him: remember riding with me behind his father Ahab, when the LORD said he would make him pay for it here.',
    king: 'A chariot hung with wine-red stands stopped on the garden beds, an arrow in its rail and its king slumped down inside it. Jehu, you come in peace? he had called out. Then, turning to flee, he cried to the other king: Treachery, Ahaziah!',
    fleeing:
      'A king in deep blue with a plain gold band whips his horses away up the road, looking back.',
    horsemen:
      'Two horsemen from the town sit their horses behind the commander’s chariot. Each rode out to ask if he came in peace, and each was told to fall in behind. From the tower, the lookout had known the commander far off by his driving: he drives like a madman.',
    beds: 'Straight beds of vegetables running up to a low wall of dressed stone, where a vineyard once grew: the plot of Naboth of Jezreel.',
    queen:
      'At a high window in the wall, a woman in teal with a gold disc headdress, her eyes made up and her hair arranged, looks down at the gate. You come in peace, Zimri, you who killed your master? she calls.',
    eunuchs:
      'At the next window, two of her eunuchs look down, beardless men of the household. Who stands with me? Who? the commander calls up to them.',
    gate: 'At the gate below, the commander in bronze scale armor stands in his chariot, his horses lathered from the road, looking up at the window. Throw her down, he tells them.',
    dogs: 'At the foot of the wall, by the gate, lean dogs wait in the dust.',
    runner:
      'Out through the gate runs a young man with his cloak tucked into his belt, an empty flask in his hand. In the inner room he had poured the oil and given the commander the LORD’s word: Ahab’s house will go the way of Jeroboam’s and Baasha’s, and dogs will devour Jezebel at Jezreel, with no one to bury her.',
    anointed:
      'A commander in bronze scale armor, a bow on his back, stands on the bare steps, oil running down his hair and beard.',
    horn: 'One of the officers blows the ram’s horn, and they shout: Jehu is king!',
    cloaks: 'His fellow officers throw their cloaks down on the steps under his feet.',
  },
  words: {
    jehu: 'Jehu',
    ahaziah: 'Ahaziah',
    joram: 'Joram',
    ahab: 'Ahab',
    zimri: 'Zimri',
    jeroboam: 'Jeroboam',
    baasha: 'Baasha',
    driving: 'driving',
    horses: 'horses',
    chariot: 'chariot',
    eunuchs: 'eunuchs',
    officers: 'officers',
    horsemen: 'horsemen',
  },
  faces: { f1: 'the commander with the bow', f2: 'the king in blue' },
  papers: {},
  blocks: {
    account: {
      heading: 'The account',
      parts: [
        {
          t: 'The prophet Elisha sent a young man of the prophets’ company to the army at Ramoth Gilead. He took one of its officers into an inner room, poured oil on his head, then gave him the LORD’s word: he was king over Israel, and the house of Ahab would fall. The young man ran at once. The other officers threw their cloaks under the new king on the bare steps, blowing the horn. Then he set out for Jezreel, where the king of Israel lay recovering from his wounds, with the king of Judah beside him. The lookout on the tower knew him far off by his ',
        },
        { b: 'a1' },
        {
          t: '. Both kings rode out to meet him on the plot that had been Naboth’s. When he came in at the gate, Jezebel looked down from her window with her eyes made up, and called him ',
        },
        { b: 'a2' },
        { t: ', the man who killed his master.' },
      ],
    },
    word: {
      heading: 'The word in the vineyard',
      parts: [
        {
          t: 'In the vineyard, Elijah told Ahab that the LORD would make him pay for it on Naboth’s own plot. At Jezreel, the king thrown down on that plot was ',
        },
        { b: 'w1' },
        {
          t: '. Of Jezebel, Elijah said dogs would devour her by Jezreel’s wall. There, at the commander’s call, her own ',
        },
        { b: 'w2' },
        { t: ' threw her down from the window, and the word was kept.' },
      ],
    },
  },
  teach: 'Find where the pictures keep Elijah’s word.',
  reveal: [
    'The commander with the bow was Jehu, of the line of Nimshi, anointed king at Ramoth Gilead by a young prophet Elisha sent. The king in blue was Ahaziah, king of Judah. The king in wine-red was Joram, Ahab’s son, recovering at Jezreel from wounds the Arameans had given him. Jehu shot him as he fled and had him thrown down on Naboth’s plot, for the LORD had told Ahab he would make him pay for it there, and that the disaster would come in his son’s days. Ahaziah fled, was wounded as well, and died at Megiddo.',
    'Jezebel made up her eyes, arranged her hair, and met Jehu at the gate with the name of Zimri, a man who killed his master. At his call her own eunuchs threw her down. He went in to eat and drink, then sent men to bury her, since she was the daughter of a king, but the dogs had left almost nothing. It was the word the LORD spoke through Elijah the Tishbite: at Jezreel, dogs would devour Jezebel.',
  ],
} satisfies CaseText<typeof jehu>
