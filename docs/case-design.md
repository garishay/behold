# Case design

What makes a case a puzzle. The world rules (`docs/world-rules.md`) are what a case must be true
to; this page is what a player must do to solve it. Read both before writing a case. The format
a case is written in is `docs/case-file.md`.

Behold's promise is on the title screen: _Look closer. There's more to every story._ A case
works when the cheapest way through it is to look — at the picture, at its captions, at its
papers — and the details a player did not know are what the looking turns up. Playtest 1 (#23)
found the opposite: players tapped every spot without reading and filled the blanks from the
words they had collected, because the blanks fell to grammar and to the kind a blank takes. The
rules below are the answer, ruled on #26.

## The rules

1. **Looking is cheaper than guessing.** Every blank has at least two plausible rivals of its own
   kind in the bank, so no blank falls to its sentence or to the kind filter. Every rival is
   itself named or implied by the case's passages (_The text decides_), and so is every answer:
   the reveal shows the text that settles the account. A face has a rival too: the case holds at
   least one more name than it has faces, since a last face filled by elimination is a blank with
   one candidate.

2. **A caption describes; it does not conclude.** It says what is seen and leaves the inference
   to the player: the seal is under the woman's hand, and the caption does not say whose hand
   used it. A paper is a document in the scene: it may show part of the document, but it marks
   what it leaves out. The same holds for the brief: it poses the case's questions and answers
   none of them.

3. **A blank aims at the detail people get wrong, not the part they know.** Everyone knows the
   giant fell; few remember whose sword took his head (1 Samuel 17:51). A blank on the part
   everyone knows teaches nothing; a blank on the detail is where the passage surprises.

4. **Guessing first is allowed, and is the hook.** A player who knows the story may fill the
   account from memory once a quick sweep has stocked the bank. When the check says several are
   wrong, they go back to the picture with a question. That return trip is the loop the game is
   built on, and the Playtests Issue's second criterion watches for it.

5. **The check is coarse.** Close the case says how many are wrong — one or two, or several —
   never which. The tutorial marks an answer right only on the slots its guided steps name; when
   those steps are done, Close the case appears, the last step points at it, and the tutorial
   closes on the same check as every case. The first case teaches the real check. One guided step
   is an inference: it rings the sword's blank, not its word, and asks whose sword it was, so the
   tutorial shows an answer worked out from what is seen, the way rule 2 leaves every other (#77).

6. **One new idea per case.** A case adds one thing the player has not done before, and names it
   in its brief to the author. The valley, then season one's first rungs:

   | case         | what it adds                                                 |
   | ------------ | ------------------------------------------------------------ |
   | the valley   | tap, name, fill, work one answer out, close — guided         |
   | the mountain | several moments, and the order they happened in              |
   | the vineyard | papers, and names worked out by cross-reference              |
   | the battle   | a disguise: a face without its marker, named by what happens |

   The mountain marks its one idea the first time the player meets it: the pictures to place,
   then the slots they go in (`teach`, #30). The battle marks its own at the disguised man's face,
   until the player names him (#53). In the valley and on the mountain a person's tap gives
   their name; from the vineyard on, the names the faces need come from something that bears
   them — a seal, a letter, a note, or another person's words — and the player works out whose
   each one is.

   The season plays in order: each case opens when the one before it is closed, and a case the
   player has already started stays open (#75). The valley teaches the game; the cases after it
   are one story as well as a ladder, so a payoff never comes before its setup.

## What holds a case to them

**The validator** (`src/cases/validate.ts`, run by the test job over every registered case) holds
the counts of rule 1: a blank's kind has at least three words in the case — its answer and two
rivals — and the case has one name more than it has faces. Each fails in CI with one sentence,
`blank "t3" takes a "number" word, and the case has 2, not three`. It holds too that a case's
pictures are never shown in the order they happened, so the order as shown is never the answer
(#77). The authoring tool (#5) inherits them.

**Review, by reading**, holds the rest, with the accuracy table as its handle — every sentence of
the account and the reveal, every caption, and every paper against its verse, citing by
reference, with anything the passage does not say marked:

- that a rival is _plausible_: it fits the sentence, and a player who has not looked could
  believe it (rule 1);
- that an answer and every rival is named or implied by the case's passages (rule 1);
- that a caption, a paper, and the brief describe and do not conclude (rule 2);
- that the blanks are aimed at details, not the parts everyone knows (rule 3);
- that the case adds one idea, and its brief to the author names it (rule 6);
- that each face's and blank's evidence, the spot a hint sends a stuck player to, is the one whose
  caption or paper settles it, and each moment's is the one that tells when it happened (#29). A
  hint points at evidence and never gives the word, so a wrong evidence spot is a wrong clue.

## Writing a case to them

1. Read the passage through, and list what people get wrong about it. Those are the blanks.
2. For each blank, find its answer and two rivals in the passage, and make sure the pictures give
   a spot that yields each. A passage that names only one number can't give a number blank its
   two rivals, so it has no number blank. A blank a rival would make just as true — _killed_
   where the passage says _stoned_ — marks a true answer wrong; that detail stays in the prose.
   Don't put a spot inside another spot's box unless the smaller thing reads clearly on its own.
3. Write each caption as what is seen, with the passage's detail in it. The player reads the
   caption to fill the blank; the caption does not draw the inference for them.
4. Write the brief as the case's questions.
5. Fill the account from memory, as a player would. Every blank a guess gets right is a blank
   aimed at the wrong detail.
6. Run the validator, then write the accuracy table.

## What this revision does not change

A tap still hands over its words; picking words out of the caption is the next experiment, run
only if the loop check fails (#26 [3]). No word sits in the bank before its tap (#26 [2]). Where
the brief is shown, the layout (#24) decides; what it says, this page does.
