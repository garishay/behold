# Naaman and Gehazi: the scene briefs

Each moment's picture is generated from its brief (`docs/world-rules.md` §6, _Describe, then
generate_). A brief is written from the moment's spots: for each spot, what it needs, how large it
reads, where it sits, and what stays clear of it. A generation prompt is §6's style header,
verbatim, followed by the brief's _Scene_ and _Spots_ as prose, without ids or boxes. Each section
below keeps its _Spots_ with the boxes fitted to the accepted picture — left, top, width, and
height, in percent, the ones `case.ts` holds, which the registry test checks — and records its
prompts as sent, with their attachments and edits, verbatim. Naaman's sheet was made and accepted
on 2026-09-30, and the three scenes, _The gift_, _The road_, and _The house_, on 2026-10-12, each
in a new ChatGPT Images chat, and accepted on the owner's review (#66). The style reference is the
vineyard's first scene, `style-reference-vineyard.jpg`, as it was for the mountain's, the
battle's, and the room's.

**Every moment.**

- Portrait, 4:5, fitted to 900 × 1125: each accepted picture is 1122 × 1402, kept at full height,
  trimmed 0.4 px at the right to 4:5, and scaled.
- Nothing that matters sits in the outer 8% of the width on either side, where a phone's gestures
  live.
- Nothing that matters sits in the top-left corner, 21% of the width by 11% of the height, where
  the Zoom pill sits.
- Every spot's thing reads at arm's length on a phone. It is at least a tenth of the picture's
  width on each side, and stands apart from the things around it.
- The silver is the case's evidence, and its way runs through all three pictures: held out in
  heavy bags at the prophet's door and not taken (_The gift_); two bags on the shoulders of two of
  the commander's servants (_The road_), since two talents in two bags need two men (§2, 5:23);
  and hidden behind a curtain in the house (_The house_). The bags are the same each time: leather,
  tied at the neck.
- The earth goes into the mules' baskets at the prophet's door (_The gift_), and rides heaped on
  the two mules by the road (_The road_).
- The commander's skin is clean in both his pictures, which come after the seventh dip (5:14).
  He is known by his armor and his foreign beard (§4). The servant's skin is as it always was in
  _The gift_ and _The road_, and white as snow in _The house_ (§4, 5:27): an even white, with no
  sores and no blood (§5).
- One day's light, since the passage gives no hours and the three follow close on each other
  (5:19–25): late morning at the door and on the road, early afternoon in the house.
- The LORD is never depicted, and nobody glows (§5).
- There is no text or lettering anywhere.

## The cast

- **Elisha**: bald, in a plain undyed robe, with Elijah's cloak of hide, its cream patches, over
  his shoulders (§4). His sheet, `elisha.png`, was made for the room (#57) and is used as accepted
  there on 2026-09-30.
- **Gehazi**: Elisha's servant, a plain tunic and a leather satchel on a strap (§4); a young man,
  lightly bearded. His sheet, `gehazi.png`, was made for the room and is used as accepted. In _The
  house_ he is the sheet's man with his hands and face gone white.
- **Naaman**: an Aramean commander's armor and a foreign cut of beard (§4): a long coat of bronze
  scale armor to the knees over an ankle-length tunic of dull dark brown, the color of the battle's
  Syrian captains, so the season's Syrians match; and a long black beard cut square and set in rows
  of tight curls, as the Syrians wore it, unlike any Israelite's. He carries no sword and wears
  nothing red. His sheet, `naaman.png`, was accepted as v2 on 2026-09-30 (the note on #66), with
  his skin clean.
- **The commander's servants**, the case's own: short tunics of plain undyed wool, and beards cut
  square and curled like their master's, so they read as his men wherever they appear. Scene,
  except the two with the bags on the road and the two at the mules.
- **The driver**: one of the commander's men, at the horses. Scene.

**The cast sheet, as accepted.** `naaman.png` is v2, generated in a new chat with
`style-reference-vineyard.jpg` attached, and accepted on 2026-09-30 (the note on #66). v1, the
prompt as ruled, came back with its tunic in Ahab's wine-red, and with separate shoulder plates,
wrist guards, and a sword in a banded scabbard it read as a Roman soldier. Below is v2 as the note
records it: v1's words for the beard and the face, and v2's changes for the rest. The prompts as
sent, word for word, and the accepted file's hash are in the owner's `naaman prompts.md`.

Naaman (`naaman.png`), v2:

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

The attached image is a scene from this series, for style. Make a character sheet of Naaman, a Syrian army commander: front view, full body, standing straight, alone on a plain, flat, light background with no scenery and no shadows. A tall, broad-shouldered Syrian man of about forty-five. His long black beard is cut square at the bottom and set in neat rows of tight curls, in the Syrian fashion, and his black hair is bound back at the neck. He wears a long coat of bronze scale armor, small overlapping plates reaching to his knees, over an ankle-length wool tunic of dull dark brown, with a broad leather belt and leather sandals. He carries no sword and wears no wrist guards. No helmet. No red anywhere. His skin is clear and healthy. His face is fully visible and detailed, proud and grave. No crown or circlet, no chain mail, no turban. No text or labels.
```

## road — The road

**Scene.** Late morning on a dusty road a short way out of the town, its walls far behind on their
hill at the upper center. The commander's chariot has stopped at the upper right, its two horses
held by the driver beside them. The commander has stepped down into the road to meet the young man
who came running after him. The prophet's servant, out of breath, speaks with one hand held out.
In front, at the lower left, two of the commander's servants carry a heavy bag of silver each on
the shoulder, a folded change of clothes on top. By the road at the right, the two mules stand with
their baskets heaped with earth.

**Spots.**

- `runner` [8, 20, 28, 32], left: Gehazi as on his sheet, just arrived and out of breath, leaning
  forward with one hand held out as he speaks, his satchel on its strap. His face is large enough
  to crop a portrait (f2). His trailing foot runs into the edge zone; the box starts at its edge.
- `greeting` [36, 16, 27, 39], center: Naaman as on his sheet, standing in the road, down from his
  chariot, his hands open in greeting, with no sword.
- `chariot` [65, 19, 27, 23], upper right: a two-wheeled chariot and its pair of horses, stopped,
  the driver holding the reins. The chariot's footboard is empty. Its wheel runs into the edge
  zone; the box stops at its edge.
- `bags` [10, 52, 49, 42], lower left: two of the commander's servants side by side, each bent
  under a heavy leather bag tied at the neck and carried on his shoulder, a folded change of clothes
  on each bag. Two men, two bags (§2).
- `laden` [57, 46, 35, 32], lower right: the two mules, each with a pair of baskets heaped with
  brown earth. The far mule's basket runs into the edge zone; the box stops at its edge.

**What stays clear.** The top-left corner of the sky. No one rides a horse: the horses draw the
chariot. The prophet is not in this picture. Nothing is written on anything.

**The prompt as sent.** Accepted on 2026-10-12 (#66): `road.png`, 1,122 × 1,402, the second of
two generations from one prompt, SHA-256
`d746b2b8ec8445b0877b0fdcb3dafcd6b28f753201112ed211b2169c83e24769`. Attachments, in this order: `style-reference-vineyard.jpg`, for
style; `gehazi.png` and `naaman.png`; and `gift.png`, _The gift_ as accepted, for its bags, its
mules, and the commander's men. The prompt is the one drafted here, word for word, with one
sentence added to its composition paragraph: "Keep a clear margin on both sides: no person,
animal, or thing touches or crosses the left or right edge." The owner's note gives the sentence,
not its place in the paragraph; it is set at the paragraph's end.

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

Aspect ratio 4:5. The first attached image is a scene from this series, for style. The next two are the character sheets of Gehazi, a prophet's servant, and Naaman, a Syrian army commander: the same people, in different poses. The last is an earlier scene of this story: its leather bags, its mules and baskets, and the commander's men are the same here.

Late morning on a dusty road a short way out of a hilltop town, whose walls stand far off at the upper center. At the upper right, a two-wheeled chariot has stopped on the road, its pair of horses held by a driver with a square-cut curled beard.

At the center, Naaman, as on his sheet, has stepped down from the chariot and stands in the road, his hands open in greeting. He carries no sword.

On the left, Gehazi, as on his sheet, has just arrived running and is out of breath, leaning forward with one hand held out as he speaks, his satchel on its strap.

At the lower center, two of the commander's servants in plain short tunics, with square-cut curled beards, stand side by side, each bent under a heavy leather bag of silver tied at the neck and carried on his shoulder, with a folded change of clothes on top of each bag.

At the lower right, two mules stand by the road, each carrying a pair of baskets heaped with brown earth.

Composition: every person and thing named here is large, clearly separate from its neighbors, and easy to read on a phone screen. Keep them away from the far left and right edges, and leave the top-left corner as open sky. No one rides a horse. No text, letters, or symbols anywhere. No glow on anyone. Keep a clear margin on both sides: no person, animal, or thing touches or crosses the left or right edge.
```

What came back: the first ran the chariot's wheel and the right mule's basket off the right edge.
The second is accepted, with nothing touching either edge: Gehazi running in from the left with his
satchel, his hand held out; Naaman down in the road, his hands open and no sword; the chariot and
its pair at the upper right, held by the driver beside them; the two servants bent under their
bags, the clothes on top; and the two mules with their baskets of earth. The town's walls stand far
off at the upper center, and the top-left corner is sky.

## house — The house

**Scene.** Early afternoon inside the prophet's house at the hill: plain plastered walls, a
packed-earth floor, and daylight from the open door in the back wall. The prophet sits on a low
bench at the right. His servant stands before him at the center, turning to go, his hands and face
gone white as snow. At the left, behind a half-drawn curtain, the two bags of silver from the road
lie hidden with the two folded changes of clothes. Through the open door, the hillside falls away,
and on its path two of the commander's men are going away down it. A striped rug lies on the floor
at the lower right.

**Spots.**

- `alcove` [8, 22, 19, 45], left: a small storeroom behind a curtain half drawn, a jar on its
  shelf, and on its floor the two leather bags tied at the neck, the ones from the road, with two
  folded changes of clothes on them. The curtain runs into the edge zone; the box starts at its
  edge.
- `servant` [28, 24, 25, 61], center: Gehazi as on his sheet, standing before his master and
  turning to go, his hands and face an even white, plain at arm's length, with no sores and no
  blood. His satchel on its strap.
- `master` [57, 38, 35, 42], right: Elisha as on his sheet, seated on a low bench, his eyes on his
  servant, one hand raised toward him. Bald, the patched hide cloak on his shoulders. The bench's
  far end runs into the edge zone; the box stops at its edge.
- `door` [61, 13, 25, 30], upper right: the open door in the back wall, and through it the bright
  hillside path, with two of the commander's men, in plain short tunics and square-cut curled
  beards, walking away down it with empty hands. The box takes the doorway above the prophet's
  head.

**What stays clear.** The top-left corner. No one else is in the house. The bags are in the
storeroom, in no one's hands. Nothing is written on anything.

**The prompt as sent.** Accepted on 2026-10-12 (#66): `house.png`, the third generation, 1,122 ×
1,402, SHA-256 `d58bd93930bdb3490688639fba7564a63692f1f05e35290f78948e2cf0b6eefa`. Attachments, in this order: `style-reference-vineyard.jpg`, for style; `elisha.png` and
`gehazi.png`; and `road.png`, _The road_ as accepted, for its two bags and the commander's men. The
prompt is the one drafted here, word for word, with one sentence added to its composition
paragraph: "Keep a clear margin on both sides: no person, bag, or thing touches or crosses the left
or right edge." The owner's note gives the sentence, not its place in the paragraph; it is set at
the paragraph's end.

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

Aspect ratio 4:5. The first attached image is a scene from this series, for style. The next two are the character sheets of the prophet Elisha and his servant Gehazi: the same people, in different poses. The last is an earlier scene of this story: its two leather bags of silver and the commander's men are the same bags and men here.

Early afternoon inside a plain house: plastered mudbrick walls, a packed-earth floor, and daylight coming in through an open door in the back wall.

On the right, the prophet Elisha, as on his sheet, sits on a low wooden bench, looking hard at his servant, one hand raised toward him.

At the center, his servant Gehazi, as on his sheet, stands before him, turning to go. His hands and face have gone white as snow, an even chalk white, with no sores and no blood.

On the left, a curtain is half drawn across a small storeroom, and inside it, on the floor, lie two leather bags of silver tied at the neck, with two folded changes of clothes on top of them.

At the upper right, through the open door, a bright hillside path, and on it two men in plain short tunics, with square-cut curled beards, walking away down the hill with empty hands.

Composition: every person and thing named here is large, clearly separate from its neighbors, and easy to read on a phone screen. Keep them away from the far left and right edges, and leave the top-left corner clear. There is no one else in the house. No text, letters, or symbols anywhere. No glow on anyone. Keep a clear margin on both sides: no person, bag, or thing touches or crosses the left or right edge.
```

What came back: v1 put the curtain in the top-left corner and across the left edge, and ran
Elisha's bench off the right; v2 still ran the bench off the right. v3 is accepted, with nothing
touching either edge and the top-left corner plain wall. Gehazi stands at the center turning to go,
his hands and face an even white with no sores and no blood, his satchel on its strap. Elisha sits
on a low bench at the right, bald in the patched hide cloak, one hand raised toward him. At the
left, behind a half-drawn curtain, the storeroom holds the two bags tied at the neck with the
folded clothes on them, and through the open door at the upper right two men walk away down the
hillside path. The curtain is woven in a red and gold check. The owner's acceptance note asked
whether its crossing lines meet §3's "crosses in any form", and 66a's gate accepted it as woven
cloth, with no retouch (#66, A4).

## gift — The gift

**Scene.** Late morning in a street of the town, before the prophet's house: low, one-story
mudbrick, a flat roof that stops well below the top of the picture, and an open wooden door. The
prophet stands before his door with one hand raised, palm out. His servant stands in the doorway
behind him, watching the silver. The commander stands before the prophet, his skin clean, one hand
toward the gifts three of his servants hold out, a step apart and one gift each: silver in heavy
bags, gold, and folded fine clothes. Along the front, two mules, and the commander's men
filling the baskets on their backs with earth from a heap in the street. The commander's chariots
wait in the street behind.

**Spots.**

- `doorway` [8, 29, 14, 23], left: Gehazi as on his sheet, in the open doorway behind his master,
  his eyes on the silver, his mouth set. He stands at the zone's edge, and the box takes in the
  doorway's width, so it keeps a fingertip; its right edge lies over the prophet's cloak.
- `prophet` [19, 31, 18, 29], left of center: Elisha as on his sheet, standing before his door,
  one hand raised, palm out, against the gifts. Bald, the patched hide cloak on his shoulders.
- `commander` [41, 31, 18, 30], center: Naaman as on his sheet, his skin clean, one hand held out
  toward the gifts, urging, with no sword. His face is large enough to crop a portrait (f1).
- `gifts` [59, 35, 33, 29], right: three of the commander's servants, a step apart, each holding
  out one gift, no gift overlapping another: two heavy leather bags of silver tied at the neck; a
  bronze bowl heaped with gold rings and small gold bars; and a stack of folded fine clothes (§2:
  weighed metal, no coins). Each gift is about a tenth of the picture's width, the bags 9%, the
  bowl 10.5%, and the clothes 9.5%, so the three are one spot. The third servant's arm and the
  clothes run into the edge zone; the box stops at its edge.
- `mules` [8, 62, 84, 27], along the bottom: two mules with a pair of baskets each, and two of the
  commander's men shoveling brown earth into the baskets. The men stand at the sides, partly in the
  edge zones; the box stops at them.

**What stays clear.** The top-left corner of the sky. The gifts are held out, not given: the
prophet's hands are empty. The chariots in the street are scene. Nothing is written on anything.

**The prompts as sent.** Accepted on 2026-10-12 (#66): `gift.png`, the fourth generation, 1,122 ×
1,402, SHA-256 `a90344026de4cfbb8736703ab40e50e817a77302452e9aeff3d0f3faa0ab34f9`. Attachments in each chat, in this order: `style-reference-vineyard.jpg`, for style; then
`elisha.png`, `gehazi.png`, and `naaman.png`.

v1, the prompt drafted here, word for word:

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

Aspect ratio 4:5. The first attached image is a scene from this series, for style. The others are the character sheets of the prophet Elisha, his servant Gehazi, and Naaman, a Syrian army commander: the same people, in different poses.

Late morning in a street of a hilltop town, before a plain mudbrick house with a flat roof and an open wooden door. Behind, in the street at the right, two horse chariots wait.

Left of center, the prophet Elisha, as on his sheet, stands before his door with one hand raised, palm out, refusing.

On the left, in the open doorway behind him, his servant Gehazi, as on his sheet, watches the silver with a set mouth.

At the center right, Naaman, as on his sheet, his skin clean and healthy, stands before the prophet with one hand held out toward his gifts, urging him to take them. He carries no sword.

On the right, his servants in plain short tunics, with square-cut curled beards, hold out the gifts: heavy leather bags of silver tied at the neck, a bronze bowl heaped with gold rings and small gold bars, and a stack of folded fine clothes.

Along the bottom, two mules stand with a pair of baskets on each, and two of the commander's men shovel brown earth into the baskets.

Composition: every person and thing named here is large, clearly separate from its neighbors, and easy to read on a phone screen. Keep them away from the far left and right edges, and leave the top-left corner as open sky. The prophet's hands are empty. No coins. No text, letters, or symbols anywhere. No glow on anyone.
```

What came back: the house's roof filled the top-left corner; the gift-bearers, the clothes, a mule,
and both shovelers ran off the edges; and the three gifts were crowded together.

v4, from a revised prompt that changes three things in v1's, the rest word for word: the house is
"a low, one-story mudbrick house" whose "roof stops well below the top of the picture, so the
top-left corner is open sky"; three servants "stand a step apart, each holding out one gift so
that no gift overlaps another"; and the composition paragraph gains "Keep a clear margin on both
sides: no person, animal, or gift touches or crosses the left or right edge." The owner's note
gives that sentence, not its place in the paragraph; it is set at the paragraph's end. v2 and v3
are in the images folder too.

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

Aspect ratio 4:5. The first attached image is a scene from this series, for style. The others are the character sheets of the prophet Elisha, his servant Gehazi, and Naaman, a Syrian army commander: the same people, in different poses.

Late morning in a street of a hilltop town, before a low, one-story mudbrick house with a flat roof and an open wooden door. The roof stops well below the top of the picture, so the top-left corner is open sky. Behind, in the street at the right, two horse chariots wait.

Left of center, the prophet Elisha, as on his sheet, stands before his door with one hand raised, palm out, refusing.

On the left, in the open doorway behind him, his servant Gehazi, as on his sheet, watches the silver with a set mouth.

At the center right, Naaman, as on his sheet, his skin clean and healthy, stands before the prophet with one hand held out toward his gifts, urging him to take them. He carries no sword.

On the right, three of his servants in plain short tunics, with square-cut curled beards, stand a step apart, each holding out one gift so that no gift overlaps another: the first, heavy leather bags of silver tied at the neck; the second, a bronze bowl heaped with gold rings and small gold bars; the third, a stack of folded fine clothes.

Along the bottom, two mules stand with a pair of baskets on each, and two of the commander's men shovel brown earth into the baskets.

Composition: every person and thing named here is large, clearly separate from its neighbors, and easy to read on a phone screen. Keep them away from the far left and right edges, and leave the top-left corner as open sky. The prophet's hands are empty. No coins. No text, letters, or symbols anywhere. No glow on anyone. Keep a clear margin on both sides: no person, animal, or gift touches or crosses the left or right edge.
```

What came back is accepted. The low house stands at the left under open sky, with Gehazi in its
doorway, his satchel on its strap. Elisha stands before the door, bald in the patched hide cloak,
one hand raised palm out, his hands empty. Naaman stands at the center in his scale coat over the
dark brown tunic, with no sword, one hand held out toward the gifts. On the right, three servants
stand a step apart: one holds the bags of silver, one the bowl of gold, and one the folded clothes.
Along the bottom are the two mules with their baskets, and two men shoveling earth from a heap in
the street's foreground; the two chariots wait in the street behind. Everyone is drawn smaller than
in v1, since the scene is set farther back: the gifts, about a tenth of the width each, are too
small to tap one by one, so the three servants and their gifts are one spot, `gifts`, whose own
square is 105.6 px at 320 (the owner's note asked for the flag, #66).

## The portraits

Each portrait is a 144 × 144 crop, head and shoulders, from its accepted picture at full size
(1122 × 1402):

- `f1`, Naaman, from _The gift_'s `commander`: the 150 px square at 468, 428, with his curled
  black hair and beard, in profile, and the scale coat on his shoulders.
- `f2`, Gehazi, from _The road_'s `runner`: the 165 px square at 170, 252, with his hair, his face
  and light beard, and the satchel's strap on his shoulder.
