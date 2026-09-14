import { describe, expect, it, vi } from 'vitest'
import { sting } from './sting.ts'

describe('the sting (#6)', () => {
  it('plays three rising notes where audio exists, and stays silent where it does not', () => {
    const started: number[] = []
    const notes: number[] = []
    class FakeContext {
      currentTime = 0
      destination = {}
      createOscillator() {
        return {
          type: '',
          frequency: {
            set value(hz: number) {
              notes.push(hz)
            },
          },
          connect() {},
          start(at: number) {
            started.push(at)
          },
          stop() {},
        }
      }
      createGain() {
        return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }
      }
    }
    vi.stubGlobal('AudioContext', FakeContext)
    try {
      sting()
      expect(notes).toEqual([392, 523.25, 659.25])
      expect(started).toEqual([0, 0.18, 0.36])
    } finally {
      vi.unstubAllGlobals()
    }
    expect(() => sting()).not.toThrow()
  })
})
