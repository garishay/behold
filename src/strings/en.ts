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
  closeCaseProgress: (filled: number, total: number) =>
    `Close the case — ${filled} of ${total} filled`,
  // A blank's refusal names its kind, and while no word of that kind is found, where to look (#71).
  blankWants: (kind: Kind, found: boolean) =>
    found
      ? `That blank wants ${wants[kind]}.`
      : `That blank wants ${wants[kind]}. Find one in the picture.`,
  oneOrTwoWrong: 'One or two are wrong.',
  severalWrong: 'Several are wrong.',

  // Hints (#29): offered once the game sees a player stuck, in the caption's dock on Look and
  // beside Close the case on Solve, and quietly in the menu; each tier asked for. A hint's words
  // sit beside its ring, eight or fewer, and follow it through the buttons that lead there.
  hint: 'Hint',
  stuck: 'Stuck?',
  whereToLook: 'Where to look',
  stillStuck: 'Still stuck?',
  showMe: 'Show me',
  hintSays: {
    unfound: 'There’s still something to find here.',
    stranded: 'Find the other words in the picture.',
    evidence: 'Something here settles one answer.',
    close: 'Close the case to check your answers.',
  },
  hintThing: 'Here it is. Tap it.',

  // The reveal.
  caseClosed: 'The case is closed.',
  hintsUsed: (n: number) => (n === 1 ? 'You asked for 1 hint.' : `You asked for ${n} hints.`),
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
