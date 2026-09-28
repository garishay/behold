import { isOn } from './settings.ts'

/** The five effects (Gate 10 A3), each a file in `public/audio/` with its row in `docs/sound.md`. */
export const effects = {
  found: 'found.m4a',
  paper: 'paper.m4a',
  place: 'place.m4a',
  notYet: 'not-yet.m4a',
  close: 'close.m4a',
} as const

export type Effect = keyof typeof effects

/** The Audio Session API, where the browser has it (Safari 16.4 on). */
type WithSession = Navigator & { audioSession?: { type: string } }

let context: AudioContext | undefined
const decoded = new Map<string, Promise<AudioBuffer>>()

/** A file fetched whole and decoded, once; a failed fetch is forgotten, so the next play retries. */
function load(ac: AudioContext, file: string) {
  let buffer = decoded.get(file)
  if (buffer === undefined) {
    buffer = fetch(`${import.meta.env.BASE_URL}audio/${file}`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${r.status} ${file}`))))
      .then((bytes) => ac.decodeAudioData(bytes))
    buffer.catch(() => decoded.delete(file))
    decoded.set(file, buffer)
  }
  return buffer
}

/**
 * Leaving the app, or locking the phone, stops the sound, and returning brings it back (A4). A
 * resumed context on iPhone can report "running" while its clock stands still (WebKit bugs 263627
 * and 273511), so a resume whose clock hasn't moved is suspended and resumed again.
 */
function onVisibility(ac: AudioContext) {
  if (document.hidden) void ac.suspend()
  else
    void ac.resume().then(() => {
      const at = ac.currentTime
      setTimeout(() => {
        // Unless the app was hidden again meanwhile, and its suspend is the one that stopped it.
        if (ac.currentTime === at && !document.hidden) void ac.suspend().then(() => ac.resume())
      }, 250)
    })
}

/**
 * The one context everything plays through, never an `<audio>` element (A4): made on the first
 * sound, which is always a tap's, with the session set to ambient first, so the silent switch
 * silences it and the player's own audio plays on under it. The effects are decoded as it is made.
 */
function wake() {
  if (context === undefined) {
    const session = (navigator as WithSession).audioSession
    if (session !== undefined) session.type = 'ambient'
    const ac = new AudioContext()
    document.addEventListener('visibilitychange', () => onVisibility(ac))
    for (const file of Object.values(effects)) void load(ac, file).catch(() => {})
    context = ac
  }
  if (context.state !== 'running') void context.resume()
  return context
}

/** An effect, played once over whatever else is playing, while Effects is on. */
export function play(effect: Effect) {
  if (!isOn('effects')) return
  try {
    const ac = wake()
    void load(ac, effects[effect]).then(
      (buffer) => {
        const source = ac.createBufferSource()
        source.buffer = buffer
        source.connect(ac.destination)
        source.start()
      },
      () => {},
    )
  } catch {
    // No audio here: every effect repeats something on the screen, so nothing is lost (A5).
  }
}
