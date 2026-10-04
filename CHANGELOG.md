# Changelog

Entries run in one list in version order, newest first; within a version, by PR number. A version
is reserved when its entry is created, at the PR's open, so a lower number may land later.

## v0.16.0 — Gate 23, the music comes round (#84)

- **84a — the music comes round** (#88): each cue played through, rested a minute, and faded
  back in, and on Look and Solve that minute read as the music ending. The case bed now loops in
  place, with no rest and no fade on the way round; its fade-in on arrival and fade-out on
  leaving stay. It is cut to its music's own edges: the source MP3 carries no gapless tag, so its
  decode held 62 ms of the codec's priming and padding, which a loop would carry round as a dip
  and a late beat. The cut keeps the 128 beats between them, so the loop keeps time. The title
  theme comes round after a 3 s breath in place of the minute. The sound register records the
  new cut, its command, and how each cue comes round.

## v0.15.4 — Gate 22's fourth amendment, both guided fills lead with the slot (#77)

- **77e — both guided fills lead with the slot** (#86): with step 4 word-first, the valley
  practised each way of filling once, and a tester stumbled on its words, "Tap David, then the
  slot under the boy." Step 4 now leads with the slot, as step 5 does: it rings the slot under
  the boy, then David once the slot waits, with sling dimmed, and its words read "Tap the slot
  under the boy, then David." Either order still meets it. So the valley practises twice the fill
  that narrows the bank: step 4 dims sling for a name, and step 5 dims David for a thing. The
  docs say both guided fills lead with the slot.

## v0.15.3 — Gate 22's third amendment, the blank-first fill (#77)

- **77d — the blank-first fill** (#83): the tutorial taught the fill one way, since steps 4 and 5
  both led with the word, and a first-time player who placed every word that way never met the
  kind filter: an empty blank tapped first dims the words that can't go there. Step 5 now leads
  with sling's blank, then sling once the blank waits, with "Tap the blank first. Fitting words
  stay bright."; either order still meets it, and step 4 stays word-first, so the valley shows
  the fill both ways. Rule 1's rivals keep the filter from deciding a blank. A step that waits on
  a face or a blank may lead with it in the case format (`slotFirst: true`). A mark's words now
  wrap balanced, so step 5's two sentences take a line each and no label leaves a word alone on
  its last line.

## v0.15.2 — Gate 22's second amendment, Next and the mountain's dots (#77)

- **77c — Next and the mountain's dots** (#82): the found line's step tells and asks for nothing,
  so a player waited on it, or tapped the picture and found more than it meant. Its words now
  carry Next, a real button a keyboard reaches, and Next meets the step; the next tap or move
  still does. The mark leaves a press on Next to Next's own click, since met on the press the
  step would take Next away and the click would fall to the picture under it. The mountain is
  the first case with more than one picture, and its order is told by spots that give no word,
  so its card carries one line under the brief: "Three pictures this time. A dot means more to
  find there." A case's text may carry such a note, on its card only, and rule 2 keeps it from
  answering: it says only how the case's screen is played, never what the case holds.

## v0.15.1 — Gate 22's amendment, the valley's opening and the question on a miss (#77)

- **77b — the valley's opening and the question on a miss** (#81): asked before the first try,
  the valley's question singled out the one blank to work out before the player had tried it, so
  its one deduction came as a prompt, not a find. It now comes on a miss, on the return trip rule
  4 counts on: Close the case follows the sweep again, and a close that finds the sword's blank
  wrong rings that blank, never Goliath's word, with "Whose sword? Look closer at the picture."
  as its retry, and rings only Solve's button from Look ([Q11]). A close wrong elsewhere keeps
  "Some are wrong. Look closer, then try again." Once asked, the blank takes its ✓ when right; a
  first-try answer takes none. The case format names the slot a guided case asks about, `ask`,
  in place of `ask: true`, and check (m) holds the question to eight words and its slot to a face
  or a blank. The valley's card says how to play under its brief: "Tap the picture to find words.
  What you see and read tells you where they go." After the boy's tap a step rings the dock
  whole, the caption with its line of finds, with "That tap found two words: David and sling."
  above it; the next tap or move reads it, and "Open Solve to name him." follows. Rule 5 names
  the inference as asked on a miss.

## v0.15.0 — Gate 22, the sword, the order, and the season (#77)

- **77a — the sword, the order, and the season** (#80): playtest 2's second remote tester put
  David in the sword's blank, since every guided move in the valley was a direct match and none
  showed an answer worked out from the picture. After the sweep the valley now asks: it rings the
  sword's blank, never Goliath's word, with "Whose sword? Look closer at the picture.", rings
  only Solve's button from Look, with no words ([Q11]), and asks again on a wrong name; the
  right one takes its ✓, and Close the case follows. A step may ask in the case format
  (`ask: true`), and progress kept from before moves past every step it has met. Both remote
  testers read the mountain's order as it was shown, so
  its lesson reads "These are out of order. Which happened first?", and the order's pictures lie
  loose in a tray, two to a row, none under a slot; check (p) fails a case whose pictures are
  listed in the order they happened. A time on a card read as a par to beat, so the cards drop
  their times. The valley stands apart as the way in, "Learn to play · take your time", and
  "Season one" over "The house of Ahab" names the season above the cases after it, which count
  within it, "Case one" to "Case three".

## v0.14.1 — Gate 21, the season in order (#75)

- **75b — the season in order** (#78): playtest 2's first remote player left the valley unclosed
  for the mountain and the vineyard, and the cases after the valley are one story as well as a
  ladder, so out of order a payoff comes before its setup. The season now plays in order: a case
  opens when it is the first, when the case before it is closed, or when the player has already
  started it. A locked card's picture is greyed under a lock and its words dimmed, and it names
  the case it waits for: "Opens after the valley". A tap on one opens nothing. For three seconds
  it lights the earliest case not yet closed and says why: "Start with the valley. It teaches the
  game." while that is the valley, and past it the case by name, as in "Play the mountain first.
  The story runs in order." While an update waits, the note sits above its toast ([Q10]). The
  valley, unstarted, has a gold edge and "Start here". Restarting a closed case locks again only
  the cases after it that were never opened. Rule 6 says the season plays in order.

## v0.14.0 — Gate 21, the title and the cases page (#75)

- **75a — the title, Begin, and the cases page** (#76): sound starts on a tap, and a new player's
  first tap landed on a case card, so the title theme was rarely the first music heard. The app now
  opens on its title: a view of the land with a moment from each of the first four cases, fading
  into the night under "Behold", the line a sentence to a line, and Begin, with "Best with sound
  on." under it and, on an iPhone, the silent-mode sentence. Begin is the first tap, so it starts
  the title theme. The words fade, the picture darkens and pushes in, Behold and the kicker glide
  up into the cases page's header, and the cards rise one by one; under reduced motion Begin cuts
  straight to the page. The page takes no tap until the way out ends, or for half a second after a
  cut, so a second tap on Begin opens nothing and no card takes a tap before it can be seen. The
  title adds no history entry, and never shows inside a case or on the way back from one. The cases
  page has a compact header, the cases first, and the Proverbs card under them. The picture is
  `public/title.jpg`, stamped with its hash and kept like the case pictures, with its record and its
  retouch script in `docs/`.

## v0.13.0 — Gate 20, the hand-off, the words, and the iPhone line (#25, #71, #72, #73)

- **20a — the hand-off, the words, and the iPhone line** (#74): playtest 2's first remote player
  made every guided move, then was pointed at Close the case with five blanks no word could fill.
  The tutorial's new fifth step sends the player to the picture, "Find the other words in the
  picture.", at Look's button until every spot is found or everything Solve asks for is filled,
  and Look greets them with its prompt again; Close the case comes after it. Its words and the
  last step's leave on the next tap and come back when the step is shown again. A failed close in
  the tutorial says the answers were checked: "Some are wrong. Look closer, then try again." A
  refused word's note adds "Find one in the picture." while no word of the blank's kind is found.
  The title's line is "Look closer. There's more to every story.", a sentence to a line. On an
  iPhone, whose silent mode mutes the game, the sound switches say so. The case format gains
  `{ found: 'all' }` and `retry`, held by check (m).

## v0.12.0 — Gate 14, hints (#29)

- **29a — hints, offered when a player is stuck** (#65): the game watches for a stall — six taps on
  the picture that find nothing new while something is unfound, ninety seconds on a moment with
  something left, thirty seconds on Solve with something empty and nothing left to place, or two
  failed closes — and only then offers a hint, a quiet line in the caption's dock or a button
  beside Close the case. A player with nothing left to place is sent where a word of the missing
  kind is: "Find the other words in the picture." Each tier is asked for: the first rings the
  half of the picture that holds the thing, grown to take in the whole of it, reached through
  Look's button and the moment's picker as a step's mark is; the second rings the thing itself;
  neither gives the word, and a hint's words leave on the next tap while its ring stays. After a
  failed close a hint points at the evidence for the first thing that close found wrong, kept from
  the close, and never says which blank. A quiet Hint sits in the menu. Under the tutorial's
  guided steps the step's own mark is the hint, and a stall shows it again. A hint costs nothing
  and makes no sound; the reveal says how many were asked for, and nothing when none were. The
  thresholds are one table of data, `stuck`; the case format gains `evidence`, held by check (o);
  and progress kept before hints reads as none used.

## v0.10.4 — Gate 12, the vineyard's picture (#33)

- **33a — the vineyard, regenerated** (#62): case three's first moment generated from its scene
  brief, the dogs and the stain moved to where Naboth was stoned: past the vineyard's far wall, on
  a bare slope outside the town, two lean pariah dogs at a dark stain among scattered stones, with
  the sandal and the torn cloth gone; the palace with no columns and no banner, and the small
  window on its tower squared to a lintel in code ([Q8]); the five boxes fitted to it under check
  (l) with the Zoom pill, the stain's the tightest at 46.4 px; the stain's caption, "Outside the
  town, past the vineyard wall"; and `scenes.md`, the case's three briefs, the vineyard's with its
  two prompts as sent and its two retouches in code, the bedchamber's and the gate's written from
  their pictures as they stand. The registry test now fails a case without its briefs ([Q9]). At
  the gate, the stones' box stops where the seated man's hair begins, so a tap at his eyes finds
  him and not the stones (#63).

## v0.10.3 — Gate 10, the owner's listen (#52)

- **52d — the title theme, softer** (#60): _Lamentation_, the title theme, goes from −18 to −20
  LUFS integrated, 2 dB down on the owner's listen on the phone and still 2 dB over the case bed;
  its register entry and command follow. Each file's register entry now records its SHA-256, and
  the register test holds every file to it, so none changes without its entry ([Q7]).

## v0.10.2 — Gate 10, the owner's picks (#52)

- **52c — the picks, the swap, and the levels** (#59): from the owner's three sound checks, the lyre
  leaves every effect: a small brass bell for the find, tuned to the case bed's F and set 4 dB
  under the rest, since it sounds most often; two falling notes on a flute for not yet; and the
  bell struck three times in the sting's shape for the close, tuned to the bed's tonic chord, with
  a timbrel's shimmer under the last strike; the knock and the scroll as they were. _Lamentation_
  becomes the title theme at −18 LUFS and _Desert City_ the case bed at −22, with the other effects
  6 dB over the bed's average but the knock, one sharp tap that its limiter holds at −21.8 to keep it
  under −1 dBTP like every file. World rules §9's palette gains small bronze bells (Exodus
  28:33–35), and the register records each file's sources, level, and command.

## v0.10.1 — Gate 11, the valley's picture (#35)

- **35a — the valley, regenerated** (#58): the tutorial's one picture generated from its scene
  brief, at 4:5 like every case: the giant's own sword sheathed at his hip, the clearest sword in
  the picture; plain cloth headbands and scale armor in the heap, so world rules §8's two valley
  lines leave; no banners, and a plain bronze cap for the helmet; the six boxes fitted to it under
  check (l) with the Zoom pill, and d1 and d2 recut; the giant's caption, "a sheathed sword at his
  side"; and `scenes.md`, the brief with its three prompts as sent.

## v0.10.0 — Gate 10, sound (#52)

- **52a — the sound effects** (#55): five effects on the player's own moves, in place of the
  sting: a lyre's pluck on a spot's first tap, a scroll's rustle on a paper copied, a knock on
  wood for anything set in a slot, right or wrong alike, two falling lyre notes when Close the
  case is answered wrong, and three rising ones, the sting's shape, when it is answered right;
  silence everywhere else; one Web Audio context, made on the first tap with the session ambient,
  suspended while the app is hidden; the Music and Effects switches on the title screen and in
  the menu, both on, kept on the phone; the effects precached with the shell; world rules §9,
  _Sound_; and the register, `docs/sound.md`, each file's source, author, CC0 licence, and the
  command that cut and levelled it, held by a test.
- **52b — the music** (#56): Kevin MacLeod's _Desert City_ on the title screen and _Lamentation_
  on Look and Solve, each played through, rested a minute, and played again on the context's
  clock; a tap starts the music the screen asks for, a screen change fades the cue out over a
  second before the next is fetched, and the reveal is read in quiet, the bed fading under the
  close; each cue's address carries its file's hash and is kept on its first play; the credit line
  under the notice, the licence linked, with the register's test holding every CC BY file to it.

## v0.9.0 — Gate 09, the battle (#53)

- **53a — the battle** (#54): case four, Micaiah and the four hundred and the battle at Ramoth-gilead,
  1 Kings 22:1–40, after the vineyard; its one new idea a disguise — the king of Israel rides out
  without his marker, and the player names him by what the pictures show happening: the captains
  turning back from the man in robes, the bow drawn at no one, the chariot washed out at the pool
  of Samaria; three moments in order, thirteen spots, six blanks on the details people get wrong,
  and no paper — the faces' names come from people's words, the king's naming Micaiah and
  Micaiah's vision naming Ahab, as rule 6 now allows; the lesson on the disguised man's face
  (`teach: { face }`), with check (n) holding the face to the case; each moment's scene brief with
  its prompt as sent; world rules §4's marker rule excepting a disguise, and Jehoshaphat's deep
  blue.

## v0.8.1 — Ahab's circlet on the mountain (#50)

- **50a — the circlet retouched** (#51): on Baal's altar, Ahab wears his cast sheet's flat gold
  band with a central disc, retouched in place in the accepted picture — 621 pixels, nothing else
  moved — and fitted as before; his portrait re-cropped at the same square; the boxes unchanged
  and check (l) passing; the circlet's edit and retouch recorded in the scene briefs.

## v0.8.0 — Gate 08, the mountain (#30)

- **30a — the mountain** (#49): case two, the contest on Mount Carmel, 1 Kings 18:17–40, between
  the valley and the vineyard, which becomes case three; three moments put in the order they
  happened — Baal's altar at noon, the water, the fire — read from the sun, the altar, and the
  trench; fourteen spots, four blanks on the details people get wrong, and names from a person's
  tap as in the valley; the lesson, a first-encounter mark on the order's pictures and then its
  slots, with the validator's check (n); each moment's scene brief in `scenes.md`, written from
  its spots, with its prompt as sent, and a registry test holding every spot to its brief; world
  rules §6's _Describe, then generate_ in place of _Edits over regeneration_.

## v0.7.2 — A mark brings its target into view (#47)

- **47a — one scroll for both axes** (#48): a tutorial mark brings its target to the middle of
  its scroll box with one `scrollBy`, where two assignments, one per axis, let the second abort
  the first while the account glided; on a 360 × 640 phone, step 4's ring and words show on the
  sling's blank again, where since 07c they vanished with the blank below the account's view.

## v0.7.1 — A changed picture reaches the phone (#45)

- **45a — a picture's address carries its file's hash** (#46): each case picture requested at
  its path stamped `?v=<hash>`, a short hash of its file computed from `public/cases/` by
  `vite.config.ts`, so a changed picture is a new address the phone fetches after the update
  instead of the old picture under the new boxes, and an unchanged one keeps its address and its
  cached copy; the `cases` rule's pattern widened to match; a superseded copy left for the
  200-entry limit to evict; the first update to carry the stamp moves every address once, so a
  case played before it reads offline again after one online open.

## v0.7.0 — Gate 07, Look and Solve, and the marks (#24, #25)

- **07a — Look and Solve on one phone screen** (#41): the case screen fits the phone and never
  scrolls; a bar at the foot with the menu, Look, and Solve, Look carrying the case's found count
  and Solve the filled count and a badge for new words; the brief as a card over a fresh case's
  picture, and again in the menu; the caption docked under the picture with the finds right under
  it and More for a long one; the bank on Solve, the account scrolling with who is who and Papers
  held above it; the picker marking each moment with something left; the Zoom pill the one thing
  on the picture, counted by check (l).
- **07b — the tutorial shown where the player looks** (#42): each guided step shown at its
  target, a ring and a dim and eight words or fewer beside it, blocking nothing, the dim lifting
  on a tap elsewhere; the valley's four moves and Close the case as five steps, with Solve opened
  as a step of its own; a step already met never shown; the last step's words and dim leaving on
  the next tap while its ring stays; the banner and the Solve pulse gone; the validator's check
  (m), a step's words eight or fewer.
- **07c — the case screen fits the phone** (#43): the case screen pinned to the screen the phone
  shows instead of sized by `100dvh`, which on the owner's phone came out taller than the screen
  by the address bar; a mark scrolls only its target's own scroll box, never the page, and shows
  only where its target can be seen, its ring cut at the scroll box's edge; Close the case held at
  the account's foot, and a close's result in the bank's head beside a refused word's message.
- **07d — Close the case in its own row** (#44): Close the case docked between the account and
  the bank, outside the scroll, so it never moves and never covers the account.

## v0.6.0 — Gate 06, every spot owns a fingertip (#27)

- **27a — a fingertip for every spot** (#40): one rule for how a tap finds its spot, read by the
  player and the validator alike (`src/cases/spots.ts`); a tap on no box goes to the nearest spot
  within 16 CSS px, so boxes hug what they name and are never padded; the validator's check (l),
  every spot keeping a 44 px square of its own with the picture laid out 320 px wide, as on a
  360 phone, which holds the floor of a tenth of the width too; the bedchamber's seal, papyrus,
  and pouch boxes re-fit to it.

## v0.5.1 — The bedchamber's final picture (#28)

- **28a — the seal found, the coins gone** (#39): the bedchamber edited by the owner and fitted to
  900 × 1125, a large gold signet ring beside the woman's hand and its impression in red clay on
  the papyrus, the pouch closed on the table; the boxes re-measured, the seal's padded so a tap
  just off the ring or the clay still takes it and kept the smallest box it overlaps; the seal's,
  the pouch's, and the woman's captions for what the picture now shows; world rules §8's
  bedchamber line gone.

## v0.5.0 — Gate 05, case design (#26)

- **05a — a case is solved by looking** (#32): `docs/case-design.md`, the six rules a case is
  designed to, linked from the world rules and the case file format; the tutorial marks right
  only the slots its guided steps name and closes on Close the case, the same coarse check as
  every case; a moment's spots drawn largest first, so the smaller of two overlapping boxes takes
  the tap; the validator's two checks, a blank's kind with its answer and two rivals in the case
  and one name more than the faces; the valley and the vineyard rewritten to the rules, the
  valley's passages gaining 1 Samuel 17:4 and its headline blank aimed at 17:51.
- **05b — the giant's sword named** (#36): the valley's giant caption names the sheathed sword
  across his back, in the owner's words, so the evidence for the headline blank is findable
  before playtest 2 while the picture's edit waits (#34, #35).
- **05c — the sheath folded into the giant** (#38): the giant's tap finds his sword, the sheath
  spot and its caption gone, six spots in the valley; no tap highlight on the picture's spots, so
  a tap never draws a spot's box; the case design rules' note on a spot inside another's box
  (#37).

## v0.4.0 — Gate 04, ESV proxy (#3)

- **04a — the Worker, its tests, its deploy, the one table held** (#22): `worker/`, the ESV proxy
  as its own workspace — `src/index.ts`, the handler: a served origin, the two rate limits, a
  reference the table knows, the ESV's text endpoint asked for verse numbers and nothing else,
  the verses back as the contract has them, every other answer a status the app turns into the
  reveal's unreachable line; `src/passage.ts`, the reference, the ESV's URL, and the parse;
  `src/books.ts`, the one book table with its chapter counts, held against every registered
  case's passages by the registry test; `wrangler.jsonc`, the origins, the limits, no stored logs;
  `deploy-worker.yml`, the deploy from Actions on a merge that touches the Worker; CI's build job
  bundling it with a dry run; the token put in the Worker's store by hand, once.
- **04b — the app's side: the proxy read, the attribution, the cache** (#31):
  `src/passages/proxy.ts`, the passage service through the Worker, its reply checked against the
  contract and anything else a rejection, so the reveal shows its unreachable line; the stub and
  its line gone; the reveal marks each passage ESV and carries Crossway's notice and the link to
  www.esv.org in every state; a runtime cache rule keeping at most eight passages a month for
  offline; no test reaches the network.

## v0.3.0 — Gate 03, Player port (#6)

- **03a — the model and the passage service** (#19): `src/player/state.ts` — a case's progress
  and the moves on it, pure functions keyed by the structure's ids, a guided case stepping on and
  closing itself, a case without steps closing on the submit; `src/passages/service.ts`, the
  Worker's contract — a reference and a translation in, verses out — and `stub.ts`, the one line
  the reveal shows until #3; the validator's face/blank and word-once sentences.
- **03b — the case explored** (#20): the case cards on the title screen; `src/player/Player.tsx`,
  the case screen — the brief, Moments and Papers, the tutorial's banner — with `Stage.tsx`, the
  picture and its spots, `Bank.tsx`, the console and the word chips, and `Papers.tsx`, the
  documents opened and one over the screen; progress kept on the device, `storage.ts`, and the
  open case a history entry so the system's back returns to the cards (Gate 03 [1]); the runtime
  cache rule for the case pictures; the stylesheet for all of it, the bank's chips clear of the
  gesture zone ([6]).
- **03c — the case solved, and the reveal** (#21): `src/player/Think.tsx` — who is who, what
  happened first, the blocks with their blanks, a guided case marking each right answer and
  closing itself, the other case's submit and how far off it was; the Think tab with its count and
  its pulse; `sting.ts`, the three notes on the close; `Reveal.tsx` — the case in the game's words,
  then each passage as verses through the service, the stub's one line until #3, the reveal its
  own history entry so the system's back returns to the case (Gate 03 [1]); the stylesheet for
  Think and the reveal, the reveal's foot clear of the gesture zone ([6]).

## v0.2.1 — Governance revision 1 (#13)

- **the rule text of [G1]–[G6]** (#18): `CLAUDE.md` — [G1], [G4], and [G5] under Size in
  Conventions; [G2], [G3], and [G6] as the review loop in Review; [G3]'s refspec and mention rule
  with the lane rules — each in the words of its ruling; `AGENTS.md` and the README untouched,
  carrying none of the six today.

## v0.2.0 — Gate 02, Case file format (#4)

- **02a — the case file format and the first two cases** (#16): `src/cases/types.ts` — a case as
  two TypeScript files, the structure and one text file per language, the text's type computed
  from the structure so the typecheck holds its keys; `src/cases/index.ts`, the registry; the
  tutorial and case two from the prototype, text verbatim, with their pictures under
  `public/cases/`; `docs/case-file.md`, the format's reference.
- **02b — the validator** (#17): `src/cases/validate.ts` — the checks the types cannot make,
  A6's list over a case and one of its texts, one sentence per problem, run by the test job over
  every registered case; `src/cases/validate.test.ts`, one broken fixture per check; the
  validator's section of `docs/case-file.md` in the present tense.

## v0.1.0 — Gate 01, Foundation (#1)

- **01a — the scaffold, the quality gates, CI** (#11): Vite + React + TypeScript strict with Node
  24 pinned; ESLint, Prettier, Vitest with Testing Library and jsdom; `ci.yml` with `lint` (the
  conflict-marker scan first), `typecheck`, `test`, `build`.
- **01b — the PWA shell, the deploy, the placeholder screen, the rulebook** (#14):
  `vite-plugin-pwa` with the prompt register and the "Update available" toast, the manifest, the
  placeholder lamp icons and `scripts/generate-icons.ts`; `deploy.yml`, GitHub Pages by the
  Actions artifact flow on every push to `main`; the placeholder screen — the title, the epigraph
  and its notice, the two lines, the prototype's palette and type, every word from the keyed
  strings module `src/strings/en.ts`; `CLAUDE.md` and `AGENTS.md`, the README, this changelog,
  `scripts/review-threads.ts`.
- **01c — the tool-guard hook** (#15): `scripts/tool-guard.ts` and `.claude/settings.json`, ported
  from Vigil — a PreToolUse hook that blocks a push to `main`, a force push, and a dependency add,
  names the rule, and fails closed on anything it cannot judge.
