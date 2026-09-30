# The vineyard: the scene briefs

Each moment's picture is generated from its brief (`docs/world-rules.md` §6, _Describe, then
generate_). A brief is written from the moment's spots: for each spot, what it needs, how large it
reads, where it sits, and what stays clear of it. The generator can't place anything by percent,
so a generation prompt is §6's style header, verbatim, followed by the brief's _Scene_ and _Spots_
as prose, without ids or boxes. Each section below keeps its _Spots_ with the boxes fitted to the
accepted picture — left, top, width, and height, in percent, the ones `case.ts` holds, which the
registry test checks — and records the prompt as sent, with its attachments and edits, verbatim.

_The vineyard_ was made on 2026-09-29 in two generations, each in a new ChatGPT Images chat, and
one retouch in code, and accepted on the owner's review (#33, Gate 12). _Bedchamber_ and _The
gate_ came with the prototype (#16), drawn before the rule: their briefs are written from their
pictures as they stand, with their boxes as `case.ts` holds them, and neither picture changes
with the vineyard's. The vineyard's old picture stays the season's style reference, kept as
`style-reference-vineyard.jpg`, as it was for the valley, the mountain, and the battle.

**Every moment.**

- Portrait, 4:5, fitted to 900 × 1125.
- Nothing that matters sits in the outer 8% of the width on either side, where a phone's gestures
  live. In _The vineyard_ a box that meets an 8% line stops there, as the pouch's does in
  _Bedchamber_ (#27 [3]), and a tap on what runs past the line is left to the near-miss (#27 [2]).
- Nothing that matters sits in the top-left corner, 21% of the width by 11% of the height, where
  the Zoom pill sits.
- Every spot's thing reads at arm's length on a phone. It is at least a tenth of the picture's
  width on each side, and stands apart from the things around it.
- The order reads from the pictures alone: _Bedchamber_ at night, the letters being written and
  sealed; _The gate_ by day, the letter opened on the elders' bench and the stones heaped outside
  the city; _The vineyard_ in the late afternoon, after it is done: the stain and the dogs outside
  the town, the vines pulled up, and a note in the queen's hand. Only _The vineyard_ shows that
  the stoning has happened (Gate 12's A1).
- Violence is implied (§5): the stones before, at the gate, and the stain after, outside the town.
  There is no blood on anyone.
- There is no text or lettering anywhere. The seal's impression, the letter, the Law, and the note
  are the case's papers, read in the game's words, never in a picture.

## The cast

- **Ahab**: a deep wine-red robe with gold trim, a thin gold disc circlet, and a short dark beard
  (§4). In _The vineyard_ he is drawn from his cast sheet, `ahab-cast-sheet.png`, the one cut for
  the mountain.
- **Jezebel**: a teal robe with gold trim and a gold disc headdress (§4). She has no cast sheet,
  and her portrait is a head on black, so _Bedchamber_ carried her into _The vineyard_.
- **Elijah**: a cloak of animal hair with a leather belt, a wooden staff, and wild hair (§4). His
  sheet, `elijah.png`, was generated for the mountain from this case's old picture.
- **Naboth**, the case's own: a grey-bearded man in grey, the seated man at the gate.
- **The two scoundrels**: coarse tunics and plain headbands. **The elders**: head-cloths and
  striped mantles. **The people** of the city: plain cloth, headbands, and head coverings.
- **The servants** in _The vineyard_: plain undyed tunics (§2).
- **The dogs**: lean, short-coated, sandy-tan pariah dogs with upright pointed ears, as at the
  pool in case four, never a modern breed (§3).

## bedchamber — Bedchamber

**Scene.** Night in the king's bedchamber, one oil lamp warm against the blue of the night (§6).
At the upper left a window looks out under a full moon on a vineyard whose vines run right up to
the house. Below it the king lies on his bed with his face turned to the wall and his back to the
room, and on a stool beside the bed a tray of bread, figs, and a cup of wine sits untouched. At
the right the queen stands at a table, one hand beside a large gold signet ring. On the table lie
sheets of papyrus with a reed pen, a lump of red clay pressed with the ring on the papyrus's
corner, a closed leather pouch, and the lamp.

**Spots.**

- `window` [0, 0, 28, 25], upper left: the window and its frame, and through it a neighbor's
  vineyard at night, running right up to the wall of this house (21:1). Its box starts at the
  picture's corner, under the Zoom pill, and keeps a square of its own below it.
- `man-bed` [1, 25, 37, 19], left: the king on his bed, head to hip, his face turned to the wall
  and his back to the room (21:4), in his wine-red robe and gold circlet.
- `tray` [0, 50, 23, 11], left: bread, figs, and a cup of wine on a tray on the stool, untouched
  (21:4).
- `woman` [51, 4, 37, 47], right: the queen at the table, head to hands, in her teal robe and gold
  disc headdress (21:5–7).
- `seal` [61.5, 49.5, 15, 11], center right: her hand, the gold signet ring with a dark stone
  beside it, and the lump of red clay on the papyrus's corner carrying its impression (21:8). The
  box hugs the three (#27 [3]). It is the smallest box it overlaps, so it is drawn over the
  queen's and the papyrus's, which the registry test holds.
- `sheets` [46, 57, 36, 11], center: blank sheets of papyrus and a reed pen on the table (21:8).
- `purse` [78, 59, 14, 12], right: a leather pouch closed on the table, tied at the neck and heavy
  (21:2). Its box stops at the 92% line (#27 [3]).

At 320 the seal's, the papyrus's, and the tray's boxes are 44 px tall, and the pouch's is 44.8 px
wide: check (l)'s 44.

**What stays clear.** The window's frame, the king's robe, and the tray's plate reach into the left
8%, and their boxes with them. The pouch's far side and the lamp lie in the right 8%, outside the
pouch's box. There are no coins (§2): the silver is in the closed pouch. Nothing is written on the
ring, the clay, or the papyrus, and the window is unglazed.

**How it was made.** The prototype's picture as the owner edited it (#28, 28a): a large gold
signet ring with a dark stone beside her hand, its impression in red clay on the papyrus's corner,
and the pouch closed on the table, its coins gone. The edit, 1145 × 1374, was fitted to 900 × 1125
by trimming 33 px at the left and 12.8 at the right, and its boxes were re-fitted under check (l)
in 27a (#40). No prompt is on record for the picture or its edit.

## gate — The gate

**Scene.** By day, at the gate of Naboth's city. The gate stands across the top of the picture: two
crenellated towers of dressed stone and a heavy timber lintel, guards with spears on the walls,
and through the open gateway, outside the city, a heap of stones on open ground. Before it, on a
stone dais, a grey-bearded man sits in the chief seat, one hand at his chin. At the left two men in
coarse tunics face him, one pointing at him and one raising a hand as if to swear. At the right,
under a striped awning, the elders sit on their bench, one holding an opened letter, with an open
scroll on the bench and two empty chairs draped in purple before it. The people of the city fill
the foreground, seen from behind.

**Spots.**

- `crowd` [0, 58, 100, 42], the bottom band: the people of the city gathered at the gate, seen
  from behind, and nobody eating: the fast (21:12).
- `stones` [38, 12, 24, 22], top center: through the gateway, outside the city, a heap of stones on
  open ground (21:13), the stones before (§5). The box takes in the lintel and the whole opening.
  At its foot it runs over the seated man's head down to his nose, and being the smaller box it is
  drawn over his there.
- `seated` [36, 30, 26, 28], center: Naboth in the chief seat before the people (21:12), a
  grey-bearded man in grey on a stone dais, one hand at his chin. He does not look honored.
- `accusers` [3, 18, 33, 44], left: two scoundrels facing him, one pointing at him and one raising
  a hand as if to swear (21:13).
- `letter` [64, 27, 18, 26], right: the first elder on the bench, holding an opened letter, its red
  seal broken (21:8–10).
- `law` [80, 36, 20, 12], right: an open scroll on the elders' bench, the Law, whose sources are
  Deuteronomy and Leviticus, so the spot carries no cite. The scroll lies from 84% to 96% of the
  width, 2.6% of the height; its box takes in the elders' hands and the bench around it.

**What stays clear.** The two empty chairs are set dressing, not a spot, since no verse names them
(#26). The letter and the scroll carry faint marks and no letters that read. The picture came
before the edge rule: the left scoundrel stands partly in the left 8%, with the accusers' box
starting at 3%; the scroll runs into the right 8%, with its box to the edge; and the crowd spans
the width. A palm and a guard on the wall lie under the Zoom pill, as scene.

**How it was made.** The prototype's picture (#16), unchanged. No prompt is on record for it.

## vineyard — The vineyard

**Scene.** Late afternoon at Jezreel, in warm daylight, at the edge of the town beside the king's
palace. The vines have been pulled up and lie in heaps with their grapes across the foreground,
and the ground is laid out in straight garden beds with seedlings already in them. A low wall of
dressed stone runs along the vineyard's far side, across the picture. Past it at the upper left,
the bare ground outside the town rises in a slope under the sky. The palace stands at the upper
right, dressed stone with crenellated towers and a balcony, and no columns or capitals (§3). Ahab
walks the rows at the left, the servants lay out the beds at the center, Elijah stands at the
right with one hand raised at the king, and the queen watches from the balcony.

**Spots.**

- `man-rows` [8, 30.8, 31.5, 64], left foreground: King Ahab walking the rows with his hands behind
  his back, as if the ground were his (21:16), as on his cast sheet. The largest figure: the box
  runs from his hair to his sandals and out to his elbow. His sleeve reaches 7.6% of the width,
  and the box stops at the 8% line.
- `cord` [34.5, 41, 33.6, 25], center: two servants in plain undyed tunics laying out straight beds
  where the vines were pulled up (21:2), one kneeling to tie the cord to a stake and one raising a
  mallet to drive another. The box holds both servants, the mallet, and the cord out to the stake
  at the right where it is tied. It is smaller than Ahab's, so it is drawn over his where the two
  meet, at his elbow. The long line at the foot of the beds is the beds' edge, not the cord.
- `prophet` [71, 34.2, 21, 45.3], right: Elijah at the gap between the wall's pier and the palace,
  as on his cast sheet, one hand raised at the king (21:17–19). The box holds his figure from his
  hair to his sandals, to the 92% line; his raised hand and the top of his staff run outside it.
- `stain` [8, 17.1, 22.6, 11.6], upper left: past the vineyard's far wall, on the bare slope outside
  the town, two lean, short-coated, sandy-tan pariah dogs with upright pointed ears nose at a dark
  stain in the dust among scattered stones (21:13, 21:19). The stain is dark like dark earth, not
  red. The box runs from the 8% line to the right dog's tail, and from the tails' tips to the
  stain's lowest crumb: 72.3 × 46.4 px at 320, over check (l)'s 44. Only the left dog's rump and
  tail lie in the left 8%, as a dog's tail does at the pool in case four.
- `balcony` [76, 3.2, 16, 18.5], top right: Queen Jezebel on the palace balcony, as in
  _Bedchamber_, looking down at the vineyard with a small folded note in her hand (21:14). The box
  holds her and the plain stone parapet in front of her, across the balcony's opening, to the 92%
  line. The note's faint lines are fold creases, not writing.

**What stays clear.** The top-left corner is open sky, and the dogs and the stain begin at 17% of
the height, below the Zoom pill's 11%. The parapet is plain stone, with nothing hanging over it.
The sandal and the torn cloth of the old picture are gone, since the text doesn't give them (Gate
12's A1). Only Ahab's box and the cord's meet.

**The prompts as sent.** Attachments in both chats, in this order: `bedchamber.jpg`, the case's own
accepted scene, for style and for Jezebel as the case already shows her; `ahab-cast-sheet.png`;
and `elijah.png`. The bedchamber is a night interior, so the prompt's second paragraph says to
take only its style and Jezebel from it (the ruling's addition to A4). The old picture was left
out, so its dogs and their place weren't copied back.

v1, the prompt from Gate 12's mockup, as ruled:

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

Aspect ratio 4:5. The first attached image is a scene from this series, for style; the woman in teal in it is Queen Jezebel. The second and third are the character sheets of King Ahab and the prophet Elijah: the same people, in different poses. The first image is indoors at night: take only its style and Queen Jezebel from it. This scene is outdoors, in warm late-afternoon daylight.

A vineyard at Jezreel in the late afternoon, at the edge of the town, beside the king's palace. The palace, of dressed stone with a flat roof and plain square piers, with no columns and no capitals, stands at the upper right. The vineyard's vines have been pulled up and lie in heaps with their grapes, and its ground is being laid out as a vegetable garden. A low stone wall runs along its far side.

On the palace balcony at the upper right, Queen Jezebel, as in the first image, in her teal robe with gold trim and her gold disc headdress, holds a small folded note in her hand and looks down at the vineyard.

At the left, large in the foreground, King Ahab walks the rows with his hands behind his back as if the ground were his, in his deep wine-red robe with gold trim and his thin gold circlet with round discs, his short dark beard as on his sheet.

At the center, two servants in plain undyed tunics stretch a cord between stakes and drive a stake with a mallet, laying out straight garden beds where the vines were pulled up.

At the right, below the palace, the prophet Elijah stands at a gap in the vineyard's wall, as on his sheet: a cloak of animal hair with a leather belt, wild hair, and a wooden staff in one hand. His other hand is raised toward the king.

Up and back at the center, past the vineyard's far wall, where the town ends: open, bare ground outside the town, with a scatter of fist-sized stones, a dark stain in the dust among them, and two lean, short-coated, sandy-tan pariah dogs with upright pointed ears, the half-wild village dogs of the ancient Near East, not any modern breed, nosing at the stain. This place is plainly outside the vineyard and outside the town.

Composition: every person and thing named here is large, clearly separate from its neighbors, and easy to read on a phone screen. Keep them away from the far left and right edges, and leave the top-left corner as open sky. No text, letters, symbols, or banners anywhere, and none on the note. No blood on anyone.
```

What came back: Ahab, Elijah, Jezebel, and the servants matched their sheets and the brief; the
palace had square piers and no capitals; the top-left corner was sky; and the dogs and the stain
were in the right place, past the far wall on bare ground among scattered stones, as lean tan
pariah dogs, but small in the distance. Two things failed, so it was generated again rather than
edited (§6): the dogs and the stain were about 175 × 77 px of the 1122 × 1402 picture, about
50 × 22 px at 320, under check (l)'s 44 and §6's tenth of the width; and a red cloth with gold
fringe hung over the balcony's parapet, the banner the prompt ruled out.

v2, the v1 prompt with two paragraphs changed: Jezebel's gains "The balcony's parapet is plain
stone, with no cloth or hanging over it."; and the stain's is rewritten so the ground past the
wall rises in a slope that shows above it, with the dogs and the stain "large and clear, not small
in the distance".

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

Aspect ratio 4:5. The first attached image is a scene from this series, for style; the woman in teal in it is Queen Jezebel. The second and third are the character sheets of King Ahab and the prophet Elijah: the same people, in different poses. The first image is indoors at night: take only its style and Queen Jezebel from it. This scene is outdoors, in warm late-afternoon daylight.

A vineyard at Jezreel in the late afternoon, at the edge of the town, beside the king's palace. The palace, of dressed stone with a flat roof and plain square piers, with no columns and no capitals, stands at the upper right. The vineyard's vines have been pulled up and lie in heaps with their grapes, and its ground is being laid out as a vegetable garden. A low stone wall runs along its far side.

On the palace balcony at the upper right, Queen Jezebel, as in the first image, in her teal robe with gold trim and her gold disc headdress, holds a small folded note in her hand and looks down at the vineyard. The balcony's parapet is plain stone, with no cloth or hanging over it.

At the left, large in the foreground, King Ahab walks the rows with his hands behind his back as if the ground were his, in his deep wine-red robe with gold trim and his thin gold circlet with round discs, his short dark beard as on his sheet.

At the center, two servants in plain undyed tunics stretch a cord between stakes and drive a stake with a mallet, laying out straight garden beds where the vines were pulled up.

At the right, below the palace, the prophet Elijah stands at a gap in the vineyard's wall, as on his sheet: a cloak of animal hair with a leather belt, wild hair, and a wooden staff in one hand. His other hand is raised toward the king.

Up and back at the center, just past the vineyard's far wall, where the town ends, the bare ground outside the town rises in a gentle slope, so everything on it shows in full above the top of the wall. On that slope, close behind the wall: a scatter of fist-sized stones, a dark stain in the dust among them, and two lean, short-coated, sandy-tan pariah dogs with upright pointed ears, the half-wild village dogs of the ancient Near East, not any modern breed, nosing at the stain. The dogs and the stain are large and clear, not small in the distance: each dog is about half as tall as a standing man, and the two dogs with the stain between them fill about a third of the picture's width. This place is plainly outside the vineyard and outside the town.

Composition: every person and thing named here is large, clearly separate from its neighbors, and easy to read on a phone screen. Keep them away from the far left and right edges, and leave the top-left corner as open sky. No text, letters, symbols, or banners anywhere, and none on the note. No blood on anyone.
```

What came back passed but for one thing. The dogs and the stain stood past the far wall on an open
slope outside the town, but at the upper left, not the center: clear of the Zoom pill, with only
the left dog's rump and tail in the left 8%. One servant kneels to tie the cord and one raises a
mallet, and the beds have seedlings already in them. Elijah's staff runs into the right 8%, and his
figure stays inside it. The one thing short: hugged from the tails' tips to the stain's lowest
crumb, the dogs and the stain came to about 258 × 150 px of the picture, 67 × 43 px at 320 from
the 8% line, under check (l)'s 44 by a hair. #27 [2] rules out padding a box, so they were enlarged
in place rather than edited or generated again.

**The retouch, in code.** The dogs and the stain were scaled by 1.08 about (90, 402) of the
1122 × 1402 picture, the 8% line and the stain's lowest crumb, with bicubic sampling, so they grow
up and to the right over open slope, and nothing moves at the wall or further into the left 8%.
They were blended in through one feathered block from x 60 to 346, its top slanting from y 236 at
x 60 to y 250 at x 346 and its bottom at y 404. Its feathers: 12 px at the left; 10 px at the top,
shortening to 7 between x 260 and 300 under the hill's ridge, so the skyline stays v2's own; 6 px
at the right, clear of the bush there; and 4 px at the bottom, faded out by y 408, above the wall's
top at 410. 52,351 pixels changed, all inside x 49–351, y 227–407: the wall, the skyline, and every
figure are v2's own. The blend shows only at 3× on the full-size file. After it, the dogs and the
stain run from y 240 to 402 and out to x 343.8, 72.5 × 46.2 px at 320 from the 8% line. Accepted
as `vineyard.png` (SHA-256 `10340f23…`) and fitted to 900 × 1125 at quality 0.88, 0.4 px trimmed
at the right.

## The portraits

- `p1`, Ahab, and `p2`, Jezebel, are heads on black from the prototype, not crops from these
  pictures.
- `p3`, Naboth, is his face and his hand at his chin from _The gate_'s `seated`, with the heap of
  stones behind him: the 111 px square at 392, 309 of the 900 × 1125 picture, scaled to 144.

None of the three is cut from _The vineyard_, so none changes with it (Gate 12's A5).
