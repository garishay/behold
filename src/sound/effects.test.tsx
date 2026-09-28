import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { play } from './engine.ts'
import { turn } from './settings.ts'

vi.mock('./engine.ts', () => ({ play: vi.fn() }))

const played = vi.mocked(play)
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
    render(<App />)
    openCase(/The valley/)
    tapSpot('boy')
    expect(heard()).toEqual(['found'])
    expect(screen.getByText(/Found:/)).toHaveTextContent('Found: David, sling')
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveTextContent('Look1/6')
    tapSpot('boy')
    expect(heard()).toEqual([])
  })

  it('paper, not found, on the tap that copies a paper, beside the paper; again, silent', () => {
    render(<App />)
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

  it('place when a word lands in its slot; picking up, emptying, and a refused word are silent', () => {
    render(<App />)
    openCase(/The valley/)
    for (const s of ['boy', 'giant']) tapSpot(s)
    heard()
    tab(/Solve/)
    chip('David')
    expect(heard()).toEqual([])
    slot('d1')
    expect(heard()).toEqual(['place'])
    expect(document.querySelector('[data-slot="d1"]')).toHaveTextContent('David')
    slot('d1')
    expect(heard()).toEqual([])
    expect(document.querySelector('[data-slot="d1"]')).not.toHaveTextContent('David')
    slot('t1')
    chip('David')
    expect(result()).toHaveTextContent('That blank wants a number.')
    expect(heard()).toEqual([])
  })

  it('place for a picture set in the order, the same sound wherever it goes', () => {
    render(<App />)
    openCase(/The vineyard/)
    tab(/Solve/)
    tile('The gate')
    orderSlot(0)
    expect(heard()).toEqual(['place'])
    expect(document.querySelectorAll('.oslot')[0]).toHaveTextContent('The gate')
  })

  it('not yet on a wrong close, beside how far off; the close on the right one, beside the reveal', () => {
    render(<App />)
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
    expect(result()).toHaveTextContent('One or two are wrong.')
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
    render(<App />)
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

describe('the sound switches (Gate 10 A4)', () => {
  it('shows Music and Effects on the title screen and in the menu, both on, each its own', () => {
    render(<App />)
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
})
