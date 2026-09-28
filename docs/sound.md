# The sound register

Every file in `public/audio/` has a row here: its role, its source, its author, and its licence,
and below the table the command that made it from the original, the way each picture's brief
records its prompt as sent (world rules §9). `src/sound/register.test.ts` holds it: every file has
a row and a command, every row has a file, and every licence is CC0 1.0 or CC BY 4.0 (Gate 10 A1).
Every CC BY file is also named in the title screen's credit line, `strings.credit`.

| file                    | role                                              | source                                                                                 | author           | licence   |
| ----------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------- | --------- |
| `found.m4a`             | found: a spot's first tap                         | [Lyre harp single note](https://freesound.org/people/Biggertigger2006/sounds/722897/)  | Biggertigger2006 | CC0 1.0   |
| `paper.m4a`             | paper: a tap that copies a paper to Papers        | [Unrolling Scroll.wav](https://freesound.org/people/spookymodem/sounds/202107/)        | spookymodem      | CC0 1.0   |
| `place.m4a`             | place: a word, a name, or a picture set in a slot | [Knocking on wood.wav](https://freesound.org/people/Elandre01/sounds/594389/)          | Elandre01        | CC0 1.0   |
| `not-yet.m4a`           | not yet: Close the case, answered wrong           | [Lyre.flac](https://freesound.org/people/Hedmarking/sounds/191883/)                    | Hedmarking       | CC0 1.0   |
| `close.m4a`             | the close: Close the case, answered right         | [Lyre.flac](https://freesound.org/people/Hedmarking/sounds/191883/)                    | Hedmarking       | CC0 1.0   |
| `music/desert-city.m4a` | the title theme, on the title screen              | [Desert City](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100564) | Kevin MacLeod    | CC BY 4.0 |
| `music/lamentation.m4a` | the case bed, on Look and Solve                   | [Lamentation](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100607) | Kevin MacLeod    | CC BY 4.0 |

## The edits

Each file is cut from its original as Freesound serves it, named as downloaded, with ffmpeg 9.0.2
(the Gyan full build, installed by winget). The encode is AAC in `.m4a`, mono at 64 kbps and 48 kHz
(A6), with the metadata stripped and the bit-exact flags set, so the command rebuilds the file byte
for byte.

**Levelling** (the ruling on A3): every effect is brought to the same loudness, −22 LUFS over its
loudest 100 ms, K-weighted as ITU-R BS.1770 weights it. The window is 100 ms because the knock is
over in less than the standard's 400 ms. The gain is measured on the cut before the encode, and it
is the `volume` in the command. −22 leaves the knock, the peakiest, at −1.5 dBFS.

### found.m4a

The whole note, an A4 plucked on a lyre harp, 0.51 s. Loudest 100 ms −14.4 LUFS, so −7.6 dB.

```
ffmpeg -i 722897__biggertigger2006__lyre-harp-single-note.wav -af "afade=t=out:st=0.41:d=0.1,volume=-7.6dB" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact found.m4a
```

### paper.m4a

The densest 1.5 s of the unrolling, 1.25 s to 2.75 s. Loudest 100 ms −32.5 LUFS, so +10.5 dB.

```
ffmpeg -i 202107__spookymodem__unrolling-scroll.wav -af "atrim=1.25:2.75,asetpts=PTS-STARTPTS,afade=t=in:d=0.05,afade=t=out:st=1.20:d=0.3,volume=10.5dB" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact paper.m4a
```

### place.m4a

The third of the four knocks, the dullest (its spectral centroid 1.0 kHz), 0.83 s to 1.18 s.
Loudest 100 ms −37.3 LUFS, so +15.3 dB.

```
ffmpeg -i 594389__elandre01__knocking-on-wood.wav -af "atrim=0.83:1.18,asetpts=PTS-STARTPTS,afade=t=out:st=0.25:d=0.1,volume=15.3dB" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact place.m4a
```

### not-yet.m4a

The recording is one run down the scale of E major, about three octaves, tuned about a third of a
semitone flat. Not yet is two of its notes as played, A4 falling to G♯4, from A4's onset at 8.16 s
to the next note's at 9.56 s. Loudest 100 ms −18.0 LUFS, so −4.0 dB.

```
ffmpeg -i 191883__hedmarking__lyre.flac -af "atrim=8.16:9.56,asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st=1.15:d=0.25,volume=-4.0dB" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact not-yet.m4a
```

### close.m4a

The recording never rises, so the close is three of its notes set rising: B4 (7.45 s), E5 (5.38 s),
and G♯5 (4.00 s), each cut from its onset for 0.7 s, up to the next note's, and started at the
sting's offsets, 0, 0.18 s, and 0.36 s. That is the sting's shape, a rising fourth and then a major
third, on the lyre's own strings. Loudest 100 ms −30.7 LUFS, so +8.7 dB.

```
ffmpeg -i 191883__hedmarking__lyre.flac -filter_complex "[0:a]atrim=7.45:8.15,asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st=0.50:d=0.2[a];[0:a]atrim=5.38:6.08,asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st=0.50:d=0.2[b];[0:a]atrim=4:4.70,asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st=0.50:d=0.2[c];[b]adelay=180:all=1[b2];[c]adelay=360:all=1[c2];[a][b2][c2]amix=inputs=3:normalize=0,volume=8.7dB" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact close.m4a
```

## The music

Each cue is encoded from the MP3 incompetech serves, named as downloaded, with the same ffmpeg. The
encode is AAC in `.m4a`, stereo at 96 kbps and 48 kHz (A6), with the MP3's cover art dropped, the
metadata stripped, and the bit-exact flags set. The credit's "edited" covers the cut, the fade, and
the level.

**Levelling:** each cue is brought to −28 LUFS over its loudest 100 ms, the effects' own measure,
so the music's loudest moment sits 6 dB under every effect (A3: the effects sit above the music,
with no ducking). The gain is the `volume` in the command.

### music/desert-city.m4a

Whole, as the owner ruled: 89.37 s. It was written to loop, so it ends mid-phrase at full level; its
last 2 s fade, which takes nothing out. Loudest 100 ms −6.4 LUFS, so −21.6 dB, leaving it at −34
LUFS integrated.

```
ffmpeg -i "Desert City.mp3" -af "afade=t=out:st=87.36:d=2,volume=-21.6dB" -vn -ac 2 -ar 48000 -c:a aac -b:a 96k -map_metadata -1 -fflags +bitexact -flags:a +bitexact music/desert-city.m4a
```

### music/lamentation.m4a

Its first long phrase, 84.6 s, which decays to silence at 84.3 s before the next begins at
84.75 s: a cut under A2's 90 s that ends where the harp does. Loudest 100 ms −10.0 LUFS, so
−18.0 dB, leaving it at −38.2 LUFS integrated.

```
ffmpeg -i "Lamentation.mp3" -af "atrim=0:84.6,asetpts=PTS-STARTPTS,afade=t=out:st=84.3:d=0.3,volume=-18.0dB" -vn -ac 2 -ar 48000 -c:a aac -b:a 96k -map_metadata -1 -fflags +bitexact -flags:a +bitexact music/lamentation.m4a
```
