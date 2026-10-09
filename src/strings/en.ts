/**
 * App copy, English — every word the interface shows, keyed by id (CLAUDE.md, Guardrails: nothing
 * the player reads lives in code). One module now; a sibling per language later. Case content is
 * the other kind of player text and lives in case files, not here. A sentence with a number or a
 * name in it is a function of them, so the language keeps its own word order.
 */
import type { Kind } from '../cases/types.ts'

type Copy = string | Readonly<Record<string, string>> | ((...args: never[]) => string)

/** A kind as a blank asks for it. */
const wants: Readonly<Record<Kind, string>> = {
  name: 'a name',
  noun: 'a thing',
  action: 'something that happened',
  number: 'a number',
}

/** A case's title inside a sentence: "The mountain" reads "the mountain". */
const inline = (title: string) => title.charAt(0).toLowerCase() + title.slice(1)

/**
 * A count in words, as a close says it (#95): a case has eleven slots at most, and the vineyard,
 * with the most spots, can leave seventeen unfound. The registry's test holds every case to it.
 */
const counted = [
  ...'no one two three four five six seven eight nine ten eleven twelve'.split(' '),
  ...'thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty'.split(' '),
]
/** What a case shows: its one picture, or its pictures. */
const shown = (pictures: number) => (pictures > 1 ? 'pictures' : 'picture')

export const strings = {
  title: 'Behold',
  kicker: 'Bible Mystery Game',
  // The title (#75): its line, then Begin, the player's first tap, which starts the title theme.
  begin: 'Begin',
  bestWithSound: 'Best with sound on.',
  // The epigraph ships in the bundle by Gate 01 A6's exception, on the cases page under the cases
  // (#75); it is app copy, not a component's sentence, and its notice is Crossway's, verbatim. The
  // reveal shows the notice again under the passages (#3).
  epigraph:
    'It is the glory of God to conceal things, but the glory of kings is to search things out.',
  epigraphReference: 'Proverbs 25:2, ESV',
  line: "Look closer. There's more to every story.",
  status: 'Season one is being written.',
  notice:
    'Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. ESV Text Edition: 2025. The ESV text may not be quoted in any publication made available to the public by a Creative Commons license. The ESV may not be translated in whole or in part into any other language. Used by permission. All rights reserved.',
  // The music's credit, under the notice (Gate 10 A1): each CC BY piece by name, its author, its
  // source, that it was edited, and the licence, linked. The register's test holds every CC BY
  // file to a name here.
  credit: 'Music: “Desert City” and “Lamentation” by Kevin MacLeod (incompetech.com), edited,',
  creditLicence: { text: 'CC BY 4.0', href: 'https://creativecommons.org/licenses/by/4.0/' },
  updateAvailable: 'Update available',
  update: 'Update',

  // The case cards (#6), and the season in order (#75, Gate 21 A5): a case opens when the one
  // before it is closed, and a tap on a locked card names the case to play first.
  closed: 'Closed ✓',
  inProgress: 'In progress',
  startHere: 'Start here',
  opensAfter: (before: string) => `Opens after ${inline(before)}`,
  startWithTheValley: 'Start with the valley. It teaches the game.',
  playFirst: (title: string) => `Play ${inline(title)} first. The story runs in order.`,
  // The season, named over the cases after the valley, the way in (#77).
  season: 'Season one',
  seasonName: 'The house of Ahab',

  // The case screen: the bar at its foot, the menu, and the brief's card (#24).
  look: 'Look',
  solve: 'Solve',
  menu: 'Menu',
  start: 'Start',
  // Under the tutorial's brief on its card: the answers are in the picture, not in memory (#77).
  howTo: 'You don’t need to remember the story. Everything you need is in the picture.',
  // Under the found line's words: it opens Solve, meeting the step and the one after (#77).
  openSolve: 'Open Solve',
  cases: 'Cases',
  restart: 'Restart',
  restartConfirm: 'Start this case over? Its progress is cleared.',
  papers: 'Papers',
  somethingLeft: 'something left to find',
  zoom: 'Zoom',

  // Look: the caption docked under the picture.
  tapPrompt: 'Tap anything that looks like it matters.',
  more: 'More',
  less: 'Less',
  found: 'Found:',
  copiedToPapers: 'copied to Papers',

  // The bank, on Solve.
  legend: { name: 'names', noun: 'things', action: 'actions', number: 'numbers' },
  bankEmpty: 'Nothing yet. Tap things in the picture.',

  // A paper opened, and Papers.
  close: 'Close',

  // Solve.
  oneOfTheFaces: 'one of the faces in Solve',
  whoIsWho: 'Who is who',
  who: 'who?',
  whatHappenedFirst: 'What happened first',
  orderHint: 'Tap a picture below, then tap First, Then, or Last.',
  first: 'First',
  then: 'Then',
  last: 'Last',
  emptySlot: '—',
  closeCase: 'Close the case',
  // A blank's refusal names its kind, and while no word of that kind is found, where to look (#71).
  blankWants: (kind: Kind, found: boolean) =>
    found
      ? `That blank wants ${wants[kind]}.`
      : `That blank wants ${wants[kind]}. Find one in the picture.`,
  // A failed close's count, as a number (#95). A miss is the picture's, never the player's (#77):
  // answers that don't fit the story.
  noMatch: (n: number) =>
    `${counted[n].charAt(0).toUpperCase()}${counted[n].slice(1)} ${n === 1 ? 'answer doesn’t' : 'answers don’t'} fit the story.`,
  // A failed close with something still unfound says how much (#95).
  toFind: (n: number, pictures: number) =>
    `There ${n === 1 ? 'is' : 'are'} ${counted[n]} more to find in the ${shown(pictures)}.`,
  // What a screen reader hears after an answer a failed close rings (#77, #95).
  ringedNoMatch: ', ringed: doesn’t fit the story',

  // Hints (#29): offered once the game sees a player stuck, in the caption's dock on Look and
  // beside Close the case on Solve, and quietly in the menu; each tier asked for. A hint's words
  // sit beside its ring and follow it through the buttons that lead there.
  hint: 'Hint',
  stuck: 'Stuck?',
  whereToLook: 'Where to look',
  stillStuck: 'Still stuck?',
  showMe: 'Show me',
  hintSays: {
    unfound: 'There’s still something to find here.',
    stranded: 'Find the other words in the picture.',
    close: 'Close the case to check your answers.',
  },
  hintThing: 'Here it is. Tap it.',
  // A hint for an answer names it (#102): a face by its line, the order by its question, a blank by
  // the words beside it, with its mark.
  hintSettles: (answer: string) => `Something here settles “${answer}”.`,
  hintSettlesThing: (answer: string) => `This settles “${answer}”. Tap it.`,
  // On a moment's button, a hint's words name the moment as its button shows it and say to open
  // it, in one sentence: for more to find, or to settle an answer, named (#106 [1]).
  hintOpen: (moment: string, answer?: string) =>
    answer === undefined
      ? `Open ${moment}: there’s more to find.`
      : `Open ${moment} to settle “${answer}”.`,
  blankMark: '___',

  // The reveal.
  caseClosed: 'The case is closed.',
  hintsUsed: (n: number) => (n === 1 ? 'You asked for 1 hint.' : `You asked for ${n} hints.`),
  // The reveal leads with what the closes found wrong (#107): each answer as a hint names it, what
  // it was, and what was put there, then the verse that says it, a link to it in the passage.
  secondLook: 'Worth a second look',
  missed: (name: string, answer: string, puts: readonly string[]) =>
    `“${name}”: ${answer}. You put ${puts.join(', then ')}.`,
  inTurn: (moments: readonly string[]) => moments.join(', then '),
  inOrder: (moments: readonly string[]) => moments.join(', '),
  moreMissed: (n: number) => `${n} more`,
  readVerse: (cite: string) => `Read ${cite}`,
  readWhatHappened: 'Read what happened',
  loadingPassage: (label: string) => `Loading ${label}…`,
  passageUnavailable: (label: string) =>
    `The passage couldn’t be fetched. Read ${label} in your own Bible.`,
  // The translation's mark beside each passage's label, and the link the ESV's conditions of
  // use ask for on every page that shows its text (#3).
  translations: { ESV: 'ESV' },
  esvLink: { text: 'www.esv.org', href: 'https://www.esv.org' },
  backToCases: 'Back to cases',

  // The sound switches, on the cases page and in the menu (Gate 10 A4), and under them on an
  // iPhone only, whose silent mode mutes the game (#72).
  music: 'Music',
  effects: 'Effects',
  on: 'On',
  off: 'Off',
  silentMode: 'Silent mode mutes the game on iPhone.',
} as const satisfies Record<string, Copy>
