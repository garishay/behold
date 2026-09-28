import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * A stand-in for Web Audio, recording what the engine asks of it: each context made, each file
 * decoded, each buffer started, and each suspend and resume. Its clock is set by the test.
 */
const made: FakeContext[] = []
class FakeContext {
  state = 'suspended'
  currentTime = 0
  destination = {}
  started: string[] = []
  calls: string[] = []
  constructor() {
    made.push(this)
  }
  resume() {
    this.calls.push('resume')
    this.state = 'running'
    return Promise.resolve()
  }
  suspend() {
    this.calls.push('suspend')
    this.state = 'suspended'
    return Promise.resolve()
  }
  decodeAudioData(bytes: { file: string }) {
    return Promise.resolve({ decoded: bytes.file })
  }
  createBufferSource() {
    const source = {
      buffer: null as { decoded: string } | null,
      connect: () => {},
      start: () => this.started.push(source.buffer!.decoded),
    }
    return source
  }
}

let fetched: string[] = []
let failing = new Set<string>()
const fakeFetch = (url: string) => {
  fetched.push(url)
  const file = url.slice(url.lastIndexOf('/') + 1)
  if (failing.has(file)) return Promise.reject(new TypeError('offline'))
  return Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve({ file }) })
}
const settle = () => new Promise((r) => setTimeout(r, 0))
const hide = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', { value: hidden, configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
}

/** The engine and its settings fresh, as on a new visit: the context is made once per page. */
const load = async () => {
  vi.resetModules()
  return {
    ...(await import('./engine.ts')),
    ...(await import('./settings.ts')),
  }
}

beforeEach(() => {
  localStorage.clear()
  made.length = 0
  fetched = []
  failing = new Set()
  vi.stubGlobal('AudioContext', FakeContext)
  vi.stubGlobal('fetch', fakeFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  Reflect.deleteProperty(navigator, 'audioSession')
  Reflect.deleteProperty(document, 'hidden')
})

describe('the sound engine (Gate 10 A4)', () => {
  it('makes one context on the first sound, ambient first, and decodes each effect once', async () => {
    const session = { type: 'auto' }
    Object.defineProperty(navigator, 'audioSession', { value: session, configurable: true })
    const { play } = await load()
    expect(made).toHaveLength(0)
    play('found')
    expect(session.type).toBe('ambient')
    await settle()
    play('place')
    play('found')
    await settle()
    expect(made).toHaveLength(1)
    expect(made[0].state).toBe('running')
    expect(made[0].started).toEqual(['found.m4a', 'place.m4a', 'found.m4a'])
    expect(fetched.sort()).toEqual(
      ['close.m4a', 'found.m4a', 'not-yet.m4a', 'paper.m4a', 'place.m4a'].map((f) => `/audio/${f}`),
    )
  })

  it('is silent while Effects is off, and the switch is kept for the next visit', async () => {
    const first = await load()
    first.turn('effects', false)
    first.play('close')
    const next = await load()
    expect(next.isOn('effects')).toBe(false)
    expect(next.isOn('music')).toBe(true)
    next.play('close')
    await settle()
    expect(made).toHaveLength(0)
  })

  it('retries a file whose fetch failed on its next play', async () => {
    failing.add('paper.m4a')
    const { play } = await load()
    play('paper')
    await settle()
    expect(made[0].started).toEqual([])
    failing.clear()
    play('paper')
    await settle()
    expect(made[0].started).toEqual(['paper.m4a'])
  })

  it('suspends while the app is hidden, and a resume whose clock stands still goes again', async () => {
    const { play } = await load()
    play('found')
    await settle()
    const ac = made[0]
    ac.calls = []
    vi.useFakeTimers()
    hide(true)
    expect(ac.calls).toEqual(['suspend'])
    hide(false)
    await vi.advanceTimersByTimeAsync(250)
    // The clock never moved, as on an iPhone whose context came back silent.
    expect(ac.calls).toEqual(['suspend', 'resume', 'suspend', 'resume'])
    ac.calls = []
    hide(true)
    hide(false)
    await vi.advanceTimersByTimeAsync(100)
    ac.currentTime = 1
    await vi.advanceTimersByTimeAsync(150)
    expect(ac.calls).toEqual(['suspend', 'resume'])
    // Hidden again before the check: the check leaves the context suspended.
    ac.calls = []
    hide(true)
    hide(false)
    await vi.advanceTimersByTimeAsync(100)
    hide(true)
    await vi.advanceTimersByTimeAsync(150)
    expect(ac.calls).toEqual(['suspend', 'resume', 'suspend'])
    expect(ac.state).toBe('suspended')
  })

  it('stays silent, and throws nothing, where the browser has no Web Audio', async () => {
    vi.stubGlobal('AudioContext', undefined)
    const { play } = await load()
    expect(() => play('close')).not.toThrow()
  })
})
