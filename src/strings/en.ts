/**
 * App copy, English — every word the interface shows, keyed by id (CLAUDE.md, Guardrails: nothing
 * the player reads lives in code). One module now; a sibling per language later. Case content is
 * the other kind of player text and lives in case files, not here.
 */
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
} as const satisfies Record<string, string>
