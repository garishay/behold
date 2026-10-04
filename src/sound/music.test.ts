import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Cue } from './music.ts'

/**
 * A stand-in for Web Audio, recording what the music asks of it: each gain's ramps, and each
 * source's buffer, start, and stop, on a clock the test sets. `end` plays a source to its end.
 */
interface Source {
  buffer: { decoded: string } | null
  at?: number
  stoppedAt?: number
  loop?: boolean
  onended: (() => void) | null
  gain?: Gain
}
interface Gain {
  ramps: string[]
}
const made: FakeContext[] = []
class FakeContext extends EventTarget {
  state = 'suspended'
  currentTime = 0
  destination = {}
  sources: Source[] = []
  constructor() {
    super()
    made.push(this)
  }
  /** The phone suspending or resuming the context, as its `statechange` reports it. */
  become(state: string) {
    this.state = state
    this.dispatchEvent(new Event('statechange'))
  }
  resume() {
    this.state = 'running'
    return Promise.resolve()
  }
  suspend() {
    return Promise.resolve()
  }
  decodeAudioData(bytes: { file: string }) {
    return Promise.resolve({ decoded: bytes.file })
  }
  createGain() {
    const gain: Gain & Record<string, unknown> = {
      ramps: [],
      connect: () => {},
      gain: {
        value: 1,
        setValueAtTime: (v: number, t: number) => gain.ramps.push(`set ${v} at ${t}`),
        linearRampToValueAtTime: (v: number, t: number) => gain.ramps.push(`ramp ${v} by ${t}`),
        cancelScheduledValues: () => {},
      },
    }
    return gain
  }
  createBufferSource() {
    const source: Source & Record<string, unknown> = {
      buffer: null,
      onended: null,
      connect: (gain: Gain) => (source.gain = gain),
      start: (at: number) => (source.at = at),
      stop: (at: number) => (source.stoppedAt = at),
    }
    this.sources.push(source)
    return source
  }
}

let fetched: string[] = []
const fakeFetch = (url: string) => {
  fetched.push(url)
  const file = url.slice(url.indexOf('/audio/') + 7).replace(/\?.*$/, '')
  return Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve({ file }) })
}
const settle = () => vi.advanceTimersByTimeAsync(0)
const tap = () => document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
const music = () => fetched.filter((u) => u.includes('/music/'))
const started = (ac: FakeContext) =>
  ac.sources.filter((s) => s.at !== undefined).map((s) => [s.buffer?.decoded, s.at])

/** The music and its switches fresh, as on a new visit, with the screen asking for `cue`. */
let rerender: (props: { cue: Cue | null }) => void
const load = async (cue: Cue | null) => {
  vi.resetModules()
  const { useCue } = await import('./music.ts')
  const settings = await import('./settings.ts')
  rerender = renderHook((props: { cue: Cue | null }) => useCue(props.cue), {
    initialProps: { cue },
  }).rerender
  return settings
}

beforeEach(() => {
  localStorage.clear()
  made.length = 0
  fetched = []
  vi.useFakeTimers({ toFake: ['setTimeout'] })
  vi.stubGlobal('AudioContext', FakeContext)
  vi.stubGlobal('fetch', fakeFetch)
})

afterEach(() => {
  // A module left from this test still listens for taps; asking it for nothing quiets it.
  rerender({ cue: null })
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('the music (Gate 10 A2, A4)', () => {
  it('waits for a tap, then plays the screen’s cue from its hashed address, fading in over 2 s', async () => {
    await load('title')
    await settle()
    expect(made).toHaveLength(0)
    expect(music()).toEqual([])
    tap()
    await settle()
    expect(music()).toEqual([
      expect.stringMatching(/^\/audio\/music\/lamentation\.m4a\?v=[0-9a-f]{8}$/),
    ])
    const [ac] = made
    expect(started(ac)).toEqual([['music/lamentation.m4a', 0]])
    expect(ac.sources[0].gain?.ramps).toEqual(['set 0 at 0', 'ramp 1 by 2'])
  })

  // The case bed came round only after a minute's silence, which on the phone read as the music
  // ending (#84). It was written to loop and is cut to its music's edges, so it loops in place: one
  // source, faded in on arrival and never again, with nothing waiting on its end.
  it('loops the case bed in place, with no rest and no fade on the way round', async () => {
    await load('case')
    tap()
    await settle()
    const [ac] = made
    expect(started(ac)).toEqual([['music/desert-city.m4a', 0]])
    expect(ac.sources[0].loop).toBe(true)
    expect(ac.sources[0].onended).toBeNull()
    expect(ac.sources[0].gain?.ramps).toEqual(['set 0 at 0', 'ramp 1 by 2'])
    expect(music()).toHaveLength(1)
  })

  // The title theme's phrase decays to silence on its own, so it comes round after a breath (#84).
  it('plays the title theme through, takes a breath of 3 s, and plays it again', async () => {
    await load('title')
    tap()
    await settle()
    const [ac] = made
    ac.currentTime = 84.6
    ac.sources[0].onended?.()
    expect(started(ac)).toEqual([
      ['music/lamentation.m4a', 0],
      ['music/lamentation.m4a', 87.6],
    ])
    expect(music()).toHaveLength(1)
  })

  it('fades the last cue out over a second before the next is fetched; the reveal asks for none', async () => {
    await load('title')
    tap()
    await settle()
    const [ac] = made
    ac.currentTime = 30
    rerender({ cue: 'case' })
    expect(ac.sources[0].gain?.ramps.slice(-1)).toEqual(['ramp 0 by 31'])
    expect(ac.sources[0].stoppedAt).toBe(31)
    await settle()
    expect(music()).toHaveLength(1)
    ac.currentTime = 31
    await vi.advanceTimersByTimeAsync(1000)
    expect(music()).toHaveLength(2)
    expect(started(ac).at(-1)).toEqual(['music/desert-city.m4a', 31])
    ac.currentTime = 40
    rerender({ cue: null })
    await vi.advanceTimersByTimeAsync(2000)
    expect(ac.sources[1].stoppedAt).toBe(41)
    expect(ac.sources).toHaveLength(2)
  })

  it('stops with Music off, and starts again with it on', async () => {
    const { turn } = await load('title')
    tap()
    await settle()
    const [ac] = made
    ac.currentTime = 10
    turn('music', false)
    expect(ac.sources[0].stoppedAt).toBe(11)
    tap()
    await settle()
    expect(ac.sources).toHaveLength(1)
    turn('music', true)
    await settle()
    expect(ac.sources).toHaveLength(1)
    ac.currentTime = 11
    await vi.advanceTimersByTimeAsync(1000)
    expect(started(ac).at(-1)).toEqual(['music/lamentation.m4a', 11])
  })

  it('holds the next cue until the last has faded, even through a tap', async () => {
    await load('title')
    tap()
    await settle()
    const [ac] = made
    ac.currentTime = 30
    rerender({ cue: 'case' })
    tap()
    await settle()
    expect(music()).toHaveLength(1)
    ac.currentTime = 31
    await vi.advanceTimersByTimeAsync(1000)
    expect(started(ac)).toEqual([
      ['music/lamentation.m4a', 0],
      ['music/desert-city.m4a', 31],
    ])
  })

  it('finishes a handover the app was hidden during, when it returns (review round 1)', async () => {
    await load('title')
    tap()
    await settle()
    const [ac] = made
    ac.currentTime = 30
    rerender({ cue: 'case' })
    ac.become('suspended')
    await vi.advanceTimersByTimeAsync(1000)
    expect(music()).toHaveLength(1)
    ac.become('running')
    await settle()
    expect(started(ac).at(-1)).toEqual(['music/desert-city.m4a', 30])
  })

  it('brings the music to the screen on the first tap after the phone interrupted it', async () => {
    await load('title')
    tap()
    await settle()
    const [ac] = made
    ac.state = 'interrupted'
    ac.currentTime = 50
    rerender({ cue: 'case' })
    await settle()
    expect(ac.sources[0].stoppedAt).toBeUndefined()
    tap()
    await settle()
    expect(ac.state).toBe('running')
    expect(ac.sources[0].stoppedAt).toBe(51)
    ac.currentTime = 51
    await vi.advanceTimersByTimeAsync(1000)
    expect(started(ac).at(-1)).toEqual(['music/desert-city.m4a', 51])
  })

  it('makes no sound and no context on a tap while Music is off', async () => {
    const { turn } = await load('title')
    turn('music', false)
    tap()
    await settle()
    expect(made).toHaveLength(0)
    turn('music', true)
  })
})
