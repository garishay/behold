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
  // (#75); it is app copy, not a component's sentence. It is the Berean Standard Bible's, which is
  // in the public domain, so it needs no notice (Gate 33 A4).
  epigraph: 'It is the glory of God to conceal a matter and the glory of kings to search it out.',
  epigraphReference: 'Proverbs 25:2, BSB',
  line: "Look closer. There's more to every story.",
  status: 'Season one is complete.',
  // The music's credit, at the cases page's foot (Gate 10 A1): each CC BY piece by name, its
  // author, its source, that it was edited, and the licence, linked. The register's test holds
  // every CC BY file to a name here.
  credit: 'Music: “Desert City” and “Lamentation” by Kevin MacLeod (incompetech.com), edited,',
  creditLicence: { text: 'CC BY 4.0', href: 'https://creativecommons.org/licenses/by/4.0/' },
  // The privacy policy's link, at the cases page's foot under the credit (#9). The policy's own
  // words are `policy`, below.
  privacy: 'Privacy policy',
  // The copyright page's link, beside the privacy policy's (Gate 33 A3). Its words are
  // `copyrightPage`, below.
  copyright: 'Copyright',
  // About, the cases page's foot (#7): its heading, what the game counts, and Counting's switch,
  // which turns it off. The switch reads as Music's and Effects' do, "Counting · On".
  about: 'About',
  countingLine: 'Behold counts how its cases are played, never who plays them.',
  counting: 'Counting',
  // The update toast (Gate 01 A2): its words, its button, and the button once tapped, until the
  // new version reloads the page (#61).
  updateAvailable: 'Update available',
  update: 'Update',
  updating: 'Updating…',

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
  // Restart's question, the game's own, and its two answers (#153).
  restartConfirm: 'Start this case over? Its progress is cleared.',
  startOver: 'Start over',
  cancel: 'Cancel',
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

  // Solve. A person's tap says they are a face there; from the vineyard on, where a name comes from
  // what bears it, one that gives none says so in the same part of the line, where the surprise
  // is; and a thing that dates a moment says what it is for (#131).
  aFace: 'a face in Solve',
  aFaceNoName: 'a face in Solve, but no name',
  clueToOrder: 'a clue to the order',
  whoIsWho: 'Who is who',
  who: 'who?',
  whatHappenedFirst: 'What happened first',
  // The pictures are never shown in the order they happened, and the line says so in the story's
  // terms, since "shuffled" went the way "out of order" did (#118, #123).
  orderHint: 'These pictures aren’t in story order. Tap one, then tap First, Then, or Last.',
  // The last picture that would leave the order as the tray lists it is refused, as a blank refuses
  // the wrong kind of word, and these words ring the order, where the next tap is (#123).
  listed: 'That’s how they’re listed, not how the story went.',
  first: 'First',
  then: 'Then',
  last: 'Last',
  emptySlot: '—',
  closeCase: 'Close the case',
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
  // From the vineyard on, a close that finds three or more says only that, so the count shows
  // once the player is close (#125).
  overTwo: 'More than two answers don’t fit the story.',
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
  // The citation by each passage's label, linked to the copyright page, as API.Bible's terms ask
  // (§7); and under the passages, the Starter plan's citation of API.Bible, linked (Gate 33 A3).
  translations: { NIV: '(NIV)' },
  bibleText: 'Bible text from',
  apiBible: { text: 'API.Bible', href: 'https://api.bible' },
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
  effective: 'Takes effect 30 October 2026.',
  intro:
    'Behold is a Bible mystery game that runs in your web browser, at play.beholdgame.com or installed on your device, and in its own app from Google Play. This page says what the game keeps, what it sends, and who sees it.',
  sections: [
    {
      heading: 'In short',
      points: [
        'Behold has no accounts and no ads, and it collects nothing that says who you are.',
        'Your progress stays on your device, and the game never sends it anywhere.',
        'It counts how its cases are played, never who plays them. You can turn Counting off in About, at the foot of the cases page.',
        'Like any website, the services the game uses see your device’s internet (IP) address. What each one does with it is below.',
      ],
    },
    {
      heading: 'What stays on your device',
      points: [
        'Your progress in each case: where you left off, what you’ve found, the words you’ve placed, the order you’ve set, the hints you asked for, the answers a close found wrong, and whether the case is closed. Your browser keeps it for this site, under behold.progress. The Google Play app keeps its own, apart from your browser’s.',
        'Whether Music, Effects, and Counting are on, under behold.music, behold.effects, and behold.counting, each kept once you first switch it.',
        'Copies that let the game work offline: its own files; the title’s and the cases’ pictures as the game loads them, up to 200; the passages shown when a case closes, up to 11, each for up to 30 days; and the music you hear, up to 8 pieces. The game notes when each copy was last used, so that the one used longest ago goes first.',
        'None of this leaves your device, and the game sets no cookies.',
      ],
    },
    {
      heading: 'What leaves your device',
      points: [
        'Your browser, or the Google Play app, asks the game’s site for its pages, pictures, and sound, as a browser does for any website.',
        'In the Google Play app, Android’s WebView checks the addresses the game opens with Google Safe Browsing.',
        'When a closed case shows its passages, the game asks its passage service for them, and shows your device’s own copy when the service can’t be reached. Each request names a passage and its translation, such as 1 Kings 21 in the NIV, and nothing about you.',
        'Like any request a browser makes, each one carries your device’s IP address and the usual details a browser sends, such as its type and language.',
        'While Counting is on, the game counts how it is played: the game opened, a case opened or closed, a tutorial step done, a hint asked for, a close with answers that don’t fit, and where a case stood when you left it. Each count says what happened, in which case, and one detail from a few, such as a time rounded to minutes, or how many answers didn’t fit.',
        'The counts are added up in memory while you play, never stored, and sent together when you leave the game or switch away from it. They never say who you are, what you put in a blank, or anything about your device. With Counting off, nothing is counted, and counts not yet sent are dropped.',
        'Nothing else is sent: no ads, no tracking, and no scripts or fonts from other sites.',
        'Links to other sites, such as api.bible when a case closes, biblica.com on the copyright page, and the music’s licence at creativecommons.org, open in your browser only if you tap them.',
      ],
    },
    {
      heading: 'Who sees what',
      points: [
        'GitHub hosts the game’s site, on GitHub Pages. GitHub logs and stores each visitor’s IP address “for security purposes”.',
        'Cloudflare runs the passage service, at behold-passages.garishay.workers.dev. The service sees the passage asked for. Cloudflare receives your device’s IP address with each request, as any host does, and the service never reads it. It keeps no log, and stores nothing about you.',
        'The service gets the passages’ text from API.Bible, run by the American Bible Society, on a schedule of its own, and keeps a copy. It answers your requests from that copy.',
        'Each time it shows a passage, it tells API.Bible’s Fair Use Management System, at fums.api.bible, which passage was shown, as API.Bible asks of every app that shows its text. That report comes from Cloudflare, not your device. It carries two random numbers made for that one view, and nothing about you.',
        'Cloudflare runs the count service too, at behold-counts.garishay.workers.dev. It adds each count to that day’s total and keeps nothing else: not the counts as they came, not when in the day, and not your device’s IP address, which Cloudflare receives with them, as any host does, and the service never reads. It keeps no log.',
        'The game’s developer receives nothing about you from the game, only each day’s totals of the counts. While fixing a fault, the developer may watch the passage service’s and the count service’s requests as they arrive, and keeps none of them.',
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
        'What the game keeps on your device stays until you clear it, within the limits above. Restart, in a case’s menu, clears that case’s progress. To clear everything, clear the stored data for play.beholdgame.com in your browser’s settings, or the Google Play app’s storage in your phone’s settings.',
        'The passage service keeps no record of your requests. The count service keeps each day’s totals for as long as the game runs; they hold nothing that says who you are, so nothing in them can be found or deleted as yours. GitHub and Cloudflare keep what their own policies say.',
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

/**
 * The copyright page (Gate 33 A3), its own page at `copyright/`, written whole at build time as the
 * privacy policy is (`src/copyright/page.ts`). API.Bible's terms (§7) ask for it, linked from the
 * citation by each passage, with the translation's name, its abbreviation, its holder's notice,
 * and the holder's site; the notice is the one API.Bible gives for the NIV, verbatim (#138, hand
 * step 4). The Starter plan asks for a citation of API.Bible, linked.
 */
export const copyrightPage = {
  tab: 'Behold: Copyright',
  title: 'Copyright',
  intro:
    'When a case closes, Behold shows its passage from the New International Version (NIV), fetched from API.Bible as it is read.',
  sections: [
    {
      heading: 'The New International Version',
      points: [
        'The Holy Bible, New International Version® NIV® Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.® Used by Permission of Biblica, Inc.® All rights reserved worldwide. To learn more, visit http://biblica.com and http://facebook.com/Biblica.',
      ],
      links: [{ text: 'biblica.com', href: 'https://biblica.com' }],
    },
    {
      heading: 'API.Bible',
      points: ['The passages come from API.Bible, a service of the American Bible Society.'],
      links: [{ text: 'api.bible', href: 'https://api.bible' }],
    },
    {
      heading: 'The epigraph',
      points: [
        'Proverbs 25:2, on the cases page, is from the Berean Standard Bible (BSB), which is in the public domain.',
      ],
    },
  ],
  back: 'Back to Behold',
} satisfies Omit<Policy, 'effective'>

/**
 * The Play app's own words (#151): when the page's renderer has gone too often for the app to keep
 * building it again, the app shows them in the page's place. The app's build reads them from here
 * (`android/app/build.gradle`), so each stays a line of its own in single quotes; the site imports
 * none of them.
 */
export const shell = {
  stopped: 'The game keeps stopping.',
  tryAgain: 'Try again',
}
