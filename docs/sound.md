# The sound register

Every file in `public/audio/` has a row here: its role, its source, its author, and its licence,
and below the table the command that made it from its source, the way each picture's brief records
its prompt as sent (world rules §9). `src/sound/register.test.ts` holds it: every file has a row and
a command, every row has a file, and every licence is CC0 1.0 or CC BY 4.0 (Gate 10 A1). Every CC BY
file is also named in the title screen's credit line, `strings.credit`.

| file                    | role                                              | source                                                                                 | author        | licence   |
| ----------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------- | --------- |
| `found.m4a`             | found: a spot's first tap                         | [bell8.wav](https://freesound.org/people/creeeeak/sounds/531031/)                      | creeeeak      | CC0 1.0   |
| `paper.m4a`             | paper: a tap that copies a paper to Papers        | [Unrolling Scroll.wav](https://freesound.org/people/spookymodem/sounds/202107/)        | spookymodem   | CC0 1.0   |
| `place.m4a`             | place: a word, a name, or a picture set in a slot | [Knocking on wood.wav](https://freesound.org/people/Elandre01/sounds/594389/)          | Elandre01     | CC0 1.0   |
| `not-yet.m4a`           | not yet: Close the case, answered wrong           | [Full Scale on the Flute](https://freesound.org/people/painted-panda/sounds/590175/)   | painted-panda | CC0 1.0   |
| `close.m4a`             | the close: Close the case, answered right         | [bell8.wav](https://freesound.org/people/creeeeak/sounds/531031/)                      | creeeeak      | CC0 1.0   |
| `music/desert-city.m4a` | the case bed, on Look and Solve                   | [Desert City](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100564) | Kevin MacLeod | CC BY 4.0 |
| `music/lamentation.m4a` | the title theme, on the title screen              | [Lamentation](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100607) | Kevin MacLeod | CC BY 4.0 |

## The edits

Each file is made with ffmpeg 9.0.2 (the Gyan full build, installed by winget) from its source,
named as downloaded. The paper's scroll and the knock are cut from Freesound's originals. The bell
and the flute are cut from Freesound's public HQ previews, the 128 kbps MP3s every sound page plays,
because the originals need a signed-in download:
`https://cdn.freesound.org/previews/531/531031_3160531-hq.mp3` for the bell and
`https://cdn.freesound.org/previews/590/590175_13308993-hq.mp3` for the flute. They are saved under
the originals' names with `.mp3`. Encoding from the originals instead changes only the input to
each command. The music is encoded from the MP3s incompetech serves.

The effects are AAC in `.m4a`, mono at 64 kbps and 48 kHz (A6). The music is stereo at 96 kbps and
48 kHz, with the MP3s' cover art dropped. Every file has its metadata stripped and the bit-exact
flags set, so its command rebuilds it byte for byte.

**Levelling** (A3, as amended on the owner's sound check): the title theme is −18 LUFS integrated,
heard alone on its screen, and the case bed −22. Every effect's loudest 100 ms, K-weighted as ITU-R
BS.1770 weights it, is −16, 6 dB over the case bed's average level. The window is 100 ms because the
knock is over in less than the standard's 400 ms. The gain is measured on the cut before the encode,
and it is the `volume` in the command. Every file stays under −1 dBTP, measured on the encoded file:
where the gain would pass it, a limiter follows it, its ceiling stepped down from −2 dBFS until the
file measures under −1.1. Only the knock needs one, at −5 dBFS. It is one sharp tap, so it reaches
the ceiling before it reaches the level, and it stays at −21.8 over its loudest 100 ms, as the
owner kept it on the sound check.

### found.m4a

A small brass bell, one strike, 0.5 s from its onset. Loudest 100 ms −5.3 LUFS, so −10.7 dB; true
peak −7.7 dBTP.

```
ffmpeg -i 531031__creeeeak__small-brass-bell.mp3 -af "atrim=0.09:0.59,asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st=0.38:d=0.12,volume=-10.7dB" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact found.m4a
```

### paper.m4a

The densest 1.5 s of the unrolling, 1.25 s to 2.75 s. Loudest 100 ms −32.5 LUFS, so +16.5 dB; true
peak −6.2 dBTP.

```
ffmpeg -i 202107__spookymodem__unrolling-scroll.wav -af "atrim=1.25:2.75,asetpts=PTS-STARTPTS,afade=t=in:d=0.05,afade=t=out:st=1.20:d=0.3,volume=16.5dB" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact paper.m4a
```

### place.m4a

The third of the four knocks, the dullest (its spectral centroid 1.0 kHz), 0.83 s to 1.18 s.
Loudest 100 ms −37.3 LUFS, so +21.3 dB, then the limiter at −5 dBFS: loudest 100 ms −21.8, true
peak −1.8 dBTP.

```
ffmpeg -i 594389__elandre01__knocking-on-wood.wav -af "atrim=0.83:1.18,asetpts=PTS-STARTPTS,afade=t=out:st=0.25:d=0.1,volume=21.3dB,alimiter=limit=0.5623:attack=1:release=40:level=false" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact place.m4a
```

### not-yet.m4a

Two notes of one player's B♭ major scale on the flute, as played: C5 falling to a held B♭4, 3.33 s
to 4.23 s. Loudest 100 ms −18.5 LUFS, so +2.5 dB; true peak −10.4 dBTP.

```
ffmpeg -i 590175__painted-panda__flute-scale.mp3 -af "atrim=3.33:4.23,asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st=0.60:d=0.3,volume=2.5dB" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact not-yet.m4a
```

### close.m4a

The brass bell struck three times in the sting's shape, a rising fourth and then a major third,
at the sting's offsets, 0, 0.18 s, and 0.36 s. Each strike is 0.7 s of the bell from its onset,
pitched by resampling to three quarters, one, and five quarters of its own pitch. Loudest 100 ms
−4.4 LUFS, so −11.6 dB; true peak −7.7 dBTP.

```
ffmpeg -i 531031__creeeeak__small-brass-bell.mp3 -filter_complex "[0:a]atrim=0.09:0.79,asetpts=PTS-STARTPTS,aresample=48000,asetrate=36000,aresample=48000,afade=t=in:d=0.005,afade=t=out:st=0.45:d=0.25[a];[0:a]atrim=0.09:0.79,asetpts=PTS-STARTPTS,aresample=48000,asetrate=48000,aresample=48000,afade=t=in:d=0.005,afade=t=out:st=0.45:d=0.25[b];[0:a]atrim=0.09:0.79,asetpts=PTS-STARTPTS,aresample=48000,asetrate=60000,aresample=48000,afade=t=in:d=0.005,afade=t=out:st=0.45:d=0.25[c];[b]adelay=180:all=1[b2];[c]adelay=360:all=1[c2];[a][b2][c2]amix=inputs=3:normalize=0,volume=-11.6dB" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact close.m4a
```

## The music

The credit's "edited" covers the cut, the fade, and the level. The two cues swapped roles on the
owner's sound check: _Lamentation_ is the title theme and _Desert City_ the case bed.

### music/desert-city.m4a

The case bed, whole: 89.37 s. It was written to loop, so it ends mid-phrase at full level; its last
2 s fade, which takes nothing out. Integrated −12.4 LUFS, so −9.6 dB, to −22.0; true peak −8.9
dBTP.

```
ffmpeg -i "Desert City.mp3" -af "afade=t=out:st=87.36:d=2,volume=-9.6dB" -vn -ac 2 -ar 48000 -c:a aac -b:a 96k -map_metadata -1 -fflags +bitexact -flags:a +bitexact music/desert-city.m4a
```

### music/lamentation.m4a

The title theme: its first long phrase, 84.6 s, which decays to silence at 84.3 s before the next
begins at 84.75 s. Integrated −20.2 LUFS, so +2.2 dB, to −18.0; true peak −2.0 dBTP.

```
ffmpeg -i Lamentation.mp3 -af "atrim=0:84.6,asetpts=PTS-STARTPTS,afade=t=out:st=84.3:d=0.3,volume=2.2dB" -vn -ac 2 -ar 48000 -c:a aac -b:a 96k -map_metadata -1 -fflags +bitexact -flags:a +bitexact music/lamentation.m4a
```
