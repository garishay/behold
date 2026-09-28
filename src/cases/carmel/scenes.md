# Carmel: the scene briefs

Each moment's picture is generated from its brief (`docs/world-rules.md` §6, _Describe, then
generate_). A brief is written from the moment's spots: for each spot, what it needs, how large it
reads, where it sits, and what stays clear of it. The generator can't place anything by percent,
so a generation prompt is §6's style header, verbatim, followed by the brief's _Scene_ and _Spots_
as prose, without ids or boxes. Each section below keeps its _Spots_ with the boxes fitted to the
accepted picture — left, top, width, and height, in percent, the ones `case.ts` holds, which the
registry test checks — and records the prompt as sent, with its attachments and edits, verbatim.
The pictures were made on 2026-09-27 in one ChatGPT Images chat and accepted on the owner's review
(#30, the ruling on Gate 08). The style reference is the vineyard's accepted scene.

**Every moment.**

- Portrait, 4:5, fitted to 900 × 1125.
- The top of Mount Carmel: a broad, rocky shoulder of the mountain, with green scrub and oak above
  it and the brown plain far below.
- The sun is the order's clock: a small sun at the top center at noon; high in the west, at the
  upper right, in the afternoon; lower in the west but well above the horizon at the hour of the
  offering, which is mid-afternoon.
- Nothing that matters sits in the outer 8% of the width on either side, where a phone's gestures
  live.
- Nothing that matters sits in the top-left corner, 21% of the width by 11% of the height, where
  the Zoom pill sits.
- Every spot's thing reads at arm's length on a phone. It is at least a tenth of the picture's
  width on each side, and stands apart from the things around it.
- The LORD's altar, rebuilt and thrown down, is uncut stone (Exodus 20:25). The pictures draw it as
  rough-faced blocks, kept because they make twelve countable.
- The LORD is not shown in any form. Fire from heaven is fire. There is no blood. There is no text
  or lettering anywhere.

## The cast

- **Elijah**: a cloak of animal hair with a leather belt, a wooden staff, and wild hair (§4). His
  cast sheet, `elijah.png`, was generated for this case from the vineyard's scene and its prophet
  at the wall, by the prompt below.
- **Ahab**: a deep wine-red robe with gold trim, a thin gold disc circlet, and a short dark beard
  (§4). His sheet is cut from the season's cast sheet, which shows him with Jezebel, so that
  Jezebel can't appear on Carmel. It was not generated.
- **Baal's prophets**, the case's own marker, since the text gives none (§4): tall conical felt
  caps and long saffron-yellow robes, all alike.
- **The people of Israel**: men and women in plain undyed and earth-brown wool. The men are
  bearded, and the women wear head coverings.

**Elijah's cast sheet, the prompt as sent.** Attachments: the vineyard's scene, for style, and the
prophet at the wall cropped from it. Accepted as generated.

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

The first attached image is a scene from this series, for style. The second is Elijah the prophet as he appears in it.

Make a character sheet of Elijah: the same man, front view, full body, standing straight with his arms relaxed and a calm face, alone on a plain, flat, light background with no scenery and no shadows. Keep his look exactly: a shaggy cloak of animal hair in dark brown and cream, tied with a leather belt, with a leather strap across his chest; a tall, gnarled wooden staff in one hand; wild, shoulder-length dark hair and a full dark beard; leather sandals. A weathered, lean Levantine man. His face is fully visible and detailed. No text or labels.
```

## baal — Baal's altar

**Scene.** Noon. A small, bright sun stands at the top center, shadows are short, and the light is
hard and white. Baal's prophets circle their altar at center left, crying out to it. Elijah stands
apart at the right, calling out to them. Ahab watches from under an awning at the upper right. The
people stand silent on the slope in the foreground. The LORD's old altar lies thrown down at the
lower left.

**Spots.**

- `prophets` [2, 23, 65.5, 28], center left: about a dozen of Baal's prophets circle their altar,
  arms raised and mouths open, crying out. Their caps and robes read as one group. They hold no
  blades. The altar at the circle's center is a waist-high heap of fieldstones with wood stacked on
  it and a bull cut in pieces on the wood, with no fire and no smoke. None of the prophets stands
  between the altar and the viewer, so it shows plainly between their bodies.
- `mocker` [75, 21.5, 21, 30], right: Elijah on a rock, leaning on his staff, a hand cupped to his
  ear, grinning. A gap of open ground separates him from the prophets.
- `king` [67.5, 0, 32.5, 21], upper right: Ahab seated under a striped awning between two guards
  with spears. His robe and circlet read clearly, and his face is turned toward the viewer, large
  enough to crop a portrait (c2).
- `ruin` [2, 54, 44, 15], lower left: the LORD's old altar, thrown down, of uncut stone. Its bottom
  course still stands in a clear square, with its other stones tumbled around it and weeds between
  them. It reads as an altar built and thrown down, not as rubble or a ruined wall.
- `crowd` [2, 69.5, 96, 30], foreground: the people of Israel on the slope, standing with their
  arms folded or hanging, watching in silence. No one speaks or points.

**What stays clear.** The top-left corner of the sky. The open ground between the prophets and
Elijah. A band of open ground between the ruin and the crowd.

**The prompt as sent.** Attachments: the vineyard's scene, for style; Elijah's cast sheet; Ahab's
cast sheet; _The water_ after its edit, as a later moment on this mountain.

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

Aspect ratio 4:5. The first attached image is a scene from this series, for style. The second is Elijah's character sheet and the third is King Ahab's: the same people, in different poses. The fourth is a later moment on this mountain: keep the same place, the same people of Israel, and the same prophets of Baal and their altar.

The top of Mount Carmel: a broad, rocky shoulder of the mountain, with green scrub and oak trees above and the brown plain far below. Noon: the sun is straight overhead, above the top of the picture and out of frame, so every shadow is a small pool right under each person's feet, and the light is hard and white.

At center left, about a dozen of Baal's prophets, in tall conical felt caps and long saffron-yellow robes, all alike, circle their altar with arms raised and mouths open, crying out to it. They hold no blades. The altar is a waist-high heap of fieldstones with wood stacked on it and a bull cut in pieces on the wood, with no fire and no smoke. No prophet stands between the altar and the viewer, so it shows plainly between their bodies.

On the right, Elijah stands on a rock, leaning on his staff, one hand cupped at his mouth, calling out to them with a grin. A gap of open ground separates him from the prophets.

At the upper right, King Ahab sits under a striped awning between two guards with spears, watching. His wine-red robe and gold circlet read clearly, and his face is turned toward the viewer, large enough to crop a head-and-shoulders portrait.

At the lower left, an old altar lies thrown down: its rough fieldstones are scattered and half overgrown, but the outline of its square platform still shows, so it reads as a ruined altar, not as rubble.

In the foreground, the people of Israel stand on the slope in silence, arms folded or hanging, watching: men and women in plain undyed and earth-brown wool, the men bearded, the women in head coverings. No one speaks or points. Keep a band of open ground between them and the ruined altar.

Composition: every person and thing named here is large, clearly separate from its neighbors, and easy to read on a phone screen. Keep them away from the far left and right edges, and leave the top-left corner as open sky. No text, letters, symbols, or speech bubbles anywhere. No blood.
```

The first result had no sun, and its thrown-down altar read as loose rubble. **Edit 1**, the sun
and the ruin, sent to the first result:

```
Same picture, with only these two changes. First, add a small, bright white sun high in the sky at the top center. Second, turn the scattered stones at the lower left into a thrown-down altar: a small, solid, square altar of rough stones, about the size of the prophets' altar, broken down so that only its bottom course still stands in a clear square, with its other stones tumbled around it and weeds growing between them. It should read as a ruined altar, not as rubble or a ruined wall. Keep everything else exactly as it is, including Elijah's grin and his hand at his ear, the picture's shape, and its sharpness.
```

Accepted after this edit. Elijah came back with a hand cupped at his ear, not his mouth, and
grinning; his caption follows the picture. The ruin came back as a square of blocks about twice
the width of the prophets' altar, which reads as something built and thrown down. An earlier try
sent the two changes as two edits, one at a time; each redrew the whole picture, kept under half
its fine detail, lost Elijah's grin, and came back wider than 4:5, so it was discarded.

## water — The water

**Scene.** Early afternoon. The sun stands high in the west, at the upper right, and the daylight
is warm under a blue sky. Elijah's altar stands at the center, newly built, and four men pour water
over it from behind. Elijah directs them from the left. A trench full of water rings the altar.
The people have crowded close in the foreground. Across the ground at the right, Baal's prophets
sit worn out by their own cold altar.

**Spots.**

- `pourers` [27, 20, 45, 17], upper center: four men in plain tunics, each tipping a big clay jar
  of water over the altar from behind it. All four jars show, apart and countable, and they are
  the clearest things in that band.
- `altar` [25.5, 33.5, 51, 30.5], center: a low square altar of twelve large, rough, uncut stones,
  stacked in three rows of four and seen from the front, so every stone is separate and can be
  counted. Wood is laid on top, with the bull in pieces on the wood, and everything streams with
  water.
- `caller` [4, 14, 23, 43.5], left: Elijah facing the altar, his staff in one hand and three
  fingers raised on the other. His face shows, large enough to crop a portrait (c1).
- `trench` [8.5, 52.5, 85.5, 19], around the altar's foot: a trench dug in a ring, full to the brim,
  reflecting the sky. The water reads as water. The ring runs behind the altar, so its box is the
  larger and the altar is drawn over it.
- `spent` [74.5, 24, 24, 18], right: Baal's prophets, caps and saffron robes, sitting worn out
  beside their own altar. It is the heap from the first moment, still unburned, with its bull.
  They are small, but they read as the same men.

**What stays clear.** The fall of water between the jars and the altar's top. The trench's near
edge. The top-left corner of the sky. The people in the foreground stay below the trench.

**The prompt as sent.** Attachments: the vineyard's scene, for style; Elijah's cast sheet.

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

Aspect ratio 4:5. The first attached image is a scene from this series, for style. The second is Elijah's character sheet: the same person, in a different pose.

The top of Mount Carmel: a broad, rocky shoulder of the mountain, with green scrub and oak trees above and the brown plain far below. Late afternoon: the sun is low in the west at the right, long shadows fall to the left, and the light is warm.

In the center, a newly built altar: a low, square altar of exactly twelve large, rough, uncut stones, stacked in three rows of four and seen from the front, so every stone is separate and can be counted. Firewood is laid on top, with a bull cut in pieces on the wood, and everything streams with water.

Behind the altar, across the upper center, four men in plain tunics each tip one big clay jar of water over it. All four jars show, clearly apart and countable, and the water falls from the jars onto the altar in plain view.

On the left, Elijah faces the altar, his staff in one hand and three fingers clearly raised on the other. His face shows clearly, large enough to crop a head-and-shoulders portrait.

Around the altar's foot, a trench dug in a ring, full to the brim with water that reflects the sky.

On the right, across the open ground, Baal's prophets, in tall conical felt caps and long saffron-yellow robes, all alike, sit worn out beside their own altar: a waist-high heap of fieldstones with wood and a bull on it, unburned, with no fire. They are small but clearly one group.

In the foreground, below the trench, the people of Israel crowd close to watch: men and women in plain undyed and earth-brown wool, the men bearded, the women in head coverings.

Composition: every person and thing named here is large, clearly separate from its neighbors, and easy to read on a phone screen. Keep them away from the far left and right edges, and leave the top-left corner as open sky. No text, letters, symbols, or speech bubbles anywhere. No blood.
```

The first result put the sun at sunset, later than the hour of the offering. **Edit 1**, the sun:

```
Same picture, but make it early afternoon: move the sun up to the upper right, about halfway between overhead and the horizon, and make the light warm daylight with a blue sky instead of sunset gold. Keep everything else exactly as it is: the same people, the four jars, the twelve stones, the trench, and Elijah's three raised fingers.
```

Accepted after this edit.

## fire — The fire

**Scene.** The hour of the offering, mid-afternoon, a little later than _The water_. The sun is
lower in the west at the right, still well above the horizon, and the daylight is warm. A column
of fire falls from the sky onto Elijah's altar at the center, the brightest light in the picture.
Elijah stands at the left with his arms lifted. The people are down on their faces in the
foreground.

**Spots.**

- `fire` [31.5, 0, 40.5, 66], center: the column of fire falling onto the altar. It is fire only,
  with no figure, hand, or face in it (§5). The bull, the wood, and the stones themselves burn
  white-hot and crack, and the dust flares. The stones must visibly burn, not just the wood.
- `dry` [10, 57, 79, 14], around the altar's foot: the trench, now dry and cracked, with steam
  rising where the water was. Its box lies over the burning altar's bottom course, which the ring
  surrounds.
- `praying` [12, 24.5, 19.5, 33.5], left: Elijah near the altar, his arms lifted toward the sky.
- `faces` [3, 71, 94, 28], foreground: the people of Israel down on their faces, foreheads to the
  ground, many at once.

**What stays clear.** Nothing overlaps the column of fire. The top-left corner of the sky.

**The prompt as sent.** Attachments: the vineyard's scene, for style; Elijah's cast sheet; _The
water_ after its edit, as the moment just before. Accepted as generated.

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

Aspect ratio 4:5. The first attached image is a scene from this series, for style. The second is Elijah's character sheet: the same person, in a different pose. The third is the moment just before this one: keep the same place, the same altar of twelve stones, and the same people.

The same rocky shoulder of Mount Carmel, with green scrub and oak trees above and the brown plain far below. Mid-afternoon, a little later than the attached picture: the sun is lower in the western sky at the right but still well above the horizon, and the daylight is warm. The fire is the brightest light in the picture.

In the center, a column of fire falls from the sky onto the altar. It is fire only: no figure, face, hand, or shape of a person anywhere in the fire or the sky. The bull, the wood, and the altar's stones themselves burn white-hot and crack, and the dust around them flares. The stones must visibly burn, not just the wood. Nothing overlaps the column of fire.

Around the altar's foot, the trench is now dry and cracked, with steam rising where the water stood.

On the left, Elijah stands near the altar with both arms lifted toward the sky.

In the foreground, the people of Israel are down on their faces, foreheads to the ground, many at once: men and women in plain undyed and earth-brown wool.

Composition: every person and thing named here is large, clearly separate from its neighbors, and easy to read on a phone screen. Keep them away from the far left and right edges, and leave the top-left corner as open sky. No text, letters, symbols, or speech bubbles anywhere. No blood.
```

What came back that the prompt didn't ask for: the four men who poured the water stand near the
altar, and Baal's prophets still sit by their cold altar at the right. Both were kept, as scene,
not spots.

## The portraits

Each portrait is a 144 × 144 crop, head and shoulders, from the accepted picture at its full size
(1122 × 1402):

- `c1`, Elijah, from _The water_'s `caller`: the 120 px square at 112, 245.
- `c2`, Ahab, from _Baal's altar_'s `king`: the 96 px square at 912, 84.
