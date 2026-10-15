# The icon

Behold's icon (#10, Gate 18): a scroll unrolled between two wooden rollers, a magnifying glass
over it, and under the glass, in the middle row of the writing, one word missing, a gold blank
waiting to be filled. It is the game's sign, not a scene. The lens and the two-roller scroll are
both later than Ahab's day, and the owner accepted them as such: the world rules govern the scenes
and the cases, not the icon.

The master, `assets/icon.png`: 1,254 × 1,254, 24-bit RGB, SHA-256 `08b2c28c37ea86c35fc828507f51261fbdce85eb5c93b83aeb27e442bff05718`.

`scripts/generate-icons.ts` (`npm run icons`) frames it for each use and writes the files in
`public/icons/`, and the store's icon in `assets/`. Its test holds every file to the master and
the master to the hash above, so neither changes without this record.

## The files

Each file is the master on `#1B2033`, the manifest's background colour, to every edge, with a point
of the master at its centre, each pixel the average of the master's pixels it covers. The art's box
is x 53–1199, y 146–1129 of the master: the knobs, the rollers, and the lens's handle. A file's
share is the box's width over its own. The master's outer 40 px, where nothing is more than 5
levels off `#1B2033`, fade to it exactly, so no edge of the master shows and every file meets the
ground at every edge; the art is 53 px in at its nearest. Every file is a 32-bit PNG.

| file                       | size | the art's share of the width | the master's point at the centre | where it shows                                                    |
| -------------------------- | ---- | ---------------------------- | -------------------------------- | ----------------------------------------------------------------- |
| `icon-192.png`             | 192  | 75%                          | x 626.5, y 605                   | the manifest's `any` icon                                         |
| `icon-512.png`             | 512  | 75%                          | x 626.5, y 605                   | the manifest's `any` icon                                         |
| `icon-1024.png`            | 1024 | 75%                          | x 626.5, y 605                   | the manifest's largest `any` icon; Bubblewrap's splash, at 300 dp |
| `favicon-48.png`           | 48   | 90%                          | x 626.5, y 605                   | a browser's tab, at 16 px                                         |
| `icon-512-maskable.png`    | 512  | 76.8%                        | x 622, y 590                     | the launcher, from Chrome's install                               |
| `apple-touch-icon-180.png` | 180  | 88%                          | x 622, y 590                     | the iPhone's home screen: the page's `apple-touch-icon`           |
| `assets/store-icon.png`    | 512  | 88%                          | x 622, y 590                     | Play's listing, uploaded at 68b; the site doesn't serve it        |

- **Unmasked** (#133). The manifest's `any` icons, the splash drawn from the 1024, and the favicon
  show the whole art at Gate 18's shares: 75%, the framing the owner approved and ruled
  (issuecomment-5932066607), the master at 82%; and 90% for the favicon, which a tab draws at 16
  px. Each is centred on the art's mass, the mean of its pixels' places, y 605.0. Gate 18 centred
  them on the box's middle, y 638, which left the mass 2.2% of the width above the centre. Across,
  each keeps the box's middle, x 626.5: the mass's x, 642.6, is the handle's pull, and centring on
  it would set the scroll 16 px left.
- **Masked** (#133). Where a platform masks the icon — the launcher, the iPhone, and Play — the
  art's box fills 88% of what the mask shows, with the owner's point, x 622, y 590, at the centre:
  the scroll and the lens.
  - **What stays inside.** The lens, out to its ring's outer edge (275 to 283 px from x 622, y 577
    along seven rays, held as a circle of 284), and the blank (x 522–712, y 596–626, as retouched)
    stay inside the 66 dp circle no mask clips: 16.4 and 5.9 dp from the centre, of its 33. The
    knobs (35.8 to 36.9 dp), the rollers' ends (36.1), and the handle's end (39.3) run past it,
    which retires Gate 18's whole art inside it. One UI's mask, fitted to the owner's phone (a
    superellipse, n = 2.65), takes 0.14 dp off the handle's tip. A round mask, 72 dp across, takes
    up to 3.3 dp off the handle's end and 0.9 off the bottom-right knob. Play's corners and the
    iPhone's take nothing.
  - **The launcher.** Android draws a launcher icon at 108 dp and shows the middle 72 dp, and no
    mask clips the 66 dp circle at its centre. How much of the 108 the maskable image spans
    depends on what installs it, so its share is 88% × 72 over the dp it spans. **Chrome's
    install** pads the image so the spec's safe circle, 80% of its width, meets Android's 66 dp
    one, by the ratio of `MASKABLE_SAFE_ZONE_RATIO`, 4/5, to `ADAPTIVE_SAFE_ZONE_RATIO`, 66/108,
    in Chromium's `WebappsIconUtils` (#129). The image spans 82.5 dp, so 88% × 72 / 82.5 = 76.8%.
    Laid out that way, 10a's file and 129a's match the owner's screenshots of their checks within
    a pixel; laid out over 91 dp, they differ from them twice as much or more. **Bubblewrap,**
    which builds the Play app (68b), insets the image 8.5 dp a side in its `ic_launcher.xml`, so it
    spans 91 dp, and 68b gives it its own file at 88% × 72 / 91 = 69.6%.
  - **The iPhone and Play** show the whole square under their own corners, Play's at 30% of the
    side, so each file is the launcher's view: 88% of the square. The iPhone's is 180, Apple's size
    for it. The store's is Play's full-square 512, a "32-bit PNG (with alpha)" of at most 1024 KB.
    Play takes it by upload, so it sits beside the feature graphic, and the site doesn't serve it.
- **The splash.** Bubblewrap draws it at 300 dp from the largest `any` icon, 900 px at xxhdpi and
  1,200 at xxxhdpi, so the 1024 gives it the art rather than the 512 enlarged (Gate 18's ruling,
  its fifth file).
- **What a first visit downloads.** The service worker precaches the two icons the game's page
  links, the favicon and the iPhone's 180. The manifest's icons are read when the app is
  installed, never offline, so they aren't precached.
- **The fade eases in** (#133), as the square of the way across the band. The iPhone's file, the
  store's, and the favicon reach 12 px into the band at the master's bottom, across a shadow's
  faint tail at its right. Faded in a straight line, as Gate 18 had it, their bottom edges came out
  a level off the ground in 1 to 7 pixels. Eased in, every edge of every file meets it exactly, and
  each file moved at most a level, in 0.5% to 1.3% of its pixels, all in the band.

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

## The feature graphic

The store's feature graphic (Gate 18 A7), accepted by the owner on 2026-10-01
(issuecomment-5939422449). Play shows it at the top of the listing, and asks for 1024 × 500,
"JPEG or 24-bit PNG (no alpha)".

The feature graphic, `assets/feature-graphic.png`: 1,024 × 500, 24-bit RGB, SHA-256 `3760c7f6c8522555814f3f276d2f0f9ea49e09ebf7cb45f6668930cafe523edc`.

It is the images folder's `feature-graphic-1024x500.png`, committed as it is. The icons' test holds
it to the hash above and to Play's size and kind. The owner uploads it with the listing, at 68b's
time.

It was generated in a new ChatGPT Images chat on 2026-10-01, and its seal was edited once. The
first paragraph of the prompt is world rules §6's style header, with "Landscape, twice as wide as
it is tall." in place of "Portrait orientation." (§6). Its last sentence is the one Gate 18's
ruling amended: the middle half of the height, so that a 3:2 canvas could be cropped to 2:1 and
keep what matters.

### 1. The picture

Attached: `bedchamber.jpg`, the vineyard's bedchamber (`public/cases/vineyard/bedchamber.jpg` at
`071fe77`), for style, as A7 names it. It was the only attachment.

```
Match the style of the attached image exactly: flat, clean illustration with bold shapes and strong contrast, like a picture book for adults. Landscape, twice as wide as it is tall. No text or lettering anywhere. Ninth-century-BC Israel: wool robes, sandals, mudbrick and stone. No crosses, nothing Greek or Roman.

Night, a low wooden table in a house of ninth-century-BC Israel, lit warm from the left by an oil lamp that stands out of the picture. On the table, laid out like evidence: a folded papyrus letter sealed with a lump of red clay pressed by a seal, a gold signet ring with a dark stone beside it, a smooth river stone of the kind a sling throws, and a reed pen. Behind the table, a square window with a heavy timber lintel and no glass shows a hilltop town of flat-roofed houses of stone and mudbrick under a full moon, in deep blue night. No people. No writing on the letter, the clay, the ring, or anywhere else. Everything that matters sits in the middle 70% of the width and the middle half of the height; the edges are plain wall, table, and night.
```

It came back 1,774 × 887, exactly 2:1, as 24-bit RGB, and passed:

- **The still life:** the folded letter with its seal, the gold signet ring with a dark stone, the
  smooth sling stone, and a pen, on a dark wooden table lit warm from the left.
- **The window:** a timber lintel on stone jambs, with no glass and no arch, onto a hilltop town of
  flat-roofed houses under a full moon, in deep blue night.
- **No people, and no text anywhere:** the seal's face, the letter, and the ring are blank.
- **The catch list (§3):** no crosses, nothing Greek or Roman, and no arches, coins, or glass.
- **Google's lines:** nothing like the icon; no pure white, black, or dark gray; and the key
  objects inside the middle 70% × 70% once fitted.

Two notes, neither a fault. The still life sits lower than asked, 57–77% of the way down once
fitted; the canvas came back 2:1, so the fit trims only 12 px of 887, and the objects stay inside
Google's bands. The pen reads closer to a modern pen than a cut reed; the bedchamber's pen,
accepted at Gate 12, is the same light reed with a dark nib, so it passes on that precedent.

It had one fault: **the seal was sealing wax,** glossy crimson with a crimped rim, which is
medieval. The prompt asked for clay, and world rules §2 seal letters "with a clay bulla pressed by
a stamp seal". A recolor in code read as a brown wax seal, since the crimped rim is what says wax,
so it wasn't kept.

### 2. The edit

Sent to the chat that made the picture:

```
Change only the seal on the folded letter, keeping its size and place. Make it a lump of matte reddish-brown clay, like the clay seal on the table in the image I attached: dull and slightly rough, uneven at the edge, pressed flat by a stamp seal, with a plain round dent in its middle and nothing in the dent. Clay, not wax: no shine and no crimped rim. Keep everything else in the picture exactly as it is.
```

It came back with the seal right: matte reddish-brown clay, slightly rough, uneven at the edge,
with a plain round dent and nothing in it. The rest was redrawn too, as ChatGPT's edits are: 17.1%
of the picture's pixels moved by more than 8 levels. So only its seal was used.

### 3. The accepted picture, and the store's file

The first picture with the edit's seal set in, in code. Inside an ellipse round the seal and its
shadow, centred on (880, 578) with semi-axes of 66 × 36 px, every pixel within 0.86 of its radius
is the edit's, and across the rest it eases to the first picture's (a smoothstep), so the paper
meets without a seam. 7,084 pixels differ from the first picture, all within x 816–944, y 543–613.
The owner accepted it from a preview showing the fitted graphic, the seal before and after, and
Google's bands shaded.

The store's file is that picture scaled to 1,024 × 512, each pixel the average of the source
pixels it covers, with rows 6–505 kept: 1,024 × 500, 24-bit RGB, no alpha. The letter, the seal,
the ring, and the stone sit inside the middle 70% × 70%, clear of Google's cutoff bands. The pen's
tip meets the bottom band's line, and the moon, scenery only, sits in the top band.

The files, as hashed in the images folder (SHA-256):

- `feature-graphic-v1.png`, as generated: `a13fce58b648715a82ff92cc55d6ee2ef3a58bbf5b809d9088b76ac5948994d5`
- `feature-graphic-v2.png`, the edit: `015949b07d98a35bce725ad4f838df522fab374ec35137838f2029a80aebb60c`
- `feature-graphic.png`, the accepted picture: `c1ecd47befa8bde32bacb551ff750ff20e18e24c230248d3a020d503186ea01b`
- `feature-graphic-1024x500.png`, the store's file: `3760c7f6c8522555814f3f276d2f0f9ea49e09ebf7cb45f6668930cafe523edc`
- `feature-graphic-preview.png`, the preview: `7eeca14220f82e5bf83cccd9911e04995f8572b3bbbe371aa970a8c4c4364e54`
