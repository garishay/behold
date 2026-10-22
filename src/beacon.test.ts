import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { away, count, few, share, since, whenAway } from './beacon.ts'
import { turn } from './sound/settings.ts'

const sent = vi.fn<(url: string, body: string) => boolean>(() => true)

/** The game hidden, as a phone hides it when it's put away or switched from. */
const hide = () => {
  Object.defineProperty(document, 'hidden', { value: true, configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
  Object.defineProperty(document, 'hidden', { value: false, configurable: true })
}
const beacons = () => sent.mock.calls.map(([url, body]) => [url, JSON.parse(body)])

beforeEach(() => {
  Object.defineProperty(navigator, 'sendBeacon', { value: sent, configurable: true })
  vi.stubEnv('VITE_COUNTS_URL', 'https://counts.test')
  turn('counting', true)
  away()
  sent.mockClear()
})
afterEach(() => vi.unstubAllEnvs())

describe('the beacon (#7)', () => {
  it('sends what was counted as one beacon when the game is hidden, each count once, and starts over', () => {
    count('open', '', 'new')
    count('case', 'valley', 'new')
    count('hint', 'valley', '1/taps')
    count('hint', 'valley', '1/taps')
    hide()
    expect(beacons()).toEqual([
      [
        'https://counts.test/count',
        [
          ['open', '', 'new', 1],
          ['case', 'valley', 'new', 1],
          ['hint', 'valley', '1/taps', 2],
        ],
      ],
    ])
    hide()
    expect(sent).toHaveBeenCalledTimes(1)
  })

  it('counts where a case stands as the game is put away, before its beacon goes, until let go', () => {
    const letGo = whenAway(() => count('away', 'carmel', 'solve/all/half'))
    hide()
    letGo()
    hide()
    expect(beacons()).toEqual([
      ['https://counts.test/count', [['away', 'carmel', 'solve/all/half', 1]]],
    ])
  })

  it('counts nothing with Counting off, and drops what wasn’t sent yet', () => {
    count('open', '', 'back')
    turn('counting', false)
    count('begin')
    const letGo = whenAway(() => count('away', 'valley', 'look/some/none'))
    hide()
    letGo()
    expect(sent).not.toHaveBeenCalled()
    turn('counting', true)
    count('begin')
    hide()
    expect(beacons()).toEqual([['https://counts.test/count', [['begin', '', '', 1]]]])
  })

  it('sends nothing from the dev server unless a dev shell names a service', () => {
    vi.unstubAllEnvs()
    count('open', '', 'new')
    hide()
    expect(sent).not.toHaveBeenCalled()
  })

  it('says a time, a share, and a number in a few words each', () => {
    const now = vi.spyOn(performance, 'now')
    const at = (ms: number) => (now.mockReturnValue(ms), since(0))
    expect([29_999, 30_000, 59_999, 60_000, 119_999, 120_000, 299_999, 300_000].map(at)).toEqual([
      '<30s',
      '<1m',
      '<1m',
      '<2m',
      '<2m',
      '<5m',
      '<5m',
      '5m+',
    ])
    now.mockRestore()
    expect([0, 1, 6, 7, 13, 14].map((n) => share(n, 14))).toEqual([
      'none',
      'some',
      'some',
      'half',
      'half',
      'all',
    ])
    expect([0, 1, 2, 3, 9].map(few)).toEqual(['0', '1', '2', '3+', '3+'])
  })
})
