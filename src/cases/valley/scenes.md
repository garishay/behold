# The valley: the scene brief

The tutorial's one picture is generated from its brief (`docs/world-rules.md` §6, _Describe, then
generate_). The brief is written from the moment's spots: for each spot, what it needs, how large
it reads, where it sits, and what stays clear of it. The generation prompt is §6's style header,
verbatim, with the tutorial's period clause, followed by the brief's _Scene_ and _Spots_ as prose,
without ids or boxes. The _Spots_ keep the boxes fitted to the accepted picture — left, top, width,
and height, in percent, the ones `case.ts` holds, which the registry test checks — and the
prompts are recorded as sent, verbatim. The picture was made on 2026-09-28, in three generations,
each in a new ChatGPT Images chat, and accepted as generated on the owner's review (#35, Gate 11).
The style reference is the vineyard's accepted scene, as for the mountain and the battle.

**Every moment.**

- Portrait, 4:5, fitted to 900 × 1125.
- Nothing that matters sits in the outer 8% of the width on either side, where a phone's gestures
  live.
- Nothing that matters sits in the top-left corner, 21% of the width by 11% of the height, where
  the Zoom pill sits.
- Every spot's thing reads at arm's length on a phone. It is at least a tenth of the picture's
  width on each side, and stands apart from the things around it.
- The giant's own sword is the clearest sword in the picture: sheathed at his hip, with its hilt
  and round pommel showing (17:51). Nothing lies across his back, so 17:6's javelin is left out.
- Commoners wear plain cloth headbands, and the armor is bronze scale, never chain mail (§2, §3).
  No banners over the armies, and no helmet with a face guard or cheek pieces (§3's "nothing Greek
  or Roman").
- There is no text or lettering anywhere, and no blood.

**The camp's things, kept as evidence.** The text leaves the provisions with the keeper of the
baggage (17:22) and Saul's armor taken off before the boy went down (17:39). The tutorial's one
picture keeps both on the valley floor, the basket at the lower left and the heap at the lower
right, as the story's evidence, as it has since the prototype (Gate 11's A2, as amended at the
picture's acceptance on #35).

## valley — The valley

**Scene.** The valley of Elah at midday, just after the fight. A dry valley floor of pale earth
and scattered stones runs across the middle, with low brown hills on both sides, the Philistine
army small on the slope at the left and Israel's on the slope at the right. A shallow brook with
smooth stones in its clear water runs across the whole bottom. The giant lies face-down across the
middle, the boy standing over his head with his sling raised, the shield-bearer behind him at the
upper left.

**Spots.**

- `boy` [55.5, 4, 34, 52.5], right of center: a shepherd boy of about fifteen, beardless, in a
  plain undyed tunic and a plain cloth headband, a pouch at his hip, his sling raised high in one
  hand and his other hand open and empty. The brightest figure, and the tutorial's first tap. He
  stands astride the giant's head, as 17:51 has him a moment later, so his legs lie inside the
  giant's box; his upper body is his own.
- `giant` [0.5, 40, 80, 19.5], across the middle: face-down, in bronze scale armor and greaves,
  his head turned a little so his closed eye, brow, and beard show. His own sword lies sheathed
  along his hip; his spear lies below him, and his rounded bronze cap has rolled off by his head.
- `bearer` [6, 19, 25.5, 25], upper left: the shield-bearer, one tall oblong shield, a plain cloth
  headband, reaching toward the fallen man.
- `basket` [5.5, 64, 23.5, 11.5], lower left: a woven basket of round flat loaves and small white
  cheeses, on open ground between the spear and the brook. Its box is 46 px tall at 320 with its
  loaves, over check (l)'s 44.
- `armor` [47, 64.5, 51, 17.5], lower right: Saul's bronze scale armor in a heap on a red cloak,
  and his sword, shorter than the giant's, with no crossguard, half under it.
- `brook` [0, 83, 100, 17], the bottom band: smooth stones in the shallows.

**What stays clear.** The top-left corner is sky; the left army's spear tips just touch the Zoom
pill's lower edge, and they are scene, not a spot. The staff of 17:40 and Saul's helmet of 17:38
are left out, so no third long thing lies by the spear and the sword, and no second helmet by the
giant's.

**The prompts as sent.** One attachment in all three chats: `style-reference-vineyard.jpg`, the
vineyard's accepted scene, for style. Today's picture was left out, so its faults weren't copied.

v1, the prompt from Gate 11's mockup, as ruled:

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ancient Israel around 1000 BC: wool tunics, sandals, bronze armor. No crosses, nothing Greek or Roman.

Aspect ratio 4:5. The attached image is a scene from this series, for style only: none of its people or places appear here.

The valley of Elah at midday, just after the fight. A dry valley floor of pale earth and scattered stones runs across the middle of the picture, with low brown hills on both sides. Far off on the hills, small and distant, the Philistine army stands on the slope at the left and Israel's army on the slope at the right: rows of tiny figures with spears, and no flags, banners, or standards. A shallow brook with smooth, rounded stones in its clear water runs across the whole bottom of the picture.

On the right, standing, a shepherd boy of about fifteen with no beard, ruddy-faced, with short dark curly hair and a plain undyed cloth headband, in a plain undyed knee-length tunic with a leather belt, a leather shepherd's pouch at his hip, and sandals. He holds his sling high in one raised hand, its cords hanging, and his other hand is open and empty. He is the brightest, clearest figure in the picture, standing apart from everyone, his whole body in view.

Across the middle, lying face-down on the ground, the fallen giant: a huge man, far bigger than anyone else, in a coat of bronze scale armor of small overlapping plates and bronze greaves, with thick dark curly hair and a dark beard. His head lies toward the right, below the boy, turned a little toward the viewer with his eyes closed, so his brow and beard show. His bronze helmet has rolled off onto the ground beside his head. On his belt at his hip, his own sword lies in its sheath along the ground on the side facing the viewer: a large straight sword in a plain dark leather scabbard with bronze fittings, its plain hilt and round pommel clearly showing at his hip, easily the most obvious sword in the picture. Nothing lies across his back. His long, heavy spear lies on the ground beside him.

At the upper left, behind the giant, his shield-bearer, still on his feet: a soldier in a short tunic and a plain undyed cloth headband, with no gold anywhere, holding a tall oblong shield and reaching one hand toward the fallen man in alarm.

At the right, by the boy's feet, a woven basket of round flat loaves and small white cheeses.

At the lower right, between the giant and the brook, a king's armor set down in a heap on a red cloak: a coat of bronze scale armor of small overlapping plates, never chain mail, and a short straight sword in a plain scabbard with a plain round pommel and no crossguard, lying half under the armor, smaller and plainer than the giant's sword.

Composition: every person and thing named here is large, clearly separate from its neighbors, and easy to read on a phone screen. Keep them away from the far left and right edges, and leave the top-left corner as open sky. No text, letters, symbols, flags, or banners anywhere. No blood.
```

What came back: the giant's own sword read as a sword at his hip, and the boy, the headbands, the
scale armor, and the armies passed. Three things failed, so it was generated again rather than
edited: the basket sat almost wholly in the right 8%, about 19 px of it at 320 against check (l)'s
44; Saul's sword lay on top of the cloak and was about 15% longer than the giant's; and the
shield-bearer held two shields.

v2, the v1 prompt with four lines changed: the boy "Right of center"; the bearer "holding one tall
oblong shield, and only one, in one hand, and reaching the other hand"; the basket "Just to the
right of the boy's feet … well clear of the picture's right edge"; and Saul's sword "only half as
long as the giant's sword and half hidden under the armor".

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ancient Israel around 1000 BC: wool tunics, sandals, bronze armor. No crosses, nothing Greek or Roman.

Aspect ratio 4:5. The attached image is a scene from this series, for style only: none of its people or places appear here.

The valley of Elah at midday, just after the fight. A dry valley floor of pale earth and scattered stones runs across the middle of the picture, with low brown hills on both sides. Far off on the hills, small and distant, the Philistine army stands on the slope at the left and Israel's army on the slope at the right: rows of tiny figures with spears, and no flags, banners, or standards. A shallow brook with smooth, rounded stones in its clear water runs across the whole bottom of the picture.

Right of center, standing, a shepherd boy of about fifteen with no beard, ruddy-faced, with short dark curly hair and a plain undyed cloth headband, in a plain undyed knee-length tunic with a leather belt, a leather shepherd's pouch at his hip, and sandals. He holds his sling high in one raised hand, its cords hanging, and his other hand is open and empty. He is the brightest, clearest figure in the picture, standing apart from everyone, his whole body in view.

Across the middle, lying face-down on the ground, the fallen giant: a huge man, far bigger than anyone else, in a coat of bronze scale armor of small overlapping plates and bronze greaves, with thick dark curly hair and a dark beard. His head lies toward the right, below the boy, turned a little toward the viewer with his eyes closed, so his brow and beard show. His bronze helmet has rolled off onto the ground beside his head. On his belt at his hip, his own sword lies in its sheath along the ground on the side facing the viewer: a large straight sword in a plain dark leather scabbard with bronze fittings, its plain hilt and round pommel clearly showing at his hip, easily the most obvious sword in the picture. Nothing lies across his back. His long, heavy spear lies on the ground beside him.

At the upper left, behind the giant, his shield-bearer, still on his feet: a soldier in a short tunic and a plain undyed cloth headband, with no gold anywhere, holding one tall oblong shield, and only one, in one hand, and reaching the other hand toward the fallen man in alarm.

Just to the right of the boy's feet, a woven basket of round flat loaves and small white cheeses, well clear of the picture's right edge.

At the lower right, between the giant and the brook, a king's armor set down in a heap on a red cloak: a coat of bronze scale armor of small overlapping plates, never chain mail, and a short straight sword in a plain scabbard with a plain round pommel and no crossguard, only half as long as the giant's sword and half hidden under the armor.

Composition: every person and thing named here is large, clearly separate from its neighbors, and easy to read on a phone screen. Keep them away from the far left and right edges, and leave the top-left corner as open sky. No text, letters, symbols, flags, or banners anywhere. No blood.
```

What came back: one shield, and Saul's sword half hidden, with the giant's the clearest sword. Two
things failed, so it was generated again: the basket still sat in the right 8%, about 21 px of it
clear at 320; and the helmet came back Greek, with a face guard and cheek pieces.

v3, accepted as generated: the v2 prompt with two lines changed, the helmet "a plain, rounded
bronze cap, with no face guard, no cheek pieces, and no crest"; and the basket moved "At the lower
left, on open ground between the giant's spear and the brook … well clear of the picture's left
edge".

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ancient Israel around 1000 BC: wool tunics, sandals, bronze armor. No crosses, nothing Greek or Roman.

Aspect ratio 4:5. The attached image is a scene from this series, for style only: none of its people or places appear here.

The valley of Elah at midday, just after the fight. A dry valley floor of pale earth and scattered stones runs across the middle of the picture, with low brown hills on both sides. Far off on the hills, small and distant, the Philistine army stands on the slope at the left and Israel's army on the slope at the right: rows of tiny figures with spears, and no flags, banners, or standards. A shallow brook with smooth, rounded stones in its clear water runs across the whole bottom of the picture.

Right of center, standing, a shepherd boy of about fifteen with no beard, ruddy-faced, with short dark curly hair and a plain undyed cloth headband, in a plain undyed knee-length tunic with a leather belt, a leather shepherd's pouch at his hip, and sandals. He holds his sling high in one raised hand, its cords hanging, and his other hand is open and empty. He is the brightest, clearest figure in the picture, standing apart from everyone, his whole body in view.

Across the middle, lying face-down on the ground, the fallen giant: a huge man, far bigger than anyone else, in a coat of bronze scale armor of small overlapping plates and bronze greaves, with thick dark curly hair and a dark beard. His head lies toward the right, below the boy, turned a little toward the viewer with his eyes closed, so his brow and beard show. His helmet has rolled off onto the ground beside his head: a plain, rounded bronze cap, with no face guard, no cheek pieces, and no crest. On his belt at his hip, his own sword lies in its sheath along the ground on the side facing the viewer: a large straight sword in a plain dark leather scabbard with bronze fittings, its plain hilt and round pommel clearly showing at his hip, easily the most obvious sword in the picture. Nothing lies across his back. His long, heavy spear lies on the ground beside him.

At the upper left, behind the giant, his shield-bearer, still on his feet: a soldier in a short tunic and a plain undyed cloth headband, with no gold anywhere, holding one tall oblong shield, and only one, in one hand, and reaching the other hand toward the fallen man in alarm.

At the lower left, on open ground between the giant's spear and the brook, a woven basket of round flat loaves and small white cheeses, well clear of the picture's left edge.

At the lower right, between the giant and the brook, a king's armor set down in a heap on a red cloak: a coat of bronze scale armor of small overlapping plates, never chain mail, and a short straight sword in a plain scabbard with a plain round pommel and no crossguard, only half as long as the giant's sword and half hidden under the armor.

Composition: every person and thing named here is large, clearly separate from its neighbors, and easy to read on a phone screen. Keep them away from the far left and right edges, and leave the top-left corner as open sky. No text, letters, symbols, flags, or banners anywhere. No blood.
```

What came back that the prompt didn't ask for: the boy stands over the giant's head, his legs on
either side of it, as 17:51 has him a moment later; and the basket lies at the lower left, not
beside the boy. Both stand as generated.

## The portraits

- `d1.jpg`: the boy's face and headband, a 132 px square at 790, 122 of the accepted 1122 × 1402
  picture, scaled to 144.
- `d2.jpg`: the giant's face, eyes closed, brow and beard, a 100 px square at 766, 648, cropped
  tight between the boy's shins, scaled to 144.
