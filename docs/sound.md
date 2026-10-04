# The sound register

Every file in `public/audio/` has a row here: its role, its source, its author, and its licence,
and below the table the command that made it from its source, the way each picture's brief records
its prompt as sent (world rules §9), and its SHA-256. `src/sound/register.test.ts` holds it: every
file has a row, a command, and a digest it matches, every row has a file, and every licence is CC0
1.0 or CC BY 4.0 (Gate 10 A1), so no file changes without its entry. Every CC BY file is also named
in the cases page's credit line, `strings.credit`.

| file                    | role                                              | source                                                                                                                                                           | author                       | licence   |
| ----------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------- |
| `found.m4a`             | found: a spot's first tap                         | [bell8.wav](https://freesound.org/people/creeeeak/sounds/531031/)                                                                                                | creeeeak                     | CC0 1.0   |
| `paper.m4a`             | paper: a tap that copies a paper to Papers        | [Unrolling Scroll.wav](https://freesound.org/people/spookymodem/sounds/202107/)                                                                                  | spookymodem                  | CC0 1.0   |
| `place.m4a`             | place: a word, a name, or a picture set in a slot | [Knocking on wood.wav](https://freesound.org/people/Elandre01/sounds/594389/)                                                                                    | Elandre01                    | CC0 1.0   |
| `not-yet.m4a`           | not yet: Close the case, answered wrong           | [Full Scale on the Flute](https://freesound.org/people/painted-panda/sounds/590175/)                                                                             | painted-panda                | CC0 1.0   |
| `close.m4a`             | the close: Close the case, answered right         | [bell8.wav](https://freesound.org/people/creeeeak/sounds/531031/) and [Tambourine_Single_Hit_1.wav](https://freesound.org/people/radiopassiveboy/sounds/219266/) | creeeeak and radiopassiveboy | CC0 1.0   |
| `music/desert-city.m4a` | the case bed, on Look and Solve                   | [Desert City](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100564)                                                                           | Kevin MacLeod                | CC BY 4.0 |
| `music/lamentation.m4a` | the title theme, on the title and the cases page  | [Lamentation](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100607)                                                                           | Kevin MacLeod                | CC BY 4.0 |

## The edits

Each file is made with ffmpeg 9.0.2 (the Gyan full build, installed by winget) from its source,
named as downloaded. The paper's scroll and the knock are cut from Freesound's originals. The
bell, the flute, and the timbrel are cut from Freesound's public HQ previews, the 128 kbps MP3s
every sound page plays, because the originals need a signed-in download:
`https://cdn.freesound.org/previews/531/531031_3160531-hq.mp3` for the bell,
`https://cdn.freesound.org/previews/590/590175_13308993-hq.mp3` for the flute, and
`https://cdn.freesound.org/previews/219/219266_170215-hq.mp3` for the timbrel. They are saved under
the originals' names with `.mp3`. Encoding from the originals instead changes only the input to
each command. The music is encoded from the MP3s incompetech serves.

The effects are AAC in `.m4a`, mono at 64 kbps and 48 kHz (A6). The music is stereo at 96 kbps and
48 kHz, with the MP3s' cover art dropped. Every file has its metadata stripped and the bit-exact
flags set, so its command rebuilds it byte for byte.

**Levelling** (A3, as amended on the owner's sound check): the title theme is −20 LUFS integrated,
heard alone on its screen, and the case bed −22. The title theme was −18 until the owner's listen on
the phone found it a little loud; it is 2 dB down, still 2 dB over the case bed. Every effect's
loudest 100 ms, K-weighted as ITU-R BS.1770 weights it, is −16, 6 dB over the case bed's average
level. The window is 100 ms because the knock is over in less than the standard's 400 ms. The gain
is measured on the cut before the encode, and it is the `volume` in the command. Every file stays
under −1 dBTP, measured on the encoded file: where the gain would pass it, a limiter follows it, its
ceiling stepped down from −2 dBFS until the file measures under −1.1. Two effects sit under −16. The find is −20, 4 dB under the rest, the
owner's pick on the third sound check: it sounds more often than any other effect, so it is the
quietest. The knock is held by the limiter, the only file that needs one, at −5 dBFS: it is one
sharp tap, so it reaches the ceiling before it reaches the level, and it stays at −21.8 over its
loudest 100 ms, as the owner kept it on the second.

**Tuning:** the find and the close are pitched to the case bed's key. _Desert City_ sits on an F
drone, tuned to A = 440, so the bell's partials, near E5 and B6, are raised by resampling at 1.055
(93 cents) to F5 and C7.

### found.m4a

A small brass bell, one strike from its onset, tuned to F5 and C7 and trimmed to 0.5 s. Loudest
100 ms −5.3 LUFS, so −14.7 dB to −20, the owner's lower level; true peak −11.7 dBTP.

SHA-256 `03bc880d1d7587333bc65cf285b1cb4555318f40b3d5b8850cad03abeb479d78`.

```
ffmpeg -i 531031__creeeeak__small-brass-bell.mp3 -af "atrim=0.09:0.637,asetpts=PTS-STARTPTS,aresample=48000,asetrate=50640,aresample=48000,atrim=0:0.5,asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st=0.380:d=0.12,volume=-14.7dB" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact found.m4a
```

### paper.m4a

The densest 1.5 s of the unrolling, 1.25 s to 2.75 s. Loudest 100 ms −32.5 LUFS, so +16.5 dB; true
peak −6.2 dBTP.

SHA-256 `8a2a15b17f3d5388e92bc39ad72237200c4adfd792c1b80c223e621ff6fa25b1`.

```
ffmpeg -i 202107__spookymodem__unrolling-scroll.wav -af "atrim=1.25:2.75,asetpts=PTS-STARTPTS,afade=t=in:d=0.05,afade=t=out:st=1.20:d=0.3,volume=16.5dB" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact paper.m4a
```

### place.m4a

The third of the four knocks, the dullest (its spectral centroid 1.0 kHz), 0.83 s to 1.18 s.
Loudest 100 ms −37.3 LUFS, so +21.3 dB, then the limiter at −5 dBFS: loudest 100 ms −21.8, true
peak −1.8 dBTP.

SHA-256 `a264c0acdacd0f8624f8f82dfd438f22789294e1ae86bd026f1ce23c83c978a5`.

```
ffmpeg -i 594389__elandre01__knocking-on-wood.wav -af "atrim=0.83:1.18,asetpts=PTS-STARTPTS,afade=t=out:st=0.25:d=0.1,volume=21.3dB,alimiter=limit=0.5623:attack=1:release=40:level=false" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact place.m4a
```

### not-yet.m4a

Two notes of one player's B♭ major scale on the flute, as played: C5 falling to a held B♭4, 3.33 s
to 4.23 s. Loudest 100 ms −18.5 LUFS, so +2.5 dB; true peak −10.4 dBTP.

SHA-256 `94cdaa3d0df90791e977bdebd72fdb56a0d96bd41031f5c901340cfe5a235391`.

```
ffmpeg -i 590175__painted-panda__flute-scale.mp3 -af "atrim=3.33:4.23,asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st=0.60:d=0.3,volume=2.5dB" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact not-yet.m4a
```

### close.m4a

The brass bell struck three times in the sting's shape, a rising fourth and then a major third,
on C, F, and A, the case bed's tonic chord, at the sting's offsets, 0, 0.18 s, and 0.36 s. Each
strike is 0.7 s of the bell from its onset, pitched by resampling to three quarters, one, and five
quarters of the tuned bell. Under the last strike, a timbrel's shimmer: 0.8 s of a tambourine hit,
7 dB under the bells. Loudest 100 ms −4.5 LUFS, so −11.5 dB; true peak −6.2 dBTP.

SHA-256 `a1b1b74f8e959af2bd00fd64485941fd2762d2d7aef005e94ecd6a5b0a70b1e6`.

```
ffmpeg -i 531031__creeeeak__small-brass-bell.mp3 -i 219266__radiopassiveboy__tambourine.mp3 -filter_complex "[0:a]atrim=0.09:0.664,asetpts=PTS-STARTPTS,aresample=48000,asetrate=37980,aresample=48000,atrim=0:0.7,asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st=0.450:d=0.25[a];[0:a]atrim=0.09:0.848,asetpts=PTS-STARTPTS,aresample=48000,asetrate=50640,aresample=48000,atrim=0:0.7,asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st=0.450:d=0.25[b];[0:a]atrim=0.09:1.033,asetpts=PTS-STARTPTS,aresample=48000,asetrate=63300,aresample=48000,atrim=0:0.7,asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st=0.450:d=0.25[c];[b]adelay=180:all=1[b2];[c]adelay=360:all=1[c2];[a][b2][c2]amix=inputs=3:normalize=0[s];[1:a]atrim=0:0.8,asetpts=PTS-STARTPTS,volume=-7dB,afade=t=out:st=0.5:d=0.3,adelay=360:all=1[t];[s][t]amix=inputs=2:normalize=0,volume=-11.5dB" -ac 1 -ar 48000 -c:a aac -b:a 64k -map_metadata -1 -fflags +bitexact -flags:a +bitexact close.m4a
```

## The music

The credit's "edited" covers each cue's cut, the title theme's fade, and both cues' levels. The two
cues swapped roles on the owner's sound check: _Lamentation_ is the title theme and _Desert City_
the case bed. The case bed loops in place, and the title theme comes round after a 3 s breath
(`src/sound/music.ts`, #84).

### music/desert-city.m4a

The case bed, cut to its music's own edges: 89.302 s, 4,286,512 samples at 48 kHz. It was written
to loop: it stops mid-phrase at full level, its end running into its start. The MP3 carries no
gapless tag, so its decode holds 1,058 samples of the codec's priming before the music and 1,702 of
its padding after it, 62 ms in all. The cut keeps samples 1,058 to 3,939,290 of the 44.1 kHz decode,
the music between them: 89.3023 s, which is 128 beats at 86 BPM to within a sample, so the game
loops it in place and the loop keeps time. It has no fade. The container's edit list trims the
encoder's own priming and padding, so Chrome decodes the cut to its length with no silence at
either end. Integrated −12.4 LUFS, so −9.6 dB, to −22.0; true peak −7.6 dBTP.

SHA-256 `0c33cb163b0bc2efa6c1c8ead8f0913a057baac6232093d63da42f38b56260ee`.

```
ffmpeg -i "Desert City.mp3" -af "atrim=start_sample=1058:end_sample=3939290,asetpts=PTS-STARTPTS,volume=-9.6dB" -vn -ac 2 -ar 48000 -c:a aac -b:a 96k -map_metadata -1 -fflags +bitexact -flags:a +bitexact music/desert-city.m4a
```

### music/lamentation.m4a

The title theme: its first long phrase, 84.6 s, which decays to silence at 84.3 s before the next
begins at 84.75 s. Integrated −20.2 LUFS, so +0.2 dB, to −20.0; true peak −3.9 dBTP.

SHA-256 `12b3474a85da789d732a33c328684a41f64d290462655f53cd0cacae9a475808`.

```
ffmpeg -i Lamentation.mp3 -af "atrim=0:84.6,asetpts=PTS-STARTPTS,afade=t=out:st=84.3:d=0.3,volume=0.2dB" -vn -ac 2 -ar 48000 -c:a aac -b:a 96k -map_metadata -1 -fflags +bitexact -flags:a +bitexact music/lamentation.m4a
```
