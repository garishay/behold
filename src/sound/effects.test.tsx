import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { cases } from '../cases/index.ts'
import { fresh } from '../player/state.ts'
import { play } from './engine.ts'
import { useCue } from './music.ts'
import { turn } from './settings.ts'

vi.mock('./engine.ts', () => ({ play: vi.fn() }))
vi.mock('./music.ts', () => {
  const useCue = vi.fn()
  return { useCue, Music: ({ cue }: { cue: string | null }) => (useCue(cue), null) }
})

const played = vi.mocked(play)
/** The cue the screen on show last asked for. */
const cue = () => vi.mocked(useCue).mock.calls.at(-1)?.[0]
/** The effects played since the last call, in order. */
const heard = () => {
  const calls = played.mock.calls.map(([effect]) => effect)
  played.mockClear()
  return calls
}
const tapSpot = (id: string) => fireEvent.click(document.querySelector(`[data-spot="${id}"]`)!)
const openCase = (title: RegExp) => fireEvent.click(screen.getByRole('button', { name: title }))
const tab = (name: RegExp) => fireEvent.click(screen.getByRole('tab', { name }))
const chip = (word: string) =>
  fireEvent.click(within(document.querySelector('.chips')!).getByRole('button', { name: word }))
const slot = (id: string) => fireEvent.click(document.querySelector(`[data-slot="${id}"]`)!)
const tile = (name: string) =>
  fireEvent.click([...document.querySelectorAll('.tile')].find((t) => t.textContent === name)!)
const orderSlot = (i: number) => fireEvent.click(document.querySelectorAll('.oslot')[i])
const moment = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${name}`) }))
const closeTheCase = () => fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
const result = () => document.querySelector('.bank-head')
/** The valley's guided steps, as they hold the screen, and Look again once they are done (#77). */
const guided = async () => {
  tapSpot('boy')
  fireEvent.click(document.querySelector('.dock')!)
  tab(/Solve/)
  for (const [id, word] of [
    ['d1', 'David'],
    ['t4', 'sling'],
  ]) {
    slot(id)
    chip(word)
  }
  tab(/Look/)
  await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
}

/** Every case after the valley already started, so each opens whatever comes before it (#75). */
const laterStarted = Object.fromEntries(
  cases.slice(1).map(({ structure }) => [structure.id, fresh(structure)]),
)

/** The app opened on its title, and past it with Begin (#75), over the progress the device holds. */
const start = (app = <App />, kept?: object) => {
  if (kept) localStorage.setItem('behold.progress', JSON.stringify(kept))
  const rendered = render(app)
  fireEvent.click(screen.getByRole('button', { name: 'Begin' }))
  return rendered
}

beforeEach(() => {
  localStorage.clear()
  history.replaceState(null, '')
  played.mockClear()
})

afterEach(() => {
  turn('music', true)
  turn('effects', true)
})

// Each effect is asserted beside the screen change it repeats, so a player with sound off, or who
// can't hear, loses nothing but the sound (Gate 10 A5, #8).
describe('the effects, each beside what the screen shows (Gate 10 A3, A5)', () => {
  it('found on a spot’s first tap, beside its caption; a spot tapped again is silent', () => {
    start()
    openCase(/The valley/)
    tapSpot('boy')
    expect(heard()).toEqual(['found'])
    expect(screen.getByText(/Found:/)).toHaveTextContent('Found: David, sling')
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveTextContent('Look1/6')
    tapSpot('boy')
    expect(heard()).toEqual([])
  })

  it('paper, not found, on the tap that copies a paper, beside the paper; again, silent', () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    moment('Bedchamber')
    expect(heard()).toEqual([])
    tapSpot('seal')
    expect(heard()).toEqual(['paper'])
    expect(screen.getByRole('dialog', { name: 'The seal' })).toBeInTheDocument()
    expect(screen.getByText(/Found:/)).toHaveTextContent('copied to Papers')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    tapSpot('seal')
    expect(heard()).toEqual([])
  })

  it('place when a word lands in its slot; picking up, emptying, and a refused word are silent', async () => {
    start()
    openCase(/The valley/)
    await guided()
    tapSpot('giant')
    heard()
    tab(/Solve/)
    chip('Goliath')
    expect(heard()).toEqual([])
    slot('d2')
    expect(heard()).toEqual(['place'])
    expect(document.querySelector('[data-slot="d2"]')).toHaveTextContent('Goliath')
    slot('d2')
    expect(heard()).toEqual([])
    expect(document.querySelector('[data-slot="d2"]')).not.toHaveTextContent('Goliath')
    slot('t3')
    chip('David')
    expect(result()).toHaveTextContent('That blank wants a number.')
    expect(heard()).toEqual([])
  })

  it('place for a picture set in the order, the same sound wherever it goes', () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    tab(/Solve/)
    tile('The gate')
    orderSlot(0)
    expect(heard()).toEqual(['place'])
    expect(document.querySelectorAll('.oslot')[0]).toHaveTextContent('The gate')
  })

  it('not yet on a wrong close, beside how far off; the close on the right one, beside the reveal', () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    for (const s of ['man-rows', 'cord', 'prophet', 'balcony']) tapSpot(s)
    moment('Bedchamber')
    for (const s of ['window', 'seal', 'purse']) tapSpot(s)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    moment('The gate')
    for (const s of ['letter', 'law']) tapSpot(s)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    tab(/Solve/)
    for (const [id, word] of [
      ['p1', 'Ahab'],
      ['p2', 'Jezebel'],
      ['p3', 'Naboth'],
      ['s1', 'vineyard'],
      ['s2', 'garden'],
      ['s3', 'inheritance'],
      ['s4', 'Jezebel'],
      ['s5', 'the king'],
      ['v1', 'killed'],
      ['v2', 'taken possession'],
    ]) {
      chip(word)
      slot(id)
    }
    tile('Bedchamber')
    orderSlot(0)
    tile('The gate')
    orderSlot(1)
    tile('The vineyard')
    orderSlot(2)
    heard()
    closeTheCase()
    expect(heard()).toEqual(['notYet'])
    expect(result()).toHaveTextContent('One or two don’t match what the pictures show.')
    for (const [id, word] of [
      ['s1', 'garden'],
      ['s2', 'vineyard'],
    ]) {
      slot(id)
      chip(word)
      slot(id)
    }
    heard()
    closeTheCase()
    expect(heard()).toEqual(['close'])
    expect(screen.getByRole('heading', { name: 'The case is closed.' })).toBeInTheDocument()
  })

  it('is silent on the brief’s Start, the picker, Zoom, Look and Solve, and the menu', () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    moment('Bedchamber')
    fireEvent.click(screen.getByRole('button', { name: 'Zoom' }))
    tab(/Solve/)
    tab(/Look/)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(heard()).toEqual([])
  })
})

describe('the music by screen (Gate 10 A2)', () => {
  it('asks for the title theme, the case bed on Look and Solve, quiet on the reveal, and the theme again', async () => {
    // The title asks for its theme, so Begin, the first tap, is the one that starts it (#75).
    render(<App />)
    expect(cue()).toBe('title')
    fireEvent.click(screen.getByRole('button', { name: 'Begin' }))
    expect(cue()).toBe('title')
    openCase(/The valley/)
    expect(cue()).toBe('case')
    await guided()
    for (const s of ['giant', 'brook', 'armor', 'basket', 'bearer']) tapSpot(s)
    tab(/Solve/)
    expect(cue()).toBe('case')
    for (const [id, word] of [
      ['d1', 'David'],
      ['d2', 'Goliath'],
      ['t1', 'brothers'],
      ['t2', 'Saul'],
      ['t3', 'six'],
      ['t4', 'sling'],
      ['t5', 'Goliath'],
    ]) {
      chip(word)
      slot(id)
    }
    closeTheCase()
    expect(heard().at(-1)).toBe('close')
    expect(screen.getByRole('heading', { name: 'The case is closed.' })).toBeInTheDocument()
    expect(cue()).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Back to cases' }))
    await waitFor(() => expect(cue()).toBe('title'))
  })

  it('credits the music under the notice, each piece by name, with the licence linked', () => {
    start()
    const credit = document.querySelector('.notice + .credit')
    expect(credit).toHaveTextContent(
      'Music: “Desert City” and “Lamentation” by Kevin MacLeod (incompetech.com), edited, CC BY 4.0',
    )
    expect(within(credit as HTMLElement).getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by/4.0/',
    )
  })
})

describe('the sound switches (Gate 10 A4)', () => {
  it('shows Music and Effects on the cases page and in the menu, both on, each its own', () => {
    start()
    const music = screen.getByRole('button', { name: 'Music' })
    const effects = screen.getByRole('button', { name: 'Effects' })
    expect(music).toHaveAttribute('aria-pressed', 'true')
    expect(effects).toHaveTextContent('Effects · On')
    fireEvent.click(effects)
    expect(effects).toHaveAttribute('aria-pressed', 'false')
    expect(effects).toHaveTextContent('Effects · Off')
    expect(music).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('behold.effects')).toBe('off')
    openCase(/The valley/)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    const menu = within(screen.getByRole('dialog', { name: 'Menu' }))
    expect(menu.getByRole('button', { name: 'Effects' })).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(menu.getByRole('button', { name: 'Music' }))
    expect(menu.getByRole('button', { name: 'Music' })).toHaveTextContent('Music · Off')
  })

  // An iPhone's silent mode mutes the game whatever the switches say (A4 as ruled), and no web page
  // can read it, so on an iPhone, and only there, the switches say so (#72).
  it('says under the switches that silent mode mutes the game, on an iPhone only', () => {
    const line = 'Silent mode mutes the game on iPhone.'
    const { unmount } = start()
    expect(screen.queryByText(line)).toBeNull()
    unmount()
    const agent = vi
      .spyOn(navigator, 'userAgent', 'get')
      .mockReturnValue(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
      )
    try {
      start()
      expect(screen.getByText(line).closest('.switches')).not.toBeNull()
      openCase(/The valley/)
      fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
      expect(within(screen.getByRole('dialog', { name: 'Menu' })).getByText(line)).toBeVisible()
    } finally {
      agent.mockRestore()
    }
  })
})
