# The icon

Behold's icon (#10, Gate 18): a scroll unrolled between two wooden rollers, a magnifying glass
over it, and under the glass, in the middle row of the writing, one word missing, a gold blank
waiting to be filled. It is the game's sign, not a scene. The lens and the two-roller scroll are
both later than Ahab's day, and the owner accepted them as such: the world rules govern the scenes
and the cases, not the icon.

The master, `assets/icon.png`: 1,254 × 1,254, 24-bit RGB, SHA-256 `08b2c28c37ea86c35fc828507f51261fbdce85eb5c93b83aeb27e442bff05718`.

`scripts/generate-icons.ts` (`npm run icons`) frames it for each use and writes the files in
`public/icons/`. Its test holds every file to the master and the master to the hash above, so
neither changes without this record.

## The files

Each file is the master on `#1B2033`, the manifest's background colour, to every edge, centred on
the art's box (x 53–1199, y 146–1129 of the master), each pixel the average of the master's pixels
it covers. The master's outer 40 px, where nothing is more than 5 levels off `#1B2033`, fade to it
exactly, so no edge of the master shows; the art is 53 px in at its nearest. Every file is a 32-bit
PNG.

| file                    | size | the art's share of the width | where it shows                                                    |
| ----------------------- | ---- | ---------------------------- | ----------------------------------------------------------------- |
| `icon-512.png`          | 512  | 75%                          | the manifest's `any` icon; the store's icon                       |
| `icon-1024.png`         | 1024 | 75%                          | the manifest's largest `any` icon; Bubblewrap's splash, at 300 dp |
| `icon-192.png`          | 192  | 75%                          | the manifest's `any` icon; the page's `apple-touch-icon`          |
| `icon-512-maskable.png` | 512  | 59.3%                        | the launcher                                                      |
| `favicon-48.png`        | 48   | 90%                          | a browser's tab, at 16 px                                         |

- **75%** is the framing the owner approved and ruled (Gate 18, issuecomment-5932066607): the
  master at 82%, the art at 75% of the width.
- **The splash.** Bubblewrap draws it at 300 dp from the largest `any` icon, 900 px at xxhdpi and
  1,200 at xxxhdpi, so the 1024 gives it the art rather than the 512 enlarged (the ruling's fifth
  file). The 512 stays the store's icon.
- **The launcher.** Bubblewrap lays the maskable image over 91 dp of the launcher's 108 dp icon and
  shows the middle 72 dp, so 75% × 72 / 91 shows the store's framing there. Every pixel of the art
  then lies inside the 66 dp circle no launcher's mask clips.
- **The favicon** is drawn unmasked at 16 px, so the art fills it.
- **What a first visit downloads.** The service worker precaches the two icons the game's page
  links, the favicon and the 192. The manifest's 512s and 1024 are read when the app is installed, never
  offline, so they aren't precached.

## How it was made

Each picture was generated in a new ChatGPT Images chat on 2026-09-30, from a prompt the owner
pasted. The prompts are quoted verbatim. Two rounds came first, neither generated: the lamp drawn
in code for Gate 18's first draft, and two rounds of shapes sketched in the advisor's chat. The
owner set the lamp aside, because it says neither mystery nor Scripture.

The first paragraph of every prompt is world rules §6's style header, with "Square." in place of
"Portrait orientation." (§6, as Gate 18 rules it).

### 1. The first sheet

Attached: `style-reference-vineyard.jpg`, the season's style reference.

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Square. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

The attached image is a scene from this series, for style. Make a sheet of six different app icon designs for this game, three across and two down, each a rounded square of the same size with space around it, on a plain light background. The game is Behold, a Bible mystery game. Each case is a story from the Old Testament, told in pictures: the player studies the pictures like a detective, works out who is who and what happened, and fills in the missing words of the account before the Bible passage itself is revealed. Each icon should say two things at once: there is a mystery here to solve, and it is about Scripture and understanding God's word. Make the six as different from each other as you can, in idea and in composition. Each has one main subject, drawn large in bold, simple shapes on a deep night-blue ground (#1B2033), so it still reads at the size of a fingertip. No crosses, doves, halos, candles, or oil lamps; no coins and no pointed arches; no question marks, letters, or words; and no labels under the icons.
```

It came back with six small scenes rather than icons: an open scroll with a broken clay seal, broken
stone tablets, a man's eyes over a scroll, footprints leading to a scroll, a jar holding a scroll,
and hands untying a scroll. At home-screen size only the eyes and the jar still read. The broken
seal became a red coin when small, and its sparkle came close to a cross; the tablets are Moses's,
not this season's; and the man over the scroll wore a head cloth that reads as a modern keffiyeh.

### 2. The second sheet

Attached: `style-reference-vineyard.jpg`. The prompt asked for icons rather than scenes, and ruled
out everything the first sheet had tried.

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Square. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

The attached image is a scene from this series, for style. Make a sheet of six new app icon designs for this game, three across and two down, each a rounded square of the same size with space around it, on a plain light background. The game is Behold, a Bible mystery game: each case is an Old Testament story told in pictures, and the player studies them like a detective, works out who is who and what happened, and fills in the missing words of the account before the Bible passage itself is revealed. Each icon should say at a glance: a mystery to solve, about Scripture. Design them as app icons, not scenes: one bold object or emblem, centered and large, on a plain deep night-blue ground (#1B2033), with no scenery, no hands, and no more than four colors besides the ground, so each still reads at the size of a fingertip. Make the six as different from each other as you can, and use none of these, which have been tried: an oil lamp or candle, a clay jar, stone tablets, footprints, a broken seal, hands untying a scroll, or a face peering over a scroll. No crosses, doves, halos, coins, pointed arches, question marks, letters, or words, and no labels.
```

It came back with six single objects: a scroll on two rollers under a magnifying glass, a rolled
scroll with a padlock, a sling with its stone, a ram's horn, a crown, and an eye made of four
scroll ends. The owner chose the scroll with the lens, the clearest of the twelve at home-screen
size: the two rollers, the ring, and the handle make a shape you can name at a glance.

### 3. The icon

Attached: the second sheet, alone.

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Square. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

The attached image is a sheet of app icon designs for this game, Behold, a Bible mystery game. Make the top-left design, the scroll with the magnifying glass, into one finished app icon that fills the whole square image. Keep its look: a parchment scroll unrolled across the middle between two dark wooden rollers with turned knobs at both ends, and a magnifying glass with a brass rim and a dark wooden handle lying over the middle of the scroll, its handle pointing down to the right. Add writing, so the player is searching the text for a missing word. Across the parchment run four rows of short dark brush strokes like lines of writing, made of marks and not letters of any alphabet. Under the lens the strokes are magnified, larger and bolder than outside it, and in the middle row inside the lens one word is missing: an empty gap in the line with a thick gold line beneath it, like a blank waiting to be filled in. The scroll and the lens sit in the middle and fill about two-thirds of the width, with plain deep night-blue (#1B2033) around them, one even colour to every edge. No border, no frame, no rounded corners, and no shadow at the edges. Bold, simple shapes that still read when the icon is the size of a fingertip.
```

It came back 1,254 × 1,254, 24-bit RGB, and passed: the scroll on its rollers and the brass lens,
the writing made of marks with no letters, the blank in the middle row inside the lens, square
corners with no border or shadow, and nothing on the catch list (§3). Seven rows of writing run
outside the lens and five inside it, not the four asked; they read as writing at every size, so
they stand. It had three faults, each measured:

1. **The blank was too thin:** a line 175 × 17 px, a pixel or two at home-screen size.
2. **The art filled 91% of the width,** not the two-thirds asked. Each use is framed in code
   instead (_The files_).
3. **The ground was (25, 33, 52), `#192134`,** two levels off `#1B2033`.

**The retouch, in code,** since ChatGPT's edits redraw more than they are asked to. Every pixel
moved by (+2, −1, −1), which takes the ground to `#1B2033`. The blank was redrawn as a bar 190 ×
30 px (x 522–712, y 596–626) with 7 px corners in the same amber, RGB (202, 133, 15), over the old
line; it stays an underline, as the game's own blanks are, and solid, since dashes break into noise
at icon size. Nothing else moved by more than two levels. The owner approved it framed for the
store, with the master at 82%.

The files, as hashed in the images folder (SHA-256):

- `icon-sheet-v1.png`: `142a4930cbf94e87b5d91800812f0ffec325c67311ed989521df9312874cf321`
- `icon-sheet-v2.png`: `ead3a535491b0b6bb661aefa43f7f27ad84e0401b965d061e53cdcfe110bd700`
- `icon-scroll-lens-v1.png`, as generated: `bc837451d9d2f5c8e02ca49222159f6f34d57000e80d6610aedbc305ca977e34`
- `icon.png`, retouched, the master: `08b2c28c37ea86c35fc828507f51261fbdce85eb5c93b83aeb27e442bff05718`
