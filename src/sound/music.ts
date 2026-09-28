import { useEffect } from 'react'
import { decode, running, wake } from './engine.ts'
import { isOn, subscribe } from './settings.ts'

/** The season's two cues (Gate 10 A2), each a file in `public/audio/` with its row in `docs/sound.md`. */
export const cues = { title: 'music/desert-city.m4a', case: 'music/lamentation.m4a' } as const

export type Cue = keyof typeof cues

/** A cue plays through, rests a minute, and plays again, so it never comes round without a pause. */
const rest = 60
const fadeIn = 2
const fadeOut = 1

/** A cue's address carries its file's hash, as a picture's does, so a changed cue is a new one (A6). */
const address = (cue: Cue) => `${cues[cue]}?v=${__AUDIO_HASHES__[cues[cue]]}`

/** The cue the screen on show asks for; none on the reveal, where the passage is read in quiet. */
let wanted: Cue | null = null
/** The cue playing or resting: the only one decoded (A6). */
let current: { cue: Cue; gain: GainNode; source?: AudioBufferSourceNode } | undefined

/**
 * A cue decoded and played, fading in, and each time it ends played again after the rest. It runs
 * on the context's clock, so it pauses, rest and all, while the app is hidden.
 */
function begin(ac: AudioContext, cue: Cue) {
  const gain = ac.createGain()
  gain.connect(ac.destination)
  const playing: NonNullable<typeof current> = { cue, gain }
  current = playing
  const play = (buffer: AudioBuffer, at: number) => {
    if (current !== playing) return
    const source = ac.createBufferSource()
    source.buffer = buffer
    source.connect(gain)
    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(1, at + fadeIn)
    source.onended = () => play(buffer, ac.currentTime + rest)
    source.start(at)
    playing.source = source
  }
  decode(ac, address(cue)).then(
    (buffer) => play(buffer, ac.currentTime),
    () => {
      if (current === playing) current = undefined
    },
  )
}

/** The cue playing faded out and stopped; whether there was one. */
function end(ac: AudioContext) {
  if (current === undefined) return false
  const { gain, source } = current
  current = undefined
  const now = ac.currentTime
  gain.gain.cancelScheduledValues(now)
  gain.gain.setValueAtTime(gain.gain.value, now)
  gain.gain.linearRampToValueAtTime(0, now + fadeOut)
  source?.stop(now + fadeOut)
  return true
}

/** What the screen and the switch ask for. */
const asked = () => (isOn('music') ? wanted : null)
/** The second a cue takes to fade out, before the next is fetched. */
let handover: ReturnType<typeof setTimeout> | undefined

/**
 * The music brought to what is asked for, while the context runs: the cue playing fades out, and
 * what is asked for then is begun once it has, so two cues are never decoded at once.
 */
function update() {
  const ac = running()
  const next = asked()
  if (ac === undefined || handover !== undefined || (current?.cue ?? null) === next) return
  if (end(ac))
    handover = setTimeout(() => {
      handover = undefined
      update()
    }, fadeOut * 1000)
  else if (next !== null) begin(ac, next)
}

/**
 * Any tap brings the music to what the screen asks for (A4): a tap is what lets a page make sound,
 * and what resumes a context the phone interrupted. It listens after the app's own handlers, so a
 * card's tap has already asked for the case's cue.
 */
function unlock() {
  const next = asked()
  if ((current?.cue ?? null) === next && (next === null || running() !== undefined)) return
  try {
    void wake().resume().then(update)
  } catch {
    // No audio here: the music carries nothing the screen doesn't (A5).
  }
}

document.addEventListener('click', unlock)
document.addEventListener('keydown', unlock)
subscribe(update)

/** A screen's cue, asked for while the screen is shown: the title's, a case's, or none. */
export function useCue(cue: Cue | null) {
  useEffect(() => {
    wanted = cue
    update()
  }, [cue])
}

/** The title screen's cue, as an element of the screen the app draws inline. */
export function Music({ cue }: { cue: Cue | null }) {
  useCue(cue)
  return null
}
