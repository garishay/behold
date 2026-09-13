/**
 * App copy, English — every word the interface shows, keyed by id (CLAUDE.md, Guardrails: nothing
 * the player reads lives in code). One module now; a sibling per language later. Case content is
 * the other kind of player text and lives in case files, not here. A sentence with a number or a
 * name in it is a function of them, so the language keeps its own word order.
 */
type Copy = string | Readonly<Record<string, string>> | ((...args: never[]) => string)

export const strings = {
  title: 'Behold',
  kicker: 'Bible Mystery Game',
  // The title screen's epigraph ships in the bundle by Gate 01 A6's exception; it is app copy, not
  // a component's sentence, and its notice is Crossway's, verbatim.
  epigraph:
    'It is the glory of God to conceal things, but the glory of kings is to search things out.',
  epigraphReference: 'Proverbs 25:2, ESV',
  line: "You know the stories. You don't know the details.",
  status: 'Season one is being written.',
  notice:
    'Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. ESV Text Edition: 2025. The ESV text may not be quoted in any publication made available to the public by a Creative Commons license. The ESV may not be translated in whole or in part into any other language. Used by permission. All rights reserved.',
  updateAvailable: 'Update available',
  update: 'Update',
  // The passage stub's one line (#6), shown in the reveal until the proxy (#3) answers.
  passagePending: 'The passage appears here once the translation service is connected.',

  // The case cards (#6).
  closed: 'Closed ✓',
  inProgress: 'In progress',

  // The case screen: its header and tabs.
  cases: 'Cases',
  restart: 'Restart',
  restartConfirm: 'Start this case over? Its progress is cleared.',
  moments: 'Moments',
  papers: 'Papers',
  zoom: 'Zoom',

  // The bank, and the console above it.
  thingsFound: (moment: string, found: number, total: number) =>
    `${moment} · ${found} of ${total} things found here`,
  tapPrompt: 'Tap anything that looks like it matters.',
  found: 'Found:',
  copiedToPapers: 'copied to Papers',
  wordsFound: 'Words you’ve found',
  legend: { name: 'names', noun: 'things', action: 'actions', number: 'numbers' },
  bankEmpty: 'Nothing yet. Tap things in the picture.',

  // Papers, and a paper opened.
  papersEmpty:
    'Nothing here yet. Things with writing on them open when you tap them, and a copy lands here.',
  close: 'Close',
} as const satisfies Record<string, Copy>
