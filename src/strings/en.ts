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

export const strings = {
  title: 'Behold',
  kicker: 'Bible Mystery Game',
  // The title screen's epigraph ships in the bundle by Gate 01 A6's exception; it is app copy, not
  // a component's sentence, and its notice is Crossway's, verbatim. The reveal shows the notice
  // again under the passages (#3).
  epigraph:
    'It is the glory of God to conceal things, but the glory of kings is to search things out.',
  epigraphReference: 'Proverbs 25:2, ESV',
  line: "You know the stories. You don't know the details.",
  status: 'Season one is being written.',
  notice:
    'Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. ESV Text Edition: 2025. The ESV text may not be quoted in any publication made available to the public by a Creative Commons license. The ESV may not be translated in whole or in part into any other language. Used by permission. All rights reserved.',
  updateAvailable: 'Update available',
  update: 'Update',

  // The case cards (#6).
  closed: 'Closed ✓',
  inProgress: 'In progress',

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
  blankWants: (kind: Kind) => `That blank wants ${wants[kind]}.`,
  oneOrTwoWrong: 'One or two are wrong.',
  severalWrong: 'Several are wrong.',

  // The reveal.
  caseClosed: 'The case is closed.',
  readWhatHappened: 'Read what happened',
  loadingPassage: (label: string) => `Loading ${label}…`,
  passageUnavailable: (label: string) =>
    `The passage couldn’t be fetched. Read ${label} in your own Bible.`,
  // The translation's mark beside each passage's label, and the link the ESV's conditions of
  // use ask for on every page that shows its text (#3).
  translations: { ESV: 'ESV' },
  esvLink: { text: 'www.esv.org', href: 'https://www.esv.org' },
  backToCases: 'Back to cases',

  // The sound switches, on the title screen and in the menu (Gate 10 A4).
  music: 'Music',
  effects: 'Effects',
  on: 'On',
  off: 'Off',
} as const satisfies Record<string, Copy>
