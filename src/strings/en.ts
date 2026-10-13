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
/** An answer, named as a hint names it, that a close found wrong: it leads its sentence (#123). */
const misfit = (answer: string) =>
  `“${answer.charAt(0).toUpperCase()}${answer.slice(1)}” doesn’t fit the story.`

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
  // The privacy policy's link, at the cases page's foot under the credit (#9). The policy's own
  // words are `policy`, below.
  privacy: 'Privacy policy',
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
  // The pictures are never shown in the order they happened, and the line says so (#118).
  orderHint: 'The pictures below are shuffled. Tap one, then tap First, Then, or Last.',
  first: 'First',
  then: 'Then',
  last: 'Last',
  emptySlot: '—',
  closeCase: 'Close the case',
  // From the vineyard on, Close's place after a failed close, until a thing tapped on Look settles
  // an answer the close found wrong (#118, #123). It says why Close waits and what brings it back,
  // with the verb the game uses for its tabs; it never says the player guessed.
  closeAfterLook: 'To close again, open Look and find a clue.',
  // Once the account is full, what's left is rung with what it wants: a face, or the order (#114).
  owedFace: 'Who is this? A face takes a name.',
  owedOrder: 'What happened first? Order the pictures too.',
  // A blank's refusal names its kind, and while no word of that kind is found, where to look (#71).
  blankWants: (kind: Kind, found: boolean) =>
    found
      ? `That blank wants ${wants[kind]}.`
      : `That blank wants ${wants[kind]}. Find one in the picture.`,
  // A face's says a face, since "blank" reads as the account's (#114).
  faceWants: (found: boolean) =>
    found ? 'That face wants a name.' : 'That face wants a name. Find one in the picture.',
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
  // A hint for an answer names it (#102): a face by its line, a blank by the words beside it, with
  // its mark, and the order as the order, since "What happened first" beside a moment's name read
  // as the answer (#118).
  hintSettles: (answer: string) => `Something here settles “${answer}”.`,
  hintSettlesThing: (answer: string) => `This settles “${answer}”. Tap it.`,
  theOrder: 'the order',
  // On a moment's button, or Look's from Solve, a hint's words name the button as it shows it and
  // say to open it, in one sentence: for more to find, or to settle an answer, named (#106 [1],
  // #118).
  hintOpen: (moment: string, answer?: string) =>
    answer === undefined
      ? `Open ${moment}: there’s more to find.`
      : `Open ${moment} to settle “${answer}”.`,
  // A hint for an answer a failed close found wrong, while it still holds what the close found,
  // says first that it doesn't fit, in the close's words, then where its clue is: on a button, in
  // the half of the picture, or the thing itself (#123).
  misfitOpen: (button: string, answer: string) => `${misfit(answer)} Open ${button} for a clue.`,
  misfitHere: (answer: string) => `${misfit(answer)} There’s a clue here.`,
  misfitThing: (answer: string) => `${misfit(answer)} Here’s a clue. Tap it.`,
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

/** A link, by its words and its address. */
export interface Link {
  readonly text: string
  readonly href: string
}

/** The privacy policy's words: the tab's title, the heading, its date, and its sections in order. */
export interface Policy {
  readonly tab: string
  readonly title: string
  readonly effective: string
  readonly intro: string
  readonly sections: readonly {
    readonly heading: string
    readonly points: readonly string[]
    readonly links?: readonly Link[]
  }[]
  readonly back: string
}

/**
 * The privacy policy (#9), its own page at `privacy/`, written whole at build time so it reads
 * without JavaScript (`src/privacy/page.ts`). What it says the game keeps and sends is held to the
 * code by `src/privacy/page.test.ts`: a change to either changes both (Gate 17 A7, [G13]).
 */
export const policy: Policy = {
  tab: 'Behold: Privacy policy',
  title: 'Privacy policy',
  effective: 'Takes effect 13 October 2026.',
  intro:
    'Behold is a Bible mystery game that runs in your web browser, at play.beholdgame.com or installed on your device. This page says what the game keeps, what it sends, and who sees it.',
  sections: [
    {
      heading: 'In short',
      points: [
        'Behold has no accounts, no ads, and no analytics, and it collects nothing about you.',
        'Your progress stays on your device, and the game never sends it anywhere.',
        'Like any website, the services the game uses see your device’s internet (IP) address. What each one does with it is below.',
      ],
    },
    {
      heading: 'What stays on your device',
      points: [
        'Your progress in each case: where you left off, what you’ve found, the words you’ve placed, the order you’ve set, the hints you asked for, the answers a close found wrong, and whether the case is closed. Your browser keeps it for this site, under behold.progress.',
        'Whether Music and Effects are on, under behold.music and behold.effects, each kept once you first switch it.',
        'Copies that let the game work offline: its own files; the title’s and the cases’ pictures as the game loads them, up to 200; the passages shown when a case closes, up to 11, each for up to 30 days; and the music you hear, up to 8 pieces. The game notes when each copy was last used, so that the one used longest ago goes first.',
        'None of this leaves your device, and the game sets no cookies.',
      ],
    },
    {
      heading: 'What leaves your device',
      points: [
        'Your browser asks the game’s site for its pages, pictures, and sound, as it does for any website.',
        'When a closed case shows its passages, the game asks its passage service for them, unless your device already has them. Each request names a passage and its translation, such as 1 Kings 21 in the ESV, and nothing about you.',
        'Like any request a browser makes, each one carries your device’s IP address and the usual details a browser sends, such as its type and language.',
        'Nothing else is sent: no analytics, no ads, no tracking, and no scripts or fonts from other sites.',
        'Links to other sites, such as www.esv.org when a case closes and the music’s licence at creativecommons.org, open in your browser only if you tap them.',
      ],
    },
    {
      heading: 'Who sees what',
      points: [
        'GitHub hosts the game’s site, on GitHub Pages. GitHub logs and stores each visitor’s IP address “for security purposes”.',
        'Cloudflare runs the passage service, at behold-esv.garishay.workers.dev. The service sees the passage asked for. Cloudflare receives your device’s IP address with each request, as any host does, and the service never reads it. It keeps no log, and stores nothing about you.',
        'The service gets the passages’ text from the ESV API, run by Crossway, the ESV’s publisher, on a schedule of its own, and keeps a copy. It answers your requests from that copy, so they go no further than Cloudflare, and it sends nothing about you to Crossway.',
        'The game’s developer receives nothing about you from the game, except while fixing a fault, when the developer may watch the passage service’s requests as they arrive and keeps none of them.',
      ],
      links: [
        {
          text: 'GitHub’s privacy statement',
          href: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
        },
        { text: 'Cloudflare’s privacy policy', href: 'https://www.cloudflare.com/privacypolicy/' },
      ],
    },
    {
      heading: 'How long things are kept',
      points: [
        'What the game keeps on your device stays until you clear it, within the limits above. Restart, in a case’s menu, clears that case’s progress. To clear everything, clear the stored data for play.beholdgame.com in your browser’s settings.',
        'The passage service keeps no record of your requests. GitHub and Cloudflare keep what their own policies say.',
        'If you write to the address below, your message reaches the developer’s own inbox. It stays in the developer’s inbox, and is deleted if you ask.',
      ],
    },
    {
      heading: 'Keeping it safe',
      points: [
        'Everything the game sends and receives travels encrypted, over HTTPS.',
        'What the game keeps on your device belongs to this site alone, and other sites can’t read it.',
        'Beyond your device, the game keeps nothing about you, so there’s nothing of yours for it to lose.',
      ],
    },
    {
      heading: 'Changes',
      points: [
        'When the game changes what it keeps or sends, this page changes in the same update, with a new date.',
      ],
    },
    {
      heading: 'Contact',
      points: ['Behold is made by Shay House.', 'Write with any question about privacy:'],
      links: [{ text: 'hello@beholdgame.com', href: 'mailto:hello@beholdgame.com' }],
    },
  ],
  back: 'Back to Behold',
}
