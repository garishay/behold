# The title picture

The title screen's picture (#75, Gate 21): the hill country of ancient Israel in clear morning
light, seen from a hilltop, with a moment from each of the first four cases tucked into the land
and the near hillside left plain for the title and Begin. It is not a scene. No case holds it and
nothing in it is tapped, so it has no brief and no boxes, but it is held to the world rules' §2–§6
as a scene is, but for its shape: a tall portrait, not 4:5.

The picture, `public/title.jpg`: 896 × 1,672, a JPEG at quality 90, SHA-256 `41496ac78e952c0825ee5322a44d1da1f28cbb9149fca990c684623e1cc34121`.

The retouch script, `docs/title-retouch.py`, beside this record: SHA-256 `5c8915e5d697a049271dae25b36ab26d0f3785d886edbca37a65f473672e3255`.

A test holds both files to the hashes above, so neither changes without this record.

## Where it shows

The title fills the column's width with 4 px of bleed at each side and sits at the top, so its
sides are never cropped, and its lower part fades into `--night` by 70% of the screen's height,
under "Behold", the line, and Begin. It is requested at `title.jpg?v=<hash>`, stamped with the
first eight hex digits of its SHA-256 as a case picture is (`docs/case-file.md`, _Pictures_), and
the service worker keeps it by that address under the case pictures' rule. It is requested again
once the worker is ready, so a phone that opened the title once shows it offline.

## How it was made

It was generated in a new ChatGPT Images chat on 2026-10-03 from the prompt below, sent as drafted
with no edits, and then retouched in code rather than edited in ChatGPT or regenerated. It was
accepted on the owner's review the same day. Every version is in the owner's images folder, beside
the record this page is brought from, `title prompts.md`.

The prompt's first paragraph is world rules §6's style header, verbatim.

An earlier direction the same evening, a tall version of the store's night-table graphic, was
generated and set aside: the owner wanted the title brighter, and not tied to one case, since the
title outlives season one.

### Attachments used

- `valley.jpg`: the valley's picture, `public/cases/valley/valley.jpg` on `main` at `762e380`
  (SHA-256 `9c5a5ac12098d209a28f10950732d5c63a31280752e3440b779773ef4a337a66`), for style and
  daylight only. It was the only attachment.

### The prompt as sent: `title-v1.png`

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Portrait orientation. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

Tall portrait, aspect ratio 9:16. The attached image is a scene from this series: take only its style, its colors, and its clear daylight from it, and none of its people or its place.

The title picture for a Bible mystery game about looking closer at the Bible's stories. A bright, colorful, inviting view in clear morning light, seen from a hilltop: the hill country of ancient Israel under a big blue sky with a few white clouds, with green and gold terraced hills, olive groves, a brook winding through the valley, a road, and a walled hilltop town of flat-roofed stone and mudbrick houses, its gate topped with a flat timber lintel. Tucked into the landscape, small but clear enough to pick out on a phone, are moments from the game's stories for a player to find: by the brook, a shepherd boy kneeling to choose smooth stones, a sling at his belt; far off on a green mountain, a thin column of smoke rising from a stone altar; at the edge of the town, a vineyard behind a low stone wall beside a palace of dressed stone with a flat roof and no columns; on the road, a chariot drawn by two horses. Everyday life fills the rest: a shepherd with his flock, a woman carrying a water jar on her shoulder, a donkey with a load.

Composition: the sky fills the top quarter. The land and its small moments sit between about a quarter and three-fifths of the way down, every moment well away from the left and right edges, because a phone crops the sides. The bottom 40% is the near hillside where the viewer stands, in soft, cool shadow, plain and calm with nothing in it, darkening toward the bottom edge, because the game's title and a button will sit there. Bright and warm, but for adults: no cartoon faces, nothing cute or childish. No text, letters, symbols, or banners anywhere.
```

It came back 941 × 1672 (9:16), 24-bit RGB, saved as `title-v1.png` (SHA-256
`bbaeb99a5ccc4564c5a9cd1f7b304af690dcafd3163ab2501c2146d3fd811828`). It passed:

- **The style:** the series' look and its clear daylight.
- **The four moments, one from each case:** the boy choosing stones at the brook, with a
  shepherd's bag at his side (1 Samuel 17:40), for the valley; smoke rising from a stone altar on
  the far hill, for the mountain; the vineyard behind its wall beside the palace, for the
  vineyard; the chariot and its two horses on the road, for the battle.
- **Everyday life:** the shepherd with his flock, the woman with the water jar on her shoulder,
  the donkey with its baskets, two men in the gate.
- **The town:** flat roofs, dressed stone, and the gate under a flat timber lintel.
- **No text anywhere,** no crosses, and no columns or capitals.
- **The composition:** the sky in the top quarter, the land between about a quarter and
  three-fifths of the way down, and the bottom 40% a plain shaded hillside for the title.

Four faults, each a few pixels at phone size, so they were fixed in code: small arched doors and
windows in the town (§3, arches); a pointed stone tower in front of the citadel's lower wall and
a small gold spire against the far hills (§2, flat roofs); and a domed tower with a spire at the
far right edge.

### The retouch in code: `title.png`

`title-retouch.py`, run with Python, Pillow 12.3.0, NumPy 2.5.3 and OpenCV 5.0.0 in the folder
holding `title-v1.png`, makes `title.png` and `title.jpg`. It is kept here as the record of the
edit; nothing in the repository runs it. It changes 626 pixels, all within x 695–895 and
y 268–324, and trims the right edge:

1. **Eight arched openings squared.** In each box, the opening's rounded shoulders are filled
   with its own colour, so its top is flat: (744, 298)–(753, 312), (857, 284)–(862, 298),
   (889, 277)–(895, 297), (847, 323)–(853, 336), (730, 270)–(736, 289), (761, 266)–(768, 284),
   (748, 267)–(753, 287), and (780, 262)–(785, 277).
2. **The pointed tower,** (765, 280)–(779, 309): the wall 40 px to its left is cloned over it,
   and the bushes in front of it are kept.
3. **The gold spire,** (696, 276)–(712, 290): painted out from its surroundings (OpenCV's TELEA
   inpainting, radius 4).
4. **The right edge trimmed,** with the domed tower: columns 896–940 removed, 941 × 1672 to
   896 × 1672.

### The accepted files

- `title.png`: the accepted picture, 896 × 1672, 24-bit RGB, SHA-256
  `20ce2a59769d72d863718b299bc653d09ef3fc6f66ba2a34971ebed02e157eb8`. It stays in the owner's
  folder.
- `title.jpg`: the same picture as a JPEG, quality 90, 896 × 1672, SHA-256
  `41496ac78e952c0825ee5322a44d1da1f28cbb9149fca990c684623e1cc34121`. This is the file the
  repository commits, as `public/title.jpg`.

Copying the two files to the owner's folder added a content-credentials chunk to each, as it did
for the feature graphic, so these are the folder copies' hashes; their pixels are unchanged. As
the script writes them, before the chunk, they hash
`584eeb6e9806d89cc5d592d45d2f80b368a5962a88c5f26f93db88323f6c4751` and
`d6c7a40709c6330e4d9cf7feed88ccce6af1a7b17471bffd06e56508b41719a1`.
