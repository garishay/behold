import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { carmel } from './cases/carmel/case.ts'
import { cases } from './cases/index.ts'
import { micaiah } from './cases/micaiah/case.ts'
import type { CaseStructure } from './cases/types.ts'
import { valley } from './cases/valley/case.ts'
import { vineyard } from './cases/vineyard/case.ts'
import type { PassageService } from './passages/service.ts'
import { stuck } from './player/hints.ts'
import { fresh } from './player/state.ts'

/**
 * Every case after the valley already started, so each opens whatever comes before it (#75, Gate
 * 21 A5): a started case stays open, and fresh progress plays as a first visit does.
 */
const laterStarted = Object.fromEntries(
  cases.slice(1).map(({ structure }) => [structure.id, fresh(structure)]),
)
/** The vineyard started before the valley was closed, which keeps it open (#75). */
const vineyardStarted = { vineyard: fresh(vineyard) }
/**
 * A case closed as a player closes it: every spot found, and every face, place, and blank holding
 * its answer. A closed case that would find something wrong loads open again (#12 [Q13]).
 */
const closedCase = (s: CaseStructure) => {
  const spots = s.moments.flatMap((m) => m.spots)
  return {
    ...fresh(s),
    tapped: spots.map((x) => x.id),
    bank: [...new Set(spots.flatMap((x) => x.words))],
    papers: [...new Set(spots.flatMap((x) => (x.paper === undefined ? [] : [x.paper])))],
    faces: Object.fromEntries(s.faces.map((f) => [f.id, f.answer])),
    order: [...(s.order ?? [])],
    fills: Object.fromEntries(s.blocks.flatMap((b) => Object.entries(b.blanks))),
    step: (s.steps?.length ?? 1) - 1,
    solved: true,
  }
}

/** The app opened on its title, and past it with Begin (#75), over the progress the device holds. */
const start = (app = <App />, kept?: object) => {
  if (kept) localStorage.setItem('behold.progress', JSON.stringify(kept))
  const rendered = render(app)
  fireEvent.click(screen.getByRole('button', { name: 'Begin' }))
  return rendered
}

const tapSpot = (id: string) => {
  const spot = document.querySelector(`[data-spot="${id}"]`)
  expect(spot, id).not.toBeNull()
  fireEvent.click(spot!)
}
const openCase = (title: RegExp) => fireEvent.click(screen.getByRole('button', { name: title }))
const tab = (name: RegExp) => fireEvent.click(screen.getByRole('tab', { name }))
const chips = () => within(document.querySelector('.chips')!).queryAllByRole('button')
const chip = (word: string) =>
  fireEvent.click(within(document.querySelector('.chips')!).getByRole('button', { name: word }))
const slot = (id: string) => fireEvent.click(document.querySelector(`[data-slot="${id}"]`)!)
const tile = (name: string) =>
  fireEvent.click([...document.querySelectorAll('.tile')].find((t) => t.textContent === name)!)
const orderSlot = (i: number) => fireEvent.click(document.querySelectorAll('.oslot')[i])
// A picker button's name begins with its moment's; a moment with something left says so after it.
const moment = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${name}`) }))
const menu = (item: string) => {
  fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
  fireEvent.click(
    within(screen.getByRole('dialog', { name: 'Menu' })).getByRole('button', { name: item }),
  )
}
// A close's result, like a refused word's message, takes the bank's head (07c, #24 [3]).
const result = () => document.querySelector('.bank-head')
const coach = () => document.querySelector('.coach')

/** A passage service for the tests: made-up words with verse numbers, never scripture. */
const numbered: PassageService = () =>
  Promise.resolve({
    verses: [
      { number: 38, text: 'One thing.' },
      { number: 39, text: 'Another thing.' },
      { text: 'A line with no number.' },
    ],
  })

/**
 * A passage service that numbers each verse of the range asked for, a whole chapter as 1 to 29:
 * made-up words, never scripture.
 */
const versed: PassageService = ({ from = 1, to = 29 }) =>
  Promise.resolve({
    verses: Array.from({ length: to - from + 1 }, (_, i) => ({
      number: from + i,
      text: `Made-up words, verse ${from + i}.`,
    })),
  })

/** The tutorial's answers, faces and blanks. */
const valleyAnswers: [string, string][] = [
  ['d1', 'David'],
  ['d2', 'Goliath'],
  ['t1', 'brothers'],
  ['t2', 'Saul'],
  ['t3', 'six'],
  ['t4', 'sling'],
  ['t5', 'Goliath'],
]

/**
 * The valley's guided steps after the boy's tap, as they hold the screen (#77): the dock's line
 * read, Solve opened, the slot under the boy and then David, sling's blank and then sling. The
 * player is left on Solve, where free play starts.
 */
const guideOn = () => {
  fireEvent.click(document.querySelector('.dock')!)
  tab(/Solve/)
  for (const [id, word] of [
    ['d1', 'David'],
    ['t4', 'sling'],
  ] as const) {
    slot(id)
    chip(word)
  }
}
/** The valley's guided steps, from the boy's tap (#77). */
const guide = () => {
  tapSpot('boy')
  guideOn()
}
/**
 * The valley's guided steps, then every other spot found, and back on Solve with the bank full.
 * Look's button from Solve steps back in the history, and jsdom lands the step on a later task,
 * so the sweep waits for it before Solve is opened again (#77).
 */
const sweep = async () => {
  guide()
  tab(/Look/)
  await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
  for (const s of ['giant', 'brook', 'armor', 'basket', 'bearer']) tapSpot(s)
  tab(/Solve/)
}

/** The tutorial played through: its guided steps, every spot found, every slot right, closed. */
const solveTheValley = async () => {
  await sweep()
  for (const [id, word] of valleyAnswers) {
    chip(word)
    slot(id)
  }
  fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
}

beforeEach(() => {
  localStorage.clear()
  // One jsdom window serves the file, so the entry a test pushed must not open a case in the next.
  history.replaceState(null, '')
})

const cards = () => screen.getAllByRole('button').filter((b) => b.classList.contains('case-card'))

describe('the title (#75)', () => {
  it('shows first when the app opens on the cases page: the picture, the name, the line, and Begin', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Behold' })).toBeInTheDocument()
    expect(screen.getByText('Bible Mystery Game')).toBeInTheDocument()
    expect(document.querySelector('.title-picture')).toHaveAttribute(
      'src',
      expect.stringMatching(/^\/title\.jpg\?v=[0-9a-f]{8}$/),
    )
    // The line is one string, set a sentence to a line on the title alone (Gate 20 A3).
    const line = document.querySelector('.line')
    expect(line).toHaveTextContent("Look closer.There's more to every story.")
    expect([...line!.children].map((s) => [s.tagName, s.textContent])).toEqual([
      ['SPAN', 'Look closer.'],
      ['SPAN', "There's more to every story."],
    ])
    expect(screen.getByRole('button', { name: 'Begin' })).toBeInTheDocument()
    expect(screen.getByText('Best with sound on.')).toBeInTheDocument()
    expect(document.querySelector('.case-card')).toBeNull()
  })

  it('gives way to the cases page on Begin, adding no history entry', () => {
    render(<App />)
    const entries = history.length
    fireEvent.click(screen.getByRole('button', { name: 'Begin' }))
    expect(screen.queryByRole('button', { name: 'Begin' })).not.toBeInTheDocument()
    expect(cards()).toHaveLength(4)
    expect([history.length, history.state]).toEqual([entries, null])
  })

  it('takes its time leaving, then goes, unless the player asks for reduced motion', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    try {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: 'Begin' }))
      const title = document.querySelector('.title')
      expect(title).toHaveClass('leaving')
      expect(title).toHaveAttribute('inert')
      expect(document.querySelector('.screen')).toHaveClass('arriving')
      act(() => vi.advanceTimersByTime(1600))
      expect(document.querySelector('.title')).toBeNull()
      expect(document.querySelector('.screen')).not.toHaveClass('arriving')
    } finally {
      vi.useRealTimers()
    }
  })

  // A quick second tap on Begin lands where the cases page now is. While the way out plays, the
  // page takes no tap until it ends, so no card takes one before it can be seen; under reduced
  // motion, where the page shows at once, it takes none for half a second (Gate 21 A2 as amended).
  // jsdom has no hit testing, so the test holds the page inert for that time; a browser lets no tap
  // through it.
  it('takes no tap on the cases page until the way out ends, or for half a second after a cut', () => {
    vi.useFakeTimers()
    try {
      for (const [reduce, ms] of [
        [true, 500],
        [false, 1600],
      ] as const) {
        vi.stubGlobal('matchMedia', () => ({ matches: reduce }))
        const { unmount } = render(<App />)
        fireEvent.click(screen.getByRole('button', { name: 'Begin' }))
        const page = document.querySelector('.screen')
        expect(page, `reduce ${reduce}`).toHaveAttribute('inert')
        act(() => vi.advanceTimersByTime(ms - 1))
        expect(page, `reduce ${reduce}`).toHaveAttribute('inert')
        act(() => vi.advanceTimersByTime(1))
        expect(page, `reduce ${reduce}`).not.toHaveAttribute('inert')
        unmount()
      }
    } finally {
      vi.useRealTimers()
    }
  })

  it('never shows on a reload inside a case, nor on the way back from one', async () => {
    const { unmount } = start()
    openCase(/The valley/)
    unmount()
    render(<App />)
    expect(screen.getByRole('dialog', { name: 'The valley' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Begin' })).not.toBeInTheDocument()
    menu('Cases')
    await waitFor(() => expect(cards()).toHaveLength(4))
    expect(screen.queryByRole('button', { name: 'Begin' })).not.toBeInTheDocument()
  })

  it('follows “Best with sound on.” with the silent-mode sentence on an iPhone only', () => {
    const lines = () =>
      [...document.querySelector('.sound-line')!.children].map((s) => s.textContent)
    const { unmount } = render(<App />)
    expect(lines()).toEqual(['Best with sound on.'])
    unmount()
    const agent = vi
      .spyOn(navigator, 'userAgent', 'get')
      .mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) Mobile/15E148')
    try {
      render(<App />)
      expect(lines()).toEqual(['Best with sound on.', 'Silent mode mutes the game on iPhone.'])
    } finally {
      agent.mockRestore()
    }
  })
})

describe('the cases page (Gate 01 A6, #6, #75)', () => {
  it('keeps the name in its header, then the cases, then the epigraph with its notice', () => {
    start()
    expect(screen.getByRole('heading', { level: 1, name: 'Behold' })).toBeInTheDocument()
    const order = [...document.querySelectorAll('.screen > *')].map((e) => e.className)
    expect(order.indexOf('case-list')).toBeLessThan(order.indexOf('epigraph'))
    expect(
      screen.getByText(
        'It is the glory of God to conceal things, but the glory of kings is to search things out.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Proverbs 25:2, ESV')).toBeInTheDocument()
    expect(
      screen.getByText(/Scripture quotations are from the ESV® Bible .* All rights reserved\./),
    ).toBeInTheDocument()
    // The line lives on the title now.
    expect(document.querySelector('.line')).toBeNull()
    expect(screen.getByText('Season one is being written.')).toBeInTheDocument()
  })

  it('lists every registered case as a card, the tutorial first', () => {
    start()
    expect(cards().map((c) => c.querySelector('.ct')?.textContent)).toEqual([
      'The valley',
      'The mountain',
      'The vineyard',
      'The battle',
    ])
    expect(cards()[0]).toHaveTextContent('Learn to play')
    expect(screen.queryByText('In progress')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link').map((l) => l.textContent)).toEqual(['CC BY 4.0'])
  })

  // Playtest 2's second session (#77): the valley teaches the game and the cases after it are one
  // story, the house of Ahab, so the season is named over them and they count within it. The cards
  // give no time, and what is still being written sits under the season's last case.
  it('names the season over the cases after the valley, counted within it, and no times', () => {
    start()
    const list = document.querySelector('.case-list')!
    expect([...list.children].map((e) => e.querySelector('.ct, h2')?.textContent)).toEqual([
      'The valley',
      'Season one',
      'The mountain',
      'The vineyard',
      'The battle',
    ])
    const head = list.querySelector('.season-head')!
    expect(within(head as HTMLElement).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Season one',
    )
    expect(head).toHaveTextContent('The house of Ahab')
    // The season's name rises with its first case as Begin gives way (#75 A2).
    expect(head).toHaveStyle({ '--i': '1' })
    expect(cards().map((c) => c.querySelector('.cs')?.textContent)).toEqual([
      'Learn to play · take your time',
      'Case one',
      'Case two',
      'Case three',
    ])
    expect(list.nextElementSibling).toHaveTextContent('Season one is being written.')
  })
})

describe('the season in order (#75)', () => {
  const statuses = () => cards().map((c) => c.querySelector('.done')?.textContent ?? '')
  const locked = () => cards().map((c) => c.getAttribute('aria-disabled') === 'true')
  /** The first `n` cases closed, as the device keeps them. */
  const closedTo = (n: number) =>
    Object.fromEntries(
      cases.slice(0, n).map(({ structure }) => [structure.id, closedCase(structure)]),
    )

  it('locks each case until the one before it is closed, each naming that case', () => {
    start()
    expect(statuses()).toEqual([
      'Start here',
      'Opens after the valley',
      'Opens after the mountain',
      'Opens after the vineyard',
    ])
    expect(locked()).toEqual([false, true, true, true])
    expect(cards()[0]).toHaveClass('first')
  })

  it('a locked card opens nothing: it lights the valley and says why, for a few seconds', () => {
    vi.useFakeTimers()
    try {
      start()
      openCase(/The battle/)
      expect(document.querySelector('.app')).toBeNull()
      expect(history.state).toBeNull()
      expect(cards()[0]).toHaveClass('lit')
      expect(screen.getByRole('status')).toHaveTextContent(
        'Start with the valley. It teaches the game.',
      )
      act(() => vi.advanceTimersByTime(3000))
      expect(cards()[0]).not.toHaveClass('lit')
      expect(screen.getByRole('status')).toBeEmptyDOMElement()
    } finally {
      vi.useRealTimers()
    }
  })

  it('past the valley, a locked card lights the case to play first and names it', () => {
    start(<App />, closedTo(1))
    openCase(/The battle/)
    expect(document.querySelector('.app')).toBeNull()
    expect(cards().map((c) => c.classList.contains('lit'))).toEqual([false, true, false, false])
    expect(screen.getByRole('status')).toHaveTextContent(
      'Play the mountain first. The story runs in order.',
    )
    // The gold edge and "Start here" are the valley's alone.
    expect(cards()[1]).not.toHaveClass('first')
    expect(statuses()[1]).toBe('')
  })

  it('keeps open a case already started, and the valley in progress loses its edge', () => {
    start(<App />, { vineyard: fresh(vineyard), valley: fresh(valley) })
    expect(statuses()).toEqual([
      'In progress',
      'Opens after the valley',
      'In progress',
      'Opens after the vineyard',
    ])
    expect(locked()).toEqual([false, true, false, true])
    expect(cards()[0]).not.toHaveClass('first')
  })

  it('closing each case opens the next; a restart locks again what follows it, unless started', () => {
    for (const n of [1, 2, 3]) {
      const { unmount } = start(<App />, closedTo(n))
      expect(locked(), `${n} closed`).toEqual(cases.map((_, i) => i > n))
      unmount()
    }
    // The mountain restarted, so no longer closed: the vineyard, never opened, waits for it again,
    // and the battle, started, stays open.
    start(<App />, { ...closedTo(1), carmel: fresh(carmel), micaiah: fresh(micaiah) })
    expect(locked()).toEqual([false, false, true, false])
    expect(statuses()[2]).toBe('Opens after the mountain')
  })
})

describe('the case screen explored (#6, 03b; #24)', () => {
  it('opens a fresh case on Look, the brief’s card over the picture, Look and Solve at the foot', () => {
    start()
    openCase(/The valley/)
    expect(screen.getByRole('dialog', { name: 'The valley' })).toHaveTextContent(
      /A giant lies face-down/,
    )
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Look0/6', 'Solve0/7'])
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveAttribute('aria-selected', 'true')
    expect(coach()).toBeNull()
    expect(screen.getByText('Tap anything that looks like it matters.')).toBeInTheDocument()
    expect(document.querySelector('.bank')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(coach()).toHaveTextContent('Tap the boy with the sling.')
  })

  // The evidence promised, up front (#77): the paid round's first tester felt "tested on biblical
  // knowledge", so the tutorial's card says under its brief that the answers are in the picture,
  // and a case without steps carries no such line.
  it('the tutorial’s card says the answers are in the picture, and no other card does', async () => {
    start(<App />, laterStarted)
    openCase(/The valley/)
    const how = 'You don’t need to remember the story. Everything you need is in the picture.'
    expect(screen.getByRole('dialog', { name: 'The valley' })).toHaveTextContent(how)
    menu('Cases')
    fireEvent.click(await screen.findByRole('button', { name: /The mountain/ }))
    expect(screen.getByRole('dialog', { name: 'The mountain' })).not.toHaveTextContent(how)
  })

  // At the new floor, 360 × 548, a case of several moments lays its picture out 247 px wide, and
  // the mountain's card, inside it, hid its Start under the dock (#77). The card lies over the
  // picture's whole row instead, so the height that narrows the picture leaves the card its width.
  it('the brief’s card lies over the picture’s whole row, not inside its frame', () => {
    start(<App />, laterStarted)
    openCase(/The mountain/)
    const card = screen.getByRole('dialog', { name: 'The mountain' })
    expect(card.parentElement).toHaveClass('stage-wrap')
  })

  // The mountain is the first case with more than one picture, and a picker's dot says more waits
  // there: its card says so under the brief, in the case's own words, and the valley's doesn't
  // (#77).
  it('the mountain’s card says what a dot means under its brief, and the valley’s does not', async () => {
    start(<App />, laterStarted)
    openCase(/The valley/)
    const note = 'Three pictures this time. A dot means more to find there.'
    expect(screen.getByRole('dialog', { name: 'The valley' })).not.toHaveTextContent(note)
    menu('Cases')
    fireEvent.click(await screen.findByRole('button', { name: /The mountain/ }))
    expect(screen.getByRole('dialog', { name: 'The mountain' })).toHaveTextContent(note)
  })

  it('the brief’s card goes with the first tap, and the menu holds the brief, a hint, Cases, Restart, and the switches', () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    tapSpot('cord')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    const sheet = screen.getByRole('dialog', { name: 'Menu' })
    expect(sheet).toHaveTextContent(/^The vineyardA man walks a vineyard/)
    expect(
      within(sheet)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Hint', 'Cases', 'Restart', 'Music · On', 'Effects · On'])
  })

  // The next round's first tester (#102): "Show me" sent him to the giant twice, and tapped again,
  // the giant said only that he is one of the faces. A tap that finds nothing new says what its
  // spot holds, the words a first tap left out because another spot had found them included.
  it('a tap that finds nothing new says what its spot holds', async () => {
    start()
    openCase(/The valley/)
    guide()
    tab(/Look/)
    await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
    const found = () => screen.getByText(/Found:/)
    tapSpot('giant')
    tapSpot('giant')
    expect(found()).toHaveTextContent(
      'Found: Goliath, six, spear, sword · one of the faces in Solve',
    )
    tapSpot('armor')
    expect(found()).toHaveTextContent(/^Found: Saul, king$/)
    tapSpot('armor')
    expect(found()).toHaveTextContent(/^Found: Saul, king, sword$/)
  })

  it('a tap shows the caption and what it found, and its words wait on Solve, ringed', () => {
    start()
    openCase(/The valley/)
    tapSpot('boy')
    expect(screen.getByText(/A shepherd boy in a plain tunic/)).toBeInTheDocument()
    expect(screen.getByText(/Found:/)).toHaveTextContent(
      'Found: David, sling · one of the faces in Solve',
    )
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveTextContent('Look1/6')
    expect(coach()).toHaveTextContent('That tap found his name, David, and sling.')
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent('Solve0/7+2')
    // The guided steps hold the screen until sling is in its blank (#77), and Solve opened by them
    // rings the two words its first time.
    guideOn()
    expect(chips().every((c) => c.classList.contains('is-new'))).toBe(true)
    tab(/Look/)
    tapSpot('giant')
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent('Solve2/7+4')
    tab(/Solve/)
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent(/^Solve2\/7$/)
    expect(chips().map((c) => c.textContent)).toEqual([
      'David',
      'sling',
      'Goliath',
      'six',
      'spear',
      'sword',
    ])
    expect(chips().filter((c) => c.classList.contains('is-new'))).toHaveLength(4)
    tab(/Look/)
    tapSpot('brook')
    tapSpot('boy')
    tab(/Solve/)
    const ringed = chips().filter((c) => c.classList.contains('is-new'))
    expect(ringed.map((c) => c.textContent)).toEqual(['stones', 'five'])
    // Solve tapped again is not Solve left: the rings stay (review round 1, #41).
    tab(/Solve/)
    expect(chips().filter((c) => c.classList.contains('is-new'))).toHaveLength(2)
  })

  it('a chip picked up is marked, and put down on a second tap', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    fireEvent.click(chips()[0])
    expect(chips()[0]).toHaveClass('is-on')
    fireEvent.click(chips()[0])
    expect(chips()[0]).not.toHaveClass('is-on')
  })

  it('the picker switches the moment and clears the caption; Zoom toggles', () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveTextContent('Look0/18')
    tapSpot('cord')
    expect(screen.getByText(/Servants stretching a cord/)).toBeInTheDocument()
    moment('Bedchamber')
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveTextContent('Look1/18')
    expect(screen.getByText('Tap anything that looks like it matters.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Bedchamber' })).toBeInTheDocument()
    const zoom = screen.getByRole('button', { name: 'Zoom' })
    expect(zoom).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(zoom)
    expect(zoom).toHaveAttribute('aria-pressed', 'true')
  })

  // Look counts the whole case, so a finished moment never reads as a finished case, and each
  // picker button says whether its moment has anything left (#24, ruling [5]).
  it('Look counts the whole case, and the picker marks each moment with something left', () => {
    const left = () =>
      screen
        .getAllByRole('button', { name: /something left to find/ })
        .map((b) => b.textContent?.replace('something left to find', ''))
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    expect(left()).toEqual(['The vineyard', 'Bedchamber', 'The gate'])
    for (const s of ['man-rows', 'cord', 'prophet', 'stain', 'balcony']) tapSpot(s)
    expect(left()).toEqual(['Bedchamber', 'The gate'])
    tab(/Solve/)
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveTextContent('Look5/18')
  })

  // Spots are drawn largest first, so the smaller of two overlapping boxes is on top and takes the
  // tap: the seal over the woman and the papyrus it overlaps, the pouch over the papyrus (#26 [7]).
  it('draws a moment’s spots largest first, whatever the file’s order', () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    moment('Bedchamber')
    const drawn = [...document.querySelectorAll<SVGElement>('[data-spot]')].map(
      (r) => r.dataset.spot,
    )
    expect(drawn).toEqual(['woman', 'man-bed', 'window', 'sheets', 'tray', 'purse', 'seal'])
  })

  // A tap on no spot goes to the nearest within 16 CSS px, so the seal's box hugs the ring and is
  // not padded (#27 [2]). The bedchamber laid out 320 px wide, as on a 360 phone: 5.2 px right of
  // the seal's box it takes the seal, though the woman's box is 10 px above and the papyrus's 14 px
  // below; on the empty rug it takes nothing.
  it('a tap just off a spot takes the nearest within a fingertip’s slip', () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    moment('Bedchamber')
    const svg = screen.getByRole('img', { name: 'Bedchamber' })
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 320, 400))
    fireEvent.click(svg, { clientX: 180, clientY: 380 })
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveTextContent('Look0/18')
    fireEvent.click(svg, { clientX: 250, clientY: 214 })
    expect(screen.getByRole('dialog', { name: 'The seal' })).toBeInTheDocument()
  })

  // The gate's stones stop where the seated man's hair begins (#63): the box ran down over his
  // head, and being the smaller it took a tap at his eyes. The gate laid out 320 px wide, as on a
  // 360 phone: at his eyes, 8 px under the stones' box, the tap is his.
  it('a tap at the seated man’s eyes at the gate finds him, not the stones', () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    moment('The gate')
    const svg = screen.getByRole('img', { name: 'The gate' })
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 320, 400))
    fireEvent.click(svg, { clientX: 161.6, clientY: 128 })
    expect(screen.getByText(/A grey-bearded man in the chief seat/)).toBeInTheDocument()
  })

  // jsdom lays nothing out, so the caption's overflow is given: taller than the dock for the giant,
  // not for the brook (#24).
  it('a caption longer than the dock shows More, which opens it whole until the next tap', () => {
    const tall = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
    tall.mockImplementation(function (this: HTMLElement) {
      return this.textContent?.startsWith('The Philistines') ? 90 : 0
    })
    try {
      start()
      openCase(/The valley/)
      guide()
      tab(/Look/)
      tapSpot('giant')
      const more = screen.getByRole('button', { name: 'More' })
      expect(more).toHaveAttribute('aria-expanded', 'false')
      fireEvent.click(more)
      expect(document.querySelector('.dock')).toHaveClass('is-open')
      expect(screen.getByRole('button', { name: 'Less' })).toHaveAttribute('aria-expanded', 'true')
      tapSpot('brook')
      expect(document.querySelector('.dock')).not.toHaveClass('is-open')
      expect(screen.queryByRole('button', { name: /More|Less/ })).not.toBeInTheDocument()
    } finally {
      tall.mockRestore()
    }
  })

  // The giant's sheathed sword is his own tap's: no spot inside his box, which at phone size read
  // as one thing already found (#37).
  it('the giant’s tap finds his sword, and no spot lies inside his box', () => {
    start()
    openCase(/The valley/)
    tapSpot('giant')
    expect(screen.getByText(/Found:/)).toHaveTextContent('Found: Goliath, six, spear, sword')
    expect(screen.getByText(/a sheathed sword at his side/)).toBeInTheDocument()
    expect(document.querySelector('[data-spot="sheath"]')).toBeNull()
  })

  it('a paper opens over the screen on the tap, and its copy lands in Papers', () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    moment('Bedchamber')
    tapSpot('seal')
    expect(screen.getByRole('dialog', { name: 'The seal' })).toHaveTextContent(
      'BELONGING TO AHAB, KING.',
    )
    expect(screen.getByText(/Found:/)).toHaveTextContent('Found: Ahab, seal · copied to Papers')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    tab(/Solve/)
    const papers = screen.getByRole('button', { name: /Papers/ })
    expect(papers).toHaveTextContent('Papers1')
    // Held above the account, not scrolled away with who is who (#24, ruling [4]).
    expect(papers.closest('.solve')).toBeNull()
    fireEvent.click(papers)
    expect(screen.getByRole('dialog', { name: 'Papers' })).toHaveTextContent(
      /^The sealIts impression reads: BELONGING TO AHAB, KING\.Close$/,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // A second tap on the seal opens the paper again but copies nothing, and the line says nothing of
  // Papers (review round 3, #20); it says what the seal holds, as any tap that finds nothing new
  // does (#102).
  it('a repeat tap on a paper reopens it and reports no copy', () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    moment('Bedchamber')
    tapSpot('seal')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    tapSpot('seal')
    expect(screen.getByRole('dialog', { name: 'The seal' })).toBeInTheDocument()
    expect(screen.queryByText(/copied to Papers/)).not.toBeInTheDocument()
    expect(screen.getByText(/Found:/)).toHaveTextContent(/^Found: Ahab, seal$/)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    tab(/Solve/)
    expect(screen.getByRole('button', { name: /Papers/ })).toHaveTextContent('Papers1')
  })

  it('Solve offers Papers only once a paper has been opened', () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    tab(/Solve/)
    expect(screen.queryByRole('button', { name: /Papers/ })).not.toBeInTheDocument()
  })

  it('progress is kept on the device, and Restart clears the open case after a confirm', () => {
    const { unmount } = start()
    openCase(/The valley/)
    tapSpot('boy')
    unmount()
    history.replaceState(null, '')
    start()
    expect(screen.getByText('In progress')).toBeInTheDocument()
    openCase(/The valley/)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(coach()).toHaveTextContent('Open Solve to name him.')
    tab(/Solve/)
    expect(chips()).toHaveLength(2)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    menu('Restart')
    expect(chips()).toHaveLength(2)
    confirm.mockReturnValue(true)
    menu('Restart')
    expect(screen.getByRole('dialog', { name: 'The valley' })).toBeInTheDocument()
    expect(coach()).toBeNull()
    tab(/Solve/)
    expect(screen.getByText('Nothing yet. Tap things in the picture.')).toBeInTheDocument()
    confirm.mockRestore()
  })

  it('an open case is a history entry: back returns to the cards, and Cases pops it (Gate 03 [1])', async () => {
    start(<App />, vineyardStarted)
    expect(history.state).toBeNull()
    openCase(/The valley/)
    expect(history.state).toEqual({ case: 'valley' })
    history.back()
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Behold' })).toBeInTheDocument(),
    )
    expect(history.state).toBeNull()
    openCase(/The vineyard/)
    expect(history.state).toEqual({ case: 'vineyard' })
    tab(/Solve/)
    expect(history.state).toEqual({ case: 'vineyard', view: 'solve' })
    menu('Cases')
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Behold' })).toBeInTheDocument(),
    )
    expect(history.state).toBeNull()
  })

  // The paid round's first session (#77): three times the browser's back took the tester from
  // Solve to the cases page. In a case still open Solve is an entry over the case's own, so back
  // steps down to Look first, forward returns to Solve, and Look's button from Solve steps back.
  it('back steps down from Solve to Look before it leaves the case', async () => {
    start()
    openCase(/The valley/)
    tab(/Solve/)
    expect(history.state).toEqual({ case: 'valley', view: 'solve' })
    history.back()
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Who is who' })).toBeNull())
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveAttribute('aria-selected', 'true')
    expect(history.state).toEqual({ case: 'valley' })
    history.forward()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Who is who' })).toBeInTheDocument(),
    )
    tab(/Look/)
    await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
    expect(screen.queryByRole('heading', { name: 'Who is who' })).toBeNull()
    history.back()
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Behold' })).toBeInTheDocument(),
    )
    expect(history.state).toBeNull()
  })

  // A restart from Solve turns Solve's entry into a case entry and steps back to the case's own:
  // the fresh case opens on Look, forward stays on Look, and two back from there is the cases
  // page (review round 1, #92).
  it('a restart from Solve steps back, and leaves a case entry ahead, not Solve’s', async () => {
    let pops = 0
    const count = () => pops++
    addEventListener('popstate', count)
    start()
    openCase(/The valley/)
    tab(/Solve/)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    menu('Restart')
    confirm.mockRestore()
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveAttribute('aria-selected', 'true')
    await waitFor(() => expect(pops).toBe(1))
    expect(history.state).toEqual({ case: 'valley' })
    history.forward()
    await waitFor(() => expect(pops).toBe(2))
    expect(history.state).toEqual({ case: 'valley' })
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveAttribute('aria-selected', 'true')
    history.go(-2)
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Behold' })).toBeInTheDocument(),
    )
    expect(history.state).toBeNull()
    removeEventListener('popstate', count)
  })

  it('a reload on Solve’s entry reopens the case on Solve', () => {
    history.replaceState({ case: 'valley', view: 'solve' }, '')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Who is who' })).toBeInTheDocument()
  })

  it('a reload inside a case reopens it from the history entry', () => {
    history.replaceState({ case: 'vineyard' }, '')
    render(<App />)
    expect(screen.getByRole('dialog', { name: 'The vineyard' })).toHaveTextContent(
      /A man walks a vineyard/,
    )
  })

  // The service worker's rule caches what is requested, so a case once opened must request every
  // picture it has, not the moment on the stage alone (review round 1, #20).
  it('opening a case requests every picture of the case, so a case once opened stays offline', () => {
    const requested: string[] = []
    vi.stubGlobal(
      'Image',
      class {
        set src(url: string) {
          requested.push(url)
        }
      },
    )
    try {
      start(<App />, laterStarted)
      // The title's own picture was asked for as it showed (#75); the case's are what follow.
      requested.length = 0
      openCase(/The vineyard/)
      // Each address carries its picture's hash (#45).
      expect(requested.sort()).toEqual(
        ['bedchamber.jpg', 'gate.jpg', 'p1.jpg', 'p2.jpg', 'p3.jpg', 'vineyard.jpg'].map((f) =>
          expect.stringMatching(new RegExp(`^/cases/vineyard/${f}\\?v=[0-9a-f]{8}$`)),
        ),
      )
    } finally {
      vi.unstubAllGlobals()
    }
  })

  // On the first visit the worker takes the page as it activates, and the prefetch waits for
  // that, so its requests go through the worker's rule (#12 [Q5]).
  it('the prefetch waits for the service worker where there is one', async () => {
    const requested: string[] = []
    vi.stubGlobal(
      'Image',
      class {
        set src(url: string) {
          requested.push(url)
        }
      },
    )
    let ready: () => void = () => {}
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: new Promise<void>((resolve) => {
          ready = resolve
        }),
      },
    })
    try {
      start()
      openCase(/The valley/)
      expect(requested).toEqual([])
      ready()
      // The valley's three, and the title's picture, which waited for the worker too (#75).
      await waitFor(() => expect(requested).toHaveLength(4))
      expect(requested[0]).toMatch(/^\/title\.jpg\?v=[0-9a-f]{8}$/)
    } finally {
      Reflect.deleteProperty(navigator, 'serviceWorker')
      vi.unstubAllGlobals()
    }
  })
})

describe('the tutorial’s marks (#25)', () => {
  const at = () => coach()?.getAttribute('data-at')
  const said = () => coach()?.querySelector('[role="status"]')?.textContent
  const ring = () => document.querySelector<HTMLElement>('.coach .ring')
  /**
   * jsdom lays nothing out, and a mark shows only where its target can be seen (07c), so every
   * box is given a place on screen: the ones a test names in `boxes` where it says, the rest
   * 100 × 40 at 10, 10.
   */
  let boxes: Record<string, DOMRect> = {}
  beforeEach(() => {
    boxes = {}
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      const hit = Object.keys(boxes).find((s) => this.matches(s))
      return hit ? boxes[hit] : new DOMRect(10, 10, 100, 40)
    })
  })
  afterEach(() => vi.restoreAllMocks())
  /** The valley played to David's slot: the slot under the boy waiting, and David next (#77). */
  const toSlot = () => {
    start()
    openCase(/The valley/)
    tapSpot('boy')
    fireEvent.click(document.querySelector('.dock')!)
    tab(/Solve/)
    slot('d1')
  }
  /** The valley played past David's slot: David under the boy, sling's blank marked next. */
  const toDavid = () => {
    toSlot()
    chip('David')
  }
  /** The sling's blank, in the account: step 5's first target, since it leads with the blank. */
  const blank = '[data-slot="t4"]'

  // The case screen never scrolls, so a mark brings its target to the middle of the target's own
  // scroll box, the account, and leaves the page alone (07c, #24 [1]). The account scrolls
  // smoothly, so the test gives it a browser's smooth scroll: a programmatic scroll lands a frame
  // later, and a second one before then aborts it (CSSOM View, perform a scroll). Two assignments,
  // one per axis, left the account where it was on a phone (#47); one scroll for both lands.
  it('brings its target to the middle of the account in one scroll, and never scrolls the page', () => {
    const intoView = vi.fn()
    Element.prototype.scrollIntoView = intoView
    try {
      boxes = { [blank]: new DOMRect(0, 500, 60, 30), '.solve': new DOMRect(0, 0, 360, 400) }
      toSlot()
      const solve = document.querySelector<HTMLElement>('.solve')!
      let top = 0
      let landing: number | null = null
      Object.defineProperties(solve, {
        scrollTop: { configurable: true, get: () => top, set: (v: number) => (landing = v) },
        scrollLeft: { configurable: true, get: () => 0, set: () => (landing = null) },
      })
      solve.scrollBy = ((o: ScrollToOptions) =>
        (landing = top + (o.top ?? 0))) as Element['scrollBy']
      // David set under the boy: the next step leads with sling's blank, low in the account.
      chip('David')
      if (landing !== null) top = landing
      expect(at()).toBe(blank)
      expect(top).toBe(315)
      expect(document.documentElement.scrollTop).toBe(0)
      expect(intoView).not.toHaveBeenCalled()
    } finally {
      Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
    }
  })

  // The paid round's second session (#23, 2026-10-05): at step 5 she tapped sword, then sling's
  // blank, and sword went in, so the step was never met. A guided fill's ring holds the screen
  // while it waits, so a word tapped before its slot, or another word after it, does nothing, and
  // the slot and then its word meet the step (#77). Her bank, kept, has sword in it.
  it('a guided fill takes only its slot, then its word: sword does nothing at sling’s blank', () => {
    start(<App />, {
      valley: {
        ...fresh(valley),
        tapped: ['armor', 'giant', 'boy'],
        bank: ['saul', 'king', 'sword', 'goliath', 'six', 'spear', 'david', 'sling'],
        faces: { d1: 'david' },
        step: 4,
      },
    })
    openCase(/The valley/)
    tab(/Solve/)
    expect(at()).toBe(blank)
    chip('sword')
    expect(document.querySelector('[data-word="sword"]')).not.toHaveClass('is-on')
    slot('t4')
    expect([at(), said()]).toEqual(['[data-word="sling"]', 'Now tap sling. Bright words fit.'])
    chip('sword')
    expect(document.querySelector(blank)).not.toHaveClass('is-filled')
    chip('sling')
    expect(document.querySelector(blank)).toHaveTextContent('sling')
    expect([at(), said()]).toEqual(['[data-view="look"]', 'Find the other words in the picture.'])
  })

  // A mark is drawn only where its target can be seen: out of the account's view it shows no ring
  // and no words, and part in view its ring is cut at the account's edge (07c, #24 [2]). A guided
  // step still holds the screen, and a tap there brings its target back into view (#77).
  it('shows nothing while its target is out of view, and cuts its ring at the scroll box', async () => {
    boxes = { [blank]: new DOMRect(0, 500, 60, 30), '.solve': new DOMRect(0, 0, 360, 400) }
    toDavid()
    await new Promise((r) => setTimeout(r, 100))
    expect(at()).toBe(blank)
    expect(ring()).toBeNull()
    expect(document.querySelector('.coach .label')).toBeNull()
    const scrolled = vi.spyOn(document.querySelector('.solve')!, 'scrollBy')
    slot('t1')
    expect(document.querySelector('[data-slot="t1"]')).not.toHaveClass('is-target')
    expect(scrolled).toHaveBeenCalledWith({ top: 315, left: -150 })
    boxes[blank] = new DOMRect(0, 380, 60, 30)
    fireEvent.scroll(document.querySelector('.solve')!)
    await waitFor(() => expect(ring()).not.toBeNull())
    expect([ring()!.style.top, ring()!.style.height]).toEqual(['376px', '24px'])
  })

  // The owner's routing of #104: only a ring on the picture ends where the dock begins, at its
  // caption's top. The dock's own ring at step 2 and a ring on the bar lie under that top, and keep
  // their whole box. Boxes as at 360 × 548.
  it('cuts no ring off the picture at the dock: the dock’s own at step 2, and the bar’s', async () => {
    boxes = {
      '.dock': new DOMRect(0, 365, 360, 104),
      '.stage': new DOMRect(34, 0, 292, 365),
      '[data-view="solve"]': new DOMRect(208, 476, 144, 48),
    }
    start()
    openCase(/The valley/)
    tapSpot('boy')
    expect(at()).toBe('.dock')
    await waitFor(() => expect(ring()).not.toBeNull())
    expect([ring()!.style.top, ring()!.style.height]).toEqual(['361px', '112px'])
    fireEvent.click(document.querySelector('.dock')!)
    expect(at()).toBe('[data-view="solve"]')
    await waitFor(() => expect(ring()?.style.top).toBe('472px'))
    expect(ring()!.style.height).toBe('56px')
  })

  // The paid round's second session (#23, 2026-10-05): step 5's words sat under sling's blank,
  // over the account's lines around it, the whole time she was stuck there. No mark covers the
  // account: the words of a target among its lines sit just under the lines on show (#77).
  it('puts no mark’s words over the account’s lines', async () => {
    boxes = {
      [blank]: new DOMRect(34, 148.5, 72, 30),
      '.solve': new DOMRect(0, 0, 360, 319),
      '.scroll': new DOMRect(16, 100, 328, 420),
    }
    toDavid()
    await waitFor(() => expect(document.querySelector('.coach .label')).not.toBeNull())
    expect(document.querySelector<HTMLElement>('.coach .label')!.style.top).toBe('327px')
  })

  // Close the case docks as its own row between the account and the bank, outside the scroll, so
  // it never moves and never covers the account; its result shows in the bank's head below it
  // (07d, #24). It shows once every slot is filled, and until then the account has the row (#24,
  // Solve's room).
  it('docks Close the case between the account and the bank once every slot is filled', () => {
    start(<App />, {
      vineyard: {
        ...fresh(vineyard),
        bank: ['garden'],
        faces: { p1: 'ahab', p2: 'jezebel', p3: 'naboth' },
        order: ['bedchamber', 'gate', 'vineyard'],
        fills: {
          s2: 'vineyard',
          s3: 'silver',
          s4: 'jezebel',
          s5: 'the-king',
          v1: 'killed',
          v2: 'taken-possession',
        },
      },
    })
    openCase(/The vineyard/)
    tab(/Solve/)
    expect(document.querySelector('.submit-row')).toBeNull()
    expect(document.querySelector('.solve')!.nextElementSibling).toHaveClass('bank')
    chip('garden')
    slot('s1')
    const row = screen.getByRole('button', { name: /Close the case/ }).parentElement!
    expect(row).toHaveClass('submit-row')
    expect(row.closest('.solve')).toBeNull()
    expect(row.previousElementSibling).toHaveClass('solve')
    expect(row.nextElementSibling).toHaveClass('bank')
  })

  it('shows each step at its target, or at the button of the view that holds it', async () => {
    start()
    openCase(/The valley/)
    // Solve, opened under the brief's card, which marks nothing, is left ahead: a guided step holds
    // the screen, so only the system's forward reaches it from step 1 (#77).
    tab(/Solve/)
    tab(/Look/)
    await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect([at(), said()]).toEqual(['[data-spot="boy"]', 'Tap the boy with the sling.'])
    history.forward()
    await onTab(/Solve/)
    expect(at()).toBe('[data-view="look"]')
    tab(/Look/)
    await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
    tapSpot('boy')
    // The boy's tap found two words, and the dock says so: it is ringed whole, the caption with
    // its line of finds, and a tap on it reads it (#77).
    expect([at(), said()]).toEqual(['.dock', 'That tap found his name, David, and sling.'])
    fireEvent.click(document.querySelector('.dock .found')!)
    expect([at(), said()]).toEqual(['[data-view="solve"]', 'Open Solve to name him.'])
    tab(/Solve/)
    // Both guided fills lead with the slot (#77). The slot under the boy is ringed, and once it
    // waits, sling dims, since a thing can't name him, and the mark moves to David.
    expect([at(), said()]).toEqual(['[data-slot="d1"]', 'Tap “who?” under the boy, then David.'])
    slot('d1')
    expect([at(), said()]).toEqual(['[data-word="david"]', 'Now tap David, his name.'])
    expect(document.querySelector('[data-word="sling"]')).toHaveClass('is-dim')
    expect(document.querySelector('[data-word="david"]')).not.toHaveClass('is-dim')
    chip('David')
    // Sling's blank leads the same way, and once it waits, David dims.
    expect([at(), said()]).toEqual([
      '[data-slot="t4"]',
      'The picture shows his sling. Tap the blank.',
    ])
    slot('t4')
    expect([at(), said()]).toEqual(['[data-word="sling"]', 'Now tap sling. Bright words fit.'])
    expect(document.querySelector('[data-word="david"]')).toHaveClass('is-dim')
    expect(document.querySelector('[data-word="sling"]')).not.toHaveClass('is-dim')
    chip('sling')
    expect([at(), said()]).toEqual(['[data-view="look"]', 'Find the other words in the picture.'])
    expect(screen.queryByRole('button', { name: /Close the case/ })).not.toBeInTheDocument()
    tab(/Look/)
    expect(coach()).toBeNull()
    for (const id of ['giant', 'brook', 'bearer', 'armor', 'basket']) tapSpot(id)
    // The sword is asked about only on a miss, so Close the case follows the sweep (#77). From Look
    // it rings Solve's button with no words, which are Solve's to say there.
    expect([at(), said()]).toEqual(['[data-view="solve"]', ''])
    // On Solve the last step rings Solve's count until Close the case shows (#24, Solve's room).
    tab(/Solve/)
    expect([at(), said()]).toEqual(['[data-view="solve"]', 'Fill the rest, then close the case.'])
  })

  // The paid round's first session (#77): on a short screen the words above Solve's button sat on
  // the caption, and hid the basket's evidence. From Look a step done on Solve rings Solve's button
  // with no words, and so no dim; only the step that waits on Solve opening speaks there. A guided
  // fill holds the screen to Solve, so the system's back is the way to Look from it (#77).
  it('from Look, a step done on Solve rings Solve’s button with no words', async () => {
    start()
    openCase(/The valley/)
    tapSpot('boy')
    fireEvent.click(document.querySelector('.dock .found')!)
    expect([at(), said()]).toEqual(['[data-view="solve"]', 'Open Solve to name him.'])
    tab(/Solve/)
    expect(said()).toBe('Tap “who?” under the boy, then David.')
    history.back()
    await onTab(/Look/)
    expect([at(), said()]).toEqual(['[data-view="solve"]', ''])
    await waitFor(() => expect(ring()).not.toBeNull())
    expect(ring()).not.toHaveClass('dim')
    tab(/Solve/)
    slot('d1')
    chip('David')
    history.back()
    await onTab(/Look/)
    expect([at(), said()]).toEqual(['[data-view="solve"]', ''])
    tab(/Solve/)
    expect(said()).toBe('The picture shows his sling. Tap the blank.')
  })

  // The dock's line of finds is gone once the case opens again, so the step waiting on it is passed
  // there, on a return to the case as on a reload, and the next move meets it (#77).
  it('passes the found line’s step when the case opens again without the line', async () => {
    start()
    openCase(/The valley/)
    tapSpot('boy')
    expect(at()).toBe('.dock')
    menu('Cases')
    fireEvent.click(await screen.findByRole('button', { name: /The valley/ }))
    expect([at(), said()]).toEqual(['[data-view="solve"]', 'Open Solve to name him.'])
    tab(/Solve/)
    expect(at()).toBe('[data-slot="d1"]')
  })

  // The found line's step only tells, so its words carry Open Solve, which takes the player there,
  // meeting it and the step after (#77): after the found line the paid round's first tester tapped
  // round Look for about 50 s first. A press on the button is its own: met on the press, the step
  // would take the button away before its click, and the click would fall to the picture under it.
  // A tap on the dock it rings moves on to the step after, as the step-targets test shows.
  it('the found line’s step carries Open Solve, which opens Solve past the step after', async () => {
    start()
    openCase(/The valley/)
    tapSpot('boy')
    const open = await screen.findByRole('button', { name: 'Open Solve' })
    fireEvent.pointerDown(open)
    expect(at()).toBe('.dock')
    fireEvent.click(open)
    expect(screen.getByRole('heading', { name: 'Who is who' })).toBeInTheDocument()
    expect(history.state).toEqual({ case: 'valley', view: 'solve' })
    expect([at(), said()]).toEqual(['[data-slot="d1"]', 'Tap “who?” under the boy, then David.'])
    expect(screen.queryByRole('button', { name: 'Open Solve' })).not.toBeInTheDocument()
  })

  // Playtest 2's second session (#77): the player put David in the sword's blank, and every guided
  // move was a direct match. Asked only once a close finds it wrong, the question comes on the
  // return trip rule 4 counts on. It rings the blank, never the word, and its words leave on the
  // next tap (#24 [3]); Look rings only Solve's button ([Q11]) and greets the player with its
  // prompt; a wrong name asks again, and the right one takes its ✓.
  it('asks whose sword it was when a close finds it wrong, and ✓s the right name', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    for (const [id, word] of valleyAnswers) {
      chip(id === 't5' ? 'David' : word)
      slot(id)
    }
    expect(document.querySelector('[data-slot="t5"]')).not.toHaveClass('is-right')
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(result()).toHaveTextContent('One answer doesn’t fit the story.')
    expect([at(), said()]).toEqual(['[data-slot="t5"]', 'Whose sword? Look closer at the picture.'])
    fireEvent.pointerDown(document.querySelector('[data-slot="t1"]')!)
    expect([at(), said()]).toEqual(['[data-slot="t5"]', ''])
    tab(/Look/)
    expect([at(), said()]).toEqual(['[data-view="solve"]', ''])
    expect(document.querySelector('.dock .said')).toHaveTextContent(
      'Tap anything that looks like it matters.',
    )
    tab(/Solve/)
    chip('Saul')
    slot('t5')
    expect([at(), said()]).toEqual(['[data-slot="t5"]', 'Whose sword? Look closer at the picture.'])
    chip('Goliath')
    slot('t5')
    expect(document.querySelector('[data-slot="t5"]')).toHaveClass('is-right')
    expect(at()).toBe('[data-close]')
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(screen.getByRole('heading', { name: 'The case is closed.' })).toBeInTheDocument()
  })

  // On Look the question rings only Solve's button, so a hint is offered there as in any case (#29),
  // and takes the ring's place: it points at the evidence for the blank asked about, the giant
  // (#77), and names the blank. His half would take 80% of the picture, so the first hint is the
  // second tier, at him (#102 [1]).
  it('a hint asked for on Look during the question points at the giant', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    for (const [id, word] of valleyAnswers) {
      chip(id === 't5' ? 'David' : word)
      slot(id)
    }
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    tab(/Look/)
    menu('Hint')
    expect([at(), said()]).toEqual([
      '[data-spot="giant"]',
      'This settles “the sword of ___”. Tap it.',
    ])
  })

  // Playtest 2 (#23): the last step pointed at Close the case with five blanks no word could fill,
  // and nothing said the rest was in the picture. Now the step after the guided moves sends the
  // player to Look, which greets them with its prompt again, not the boy's caption (#25).
  it('sends the player back to the picture after the guided moves, until everything is found', () => {
    start()
    openCase(/The valley/)
    guide()
    expect(at()).toBe('[data-view="look"]')
    expect(document.querySelector('.dock')).toBeNull()
    tab(/Look/)
    expect(document.querySelector('.dock .said')).toHaveTextContent(
      'Tap anything that looks like it matters.',
    )
    tapSpot('giant')
    expect(document.querySelector('.dock .said')).toHaveTextContent(/The Philistines’ champion/)
    // Back on Solve the sweep still rings Look's button. Its words left with the tap that opened
    // Look, the step's own target, as a step's fleeting words leave on the next tap (#24 [3]).
    tab(/Solve/)
    expect([at(), said()]).toEqual(['[data-view="look"]', ''])
  })

  // The owner's review on #92: the system's back and forward land a view as its tab lands it
  // (#77). jsdom fires each move's popstate on a later task, so each test waits for the view.
  const onTab = (name: RegExp) =>
    waitFor(() =>
      expect(screen.getByRole('tab', { name })).toHaveAttribute('aria-selected', 'true'),
    )

  // Back from Solve leaves it, so the count of words found since Solve was last left clears, as
  // Look's tab clears it: David and sling were just seen there.
  it('back from Solve clears the new words’ count, as Look’s tab does', async () => {
    start()
    openCase(/The valley/)
    tapSpot('boy')
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent('Solve0/7+2')
    fireEvent.click(await screen.findByRole('button', { name: 'Open Solve' }))
    history.back()
    await onTab(/Look/)
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent(/^Solve0\/7$/)
  })

  // Back from Solve after the guided moves greets the player with Look's prompt, not the boy's
  // caption, as Look's tab does (#25): the paid round's first tester took this way three times.
  it('back from Solve after the guided moves shows the prompt, as Look’s tab does', async () => {
    start()
    openCase(/The valley/)
    guide()
    expect(at()).toBe('[data-view="look"]')
    history.back()
    await onTab(/Look/)
    expect(document.querySelector('.dock .said')).toHaveTextContent(
      'Tap anything that looks like it matters.',
    )
  })

  // Forward to Solve meets the steps its tab would: with Solve opened before the boy and left by
  // back, the boy's tap and then forward meet the found line's step and Solve's own.
  it('forward to Solve meets the found line’s step and Solve’s, as Solve’s tab does', async () => {
    start()
    openCase(/The valley/)
    tab(/Solve/)
    history.back()
    await onTab(/Look/)
    tapSpot('boy')
    expect(at()).toBe('.dock')
    history.forward()
    await onTab(/Solve/)
    expect([at(), said()]).toEqual(['[data-slot="d1"]', 'Tap “who?” under the boy, then David.'])
  })

  it('marks nothing under the brief’s card or the menu, and nothing in a case without steps', async () => {
    start(<App />, vineyardStarted)
    openCase(/The valley/)
    expect(coach()).toBeNull()
    tapSpot('brook')
    expect(at()).toBe('[data-spot="boy"]')
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(coach()).toBeNull()
    menu('Cases')
    fireEvent.click(await screen.findByRole('button', { name: /The vineyard/ }))
    tapSpot('cord')
    expect(coach()).toBeNull()
  })

  // Carmel's one new idea is the order, marked where it is first met (#30): on Solve while the order
  // is empty, the pictures to place and then the slots. The vineyard has an order too, and marks a
  // face, not the order (#106).
  it('marks the pictures and then the slots in the case that teaches the order, until one is placed', async () => {
    start(<App />, laterStarted)
    openCase(/The mountain/)
    expect(coach()).toBeNull()
    tab(/Solve/)
    await waitFor(() => expect(at()).toBe('.tiles'))
    expect(said()).toBe('These are out of order. Which happened first?')
    tile('Baal’s altar')
    expect(at()).toBe('.order')
    expect(said()).toBe('These are out of order. Which happened first?')
    orderSlot(0)
    expect(coach()).toBeNull()
    menu('Cases')
    fireEvent.click(await screen.findByRole('button', { name: /The vineyard/ }))
    tab(/Solve/)
    await waitFor(() => expect(at()).toBe('[data-face="p1"]'))
  })

  // The vineyard's one new idea is names worked out from what bears them (#106): on Solve, while
  // the face of the man on the bed is empty, it is ringed with the lesson's words, as the battle's
  // disguised man is. A name placed takes the mark away, and emptying the face brings it back.
  it('marks the face of the man on the bed in the vineyard, until a name is placed', async () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    moment('Bedchamber')
    tapSpot('seal')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    tab(/Solve/)
    await waitFor(() => expect(at()).toBe('[data-face="p1"]'))
    expect(said()).toBe('Who is he? Find what bears his name.')
    chip('Ahab')
    slot('p1')
    expect(coach()).toBeNull()
    slot('p1')
    expect(at()).toBe('[data-face="p1"]')
  })

  // The battle's one new idea is a disguise (#53): on Solve, while the disguised man's face is
  // empty, it is ringed with the lesson's words. A name placed takes the mark away, and emptying the
  // face brings it back. The battle asks the order too, and marks nothing on it.
  it('marks the disguised man’s face in the case that teaches it, until a name is placed', async () => {
    start(<App />, laterStarted)
    openCase(/The battle/)
    moment('The thrones')
    tapSpot('plain')
    tab(/Solve/)
    await waitFor(() => expect(at()).toBe('[data-face="m1"]'))
    expect(said()).toBe('He’s in disguise. Name him by what happens.')
    chip('Ahab')
    slot('m1')
    expect(coach()).toBeNull()
    slot('m1')
    expect(at()).toBe('[data-face="m1"]')
  })

  // The paid round's second session (#23, 2026-10-05): her first tap at step 1 landed on the foot
  // of the step's own words and fell through to the armor, and her second, inside the boy's ring
  // at his feet, opened the giant, whose smaller box is drawn over the boy's. A guided step holds
  // the screen: a tap outside its ring, its words included, plays nothing and keeps the dim, and a
  // tap anywhere inside it is the target's. The menu still opens (#77). Boxes as at 360 × 548.
  it('a guided step holds the screen: outside its ring nothing plays, inside it the target does', async () => {
    boxes = {
      '.dock': new DOMRect(0, 365, 360, 104),
      '.stage': new DOMRect(0, 0, 360, 365),
      '[data-spot="boy"]': new DOMRect(196.1, 14.6, 99.2, 191.6),
      '[data-spot="giant"]': new DOMRect(35.5, 146, 233.6, 71.2),
      '[data-spot="armor"]': new DOMRect(171.2, 235.4, 149, 63.9),
    }
    start()
    openCase(/The valley/)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    await waitFor(() => expect(ring()).toHaveClass('dim'))
    const look = screen.getByRole('tab', { name: /Look/ })
    // The foot of the words, over the armor.
    const armor = document.querySelector('[data-spot="armor"]')!
    fireEvent.pointerDown(armor, { clientX: 194, clientY: 250.7 })
    fireEvent.click(armor, { detail: 1, clientX: 194, clientY: 250.7 })
    tab(/Solve/)
    fireEvent.click(screen.getByRole('button', { name: 'Zoom' }))
    expect(look).toHaveTextContent('Look0/6')
    expect(look).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: 'Zoom' })).toHaveAttribute('aria-pressed', 'false')
    expect(ring()).toHaveClass('dim')
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()
    fireEvent.click(document.querySelector('.modal.sheet')!)
    await waitFor(() => expect(ring()).not.toBeNull())
    // At his feet, on the giant's box inside the boy's ring.
    fireEvent.click(document.querySelector('[data-spot="giant"]')!, {
      detail: 1,
      clientX: 225.8,
      clientY: 176.1,
    })
    expect(screen.getByText(/A shepherd boy in a plain tunic/)).toBeInTheDocument()
    expect(look).toHaveTextContent('Look1/6')
    // The found line's step holds the screen to the dock: the armor, pressed and tapped, is not
    // found, and the step waits.
    fireEvent.pointerDown(armor)
    fireEvent.click(armor, { detail: 1, clientX: 194, clientY: 250.7 })
    expect([at(), look.textContent]).toEqual(['.dock', 'Look1/6'])
  })

  // #109: CI failed once on `main` when the tap above, inside the boy's ring after the menu closed,
  // was refused. The hold read the ring as of the render before, and a mark that comes back draws
  // its ring a render before the hold hears of it. Here the tap lands the moment the ring is drawn
  // again, before that render's effects run: the hold reads the ring at the tap, so the boy plays.
  it('a tap inside a guided step’s ring the moment the mark comes back reaches the target', async () => {
    boxes = {
      '.dock': new DOMRect(0, 365, 360, 104),
      '.stage': new DOMRect(0, 0, 360, 365),
      '[data-spot="boy"]': new DOMRect(196.1, 14.6, 99.2, 191.6),
      '[data-spot="giant"]': new DOMRect(35.5, 146, 233.6, 71.2),
    }
    start()
    openCase(/The valley/)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    await waitFor(() => expect(ring()).not.toBeNull())
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(ring()).toBeNull()
    // At his feet, on the giant's box inside the boy's ring, as soon as the ring is back.
    const tapped = new Promise<void>((resolve) => {
      const drawn = new MutationObserver(() => {
        if (!ring()) return
        drawn.disconnect()
        fireEvent.click(document.querySelector('[data-spot="giant"]')!, {
          detail: 1,
          clientX: 225.8,
          clientY: 176.1,
        })
        resolve()
      })
      drawn.observe(document.body, { childList: true, subtree: true })
    })
    fireEvent.click(document.querySelector('.modal.sheet')!)
    await tapped
    expect(screen.getByText(/A shepherd boy in a plain tunic/)).toBeInTheDocument()
    expect(document.querySelectorAll('.coach .ring .pulse')).toHaveLength(0)
  })

  // The ruling on the sixth amendment (#77): a tap that does nothing at all reads as a frozen game,
  // so a tap the hold refuses pulses the ring once, and the pulse leaves when its animation ends. A
  // second refused tap starts it over, and a tap the hold takes, on the target, pulses nothing.
  it('a tap the hold refuses pulses the ring once', async () => {
    // The dock under the picture, where a ring on the picture ends (#104).
    boxes = { '.dock': new DOMRect(0, 365, 360, 104) }
    start()
    openCase(/The valley/)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    await waitFor(() => expect(ring()).not.toBeNull())
    const pulses = () => document.querySelectorAll('.coach .ring .pulse')
    expect(pulses()).toHaveLength(0)
    tab(/Solve/)
    expect(pulses()).toHaveLength(1)
    const first = pulses()[0]
    fireEvent.click(screen.getByRole('button', { name: 'Zoom' }))
    expect(pulses()).toHaveLength(1)
    expect(pulses()[0]).not.toBe(first)
    fireEvent.animationEnd(pulses()[0])
    expect(pulses()).toHaveLength(0)
    tapSpot('boy')
    expect([at(), pulses().length]).toEqual(['.dock', 0])
  })

  // The ruling's addendum to the sixth amendment (#77): the guided fills leave nothing in the bank
  // to place, so after step 5 the sweep holds Solve to Look's button, with its words, and a refused
  // tap pulses the ring. Free play starts once Look opens, and back on Solve nothing is held.
  it('after the guided fills, the sweep holds Solve to Look’s button until Look opens', async () => {
    start()
    openCase(/The valley/)
    guide()
    await waitFor(() => expect(ring()).not.toBeNull())
    expect([at(), said()]).toEqual(['[data-view="look"]', 'Find the other words in the picture.'])
    slot('t1')
    expect(document.querySelector('[data-slot="t1"]')).not.toHaveClass('is-target')
    expect(document.querySelectorAll('.coach .ring .pulse')).toHaveLength(1)
    expect(said()).toBe('Find the other words in the picture.')
    tab(/Look/)
    await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
    tab(/Solve/)
    slot('t1')
    expect(document.querySelector('[data-slot="t1"]')).toHaveClass('is-target')
  })

  // A step can sit on a phone for minutes, so the mark stops reading its target's place once it
  // has held still, about half a second, and a scroll, a resize, a tap, or a click wakes it ([Q6]
  // and [Q15] on #12).
  // jsdom's target never moves, so it settles after its first frames.
  it('stops following a target that holds still, and a scroll wakes it', async () => {
    const frames = vi.spyOn(window, 'requestAnimationFrame')
    const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))
    try {
      start()
      openCase(/The valley/)
      fireEvent.click(screen.getByRole('button', { name: 'Start' }))
      await pause(1000)
      const settled = frames.mock.calls.length
      expect(settled).toBeGreaterThan(0)
      await pause(300)
      expect(frames.mock.calls.length).toBe(settled)
      fireEvent.scroll(window)
      expect(frames.mock.calls.length).toBe(settled + 1)
    } finally {
      frames.mockRestore()
    }
  })

  // The last step's words cover the account's end on Solve and the caption from Look, so they
  // leave on the next tap after they show; its ring stays until the case closes (#24, ruling [3]),
  // on Solve's count until Close the case shows, and then on Close (#24, Solve's room).
  it('the last step’s words leave on the next tap, and its ring stays', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    for (const [id, word] of [
      ['d1', 'David'],
      ['t4', 'sling'],
      ['t5', 'Goliath'],
    ] as const) {
      chip(word)
      slot(id)
    }
    await waitFor(() => expect(document.querySelector('.coach .label')).not.toBeNull())
    expect([at(), said()]).toEqual(['[data-view="solve"]', 'Fill the rest, then close the case.'])
    fireEvent.pointerDown(document.querySelector('[data-slot="t1"]')!)
    expect(document.querySelector('.coach .label')).toBeNull()
    expect(document.querySelector('.coach .ring')).not.toHaveClass('dim')
    expect([at(), said()]).toEqual(['[data-view="solve"]', ''])
    tab(/Look/)
    expect([at(), said()]).toEqual(['[data-view="solve"]', ''])
    // The dim left with the words, and a new target doesn't bring it back (#24, addendum (b)).
    expect(document.querySelector('.coach .ring')).not.toHaveClass('dim')
    tab(/Solve/)
    for (const [id, word] of valleyAnswers.filter(([id]) => !['d1', 't4', 't5'].includes(id))) {
      chip(word)
      slot(id)
    }
    expect([at(), said()]).toEqual(['[data-close]', ''])
  })

  // Playtest 2 (#23): the first close the player met said "Several are wrong." in case three, and
  // he hadn't known his answers were checked. In the tutorial a failed close brings the last step's
  // mark back, dim and all, with words that say so (#25).
  it('a failed close in the tutorial brings the last step back with its retry', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    // With the sword's blank right, a close that fails on a number brings the retry, not the
    // question (#77), at the first answer it rang (#102).
    for (const [id, word] of valleyAnswers) {
      chip(id === 't3' ? 'five' : word)
      slot(id)
    }
    fireEvent.pointerDown(document.querySelector('[data-close]')!)
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(result()).toHaveTextContent('One answer doesn’t fit the story.')
    await waitFor(() => expect(document.querySelector('.coach .ring')).toHaveClass('dim'))
    expect([at(), said()]).toEqual([
      '[data-slot="t3"]',
      'Ringed answers don’t fit the story. Look closer.',
    ])
    fireEvent.pointerDown(document.querySelector('[data-slot="t3"]')!)
    expect([at(), said()]).toEqual(['[data-slot="t3"]', ''])
  })

  // The screens for #102 [4], E5: once its last ring was changed, the retry's mark went back to
  // Close the case still saying "Ringed answers don't fit the story", over the bank's head. A tap's
  // press sends its words away, but moves made as a keyboard makes them, with no press, don't, nor
  // does a mark shown again by a hint asked past its last tier. With no ring left, the retry's mark
  // says nothing (#104).
  it('the retry says nothing once no ring is left', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    for (const [id, word] of valleyAnswers) {
      chip(id === 't3' ? 'five' : word)
      slot(id)
    }
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect([at(), said()]).toEqual([
      '[data-slot="t3"]',
      'Ringed answers don’t fit the story. Look closer.',
    ])
    chip('six')
    slot('t3')
    expect([at(), said()]).toEqual(['[data-close]', ''])
  })

  // The paid round's first session (#77): "Several are wrong." said nothing of where, and after the
  // question settled the sword the tester took Goliath back out three times. The valley teaches, so
  // its failed close rings what it found wrong, but the slot its question asks about, each until it
  // is changed, and a screen reader hears the ring; and a slot showing its ✓ keeps its word.
  it('a failed close in the valley rings what it found wrong, and a ✓ stays', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    const missed: Record<string, string> = { t1: 'king', t3: 'ten', t5: 'Saul' }
    for (const [id, word] of valleyAnswers) {
      chip(missed[id] ?? word)
      slot(id)
    }
    const ringed = () =>
      [...document.querySelectorAll('.is-wrong')].map((e) => e.getAttribute('data-slot'))
    expect(ringed()).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(ringed()).toEqual(['t1', 't3'])
    expect(at()).toBe('[data-slot="t5"]')
    expect(document.querySelector('[data-slot="t1"]')).toHaveTextContent(
      'king, ringed: doesn’t fit the story',
    )
    chip('brothers')
    slot('t1')
    expect(ringed()).toEqual(['t3'])
    chip('Goliath')
    slot('t5')
    expect(document.querySelector('[data-slot="t5"]')).toHaveClass('is-right')
    slot('t5')
    expect(document.querySelector('[data-slot="t5"]')).toHaveTextContent('Goliath')
    expect(document.querySelector('[data-slot="t5"]')).toHaveClass('is-right')
  })

  // Review round 1 on #91: a ring lasts until its slot is changed, so it leaves for good on the
  // first change. Putting back the answer it held doesn't bring it back; only a close checks again.
  it('a ring leaves for good once its slot is changed (review round 1)', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    for (const [id, word] of valleyAnswers) {
      chip(id === 't1' ? 'king' : word)
      slot(id)
    }
    const ringed = () =>
      [...document.querySelectorAll('.is-wrong')].map((e) => e.getAttribute('data-slot'))
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(ringed()).toEqual(['t1'])
    chip('commander')
    slot('t1')
    expect(ringed()).toEqual([])
    chip('king')
    slot('t1')
    expect(document.querySelector('[data-slot="t1"]')).toHaveTextContent('king')
    expect(ringed()).toEqual([])
  })

  // The paid round's second session (#23, 2026-10-05): with sword in sling's blank, step 5 was
  // never met, and at 7/7 there was no close and no word; she reloaded, and it reopened so. Kept
  // so, the valley now opens past every step: Close the case is offered, and the failed close
  // teaches as any in the valley does, with rings and the sword's question (#77).
  it('a full account kept at step 5 is offered the close, and the close teaches', () => {
    start(<App />, {
      valley: {
        ...fresh(valley),
        tapped: ['armor', 'giant', 'boy'],
        bank: ['saul', 'king', 'sword', 'goliath', 'six', 'spear', 'david', 'sling'],
        faces: { d1: 'david', d2: 'goliath' },
        fills: { t4: 'sword', t1: 'six', t2: 'king', t3: 'six', t5: 'saul' },
        step: 4,
      },
    })
    openCase(/The valley/)
    tab(/Solve/)
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(result()).toHaveTextContent(
      'Four answers don’t fit the story. There are three more to find in the picture.',
    )
    const ringed = [...document.querySelectorAll('.is-wrong')].map((e) =>
      e.getAttribute('data-slot'),
    )
    expect(ringed).toEqual(['t1', 't2', 't4'])
    expect([at(), said()]).toEqual(['[data-slot="t5"]', 'Whose sword? Look closer at the picture.'])
  })

  // A valley closed before #96 holds the loaves' count and the commander, which no longer match. It
  // opens again at its last step with its slots filled, and its next close rings both (#12 [Q13]).
  it('a valley closed before #96 opens again, and its next close rings the old words', async () => {
    const closed = closedCase(valley)
    start(<App />, {
      valley: { ...closed, fills: { ...closed.fills, t1: 'ten', t2: 'commander' } },
    })
    openCase(/The valley/)
    expect(screen.queryByRole('heading', { name: 'The case is closed.' })).not.toBeInTheDocument()
    tab(/Solve/)
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(result()).toHaveTextContent('Two answers don’t fit the story.')
    const ringed = [...document.querySelectorAll('.is-wrong')].map((e) =>
      e.getAttribute('data-slot'),
    )
    expect(ringed).toEqual(['t1', 't2'])
    await waitFor(() => expect(ring()).toHaveClass('dim'))
    expect(said()).toBe('Ringed answers don’t fit the story. Look closer.')
  })
})

describe('hints (#29)', () => {
  const at = () => coach()?.getAttribute('data-at')
  const said = () => coach()?.querySelector('[role="status"]')?.textContent
  const offer = () => document.querySelector('.offer')
  // The ring is drawn only where jsdom is told its target lies, as for the tutorial's marks.
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(10, 10, 100, 40),
    )
  })
  afterEach(() => vi.restoreAllMocks())
  /** The vineyard's bedchamber with everything found but the seal. */
  const toSeal = () => {
    start(<App />, laterStarted)
    openCase(/The vineyard/)
    moment('Bedchamber')
    for (const id of ['window', 'man-bed', 'tray', 'woman', 'sheets', 'purse']) tapSpot(id)
  }

  it('offers one in the dock after a run of taps that find nothing new, and each tier is asked for', () => {
    toSeal()
    for (let i = 1; i < stuck.taps; i++) tapSpot('window')
    expect(offer()).toBeNull()
    tapSpot('window')
    fireEvent.click(screen.getByRole('button', { name: 'Stuck? Where to look' }))
    expect([at(), said()]).toEqual(['[data-half]', 'There’s still something to find here.'])
    expect(document.querySelector('[data-half]')).toHaveAttribute('x', '450')
    // Its words leave on the next tap, as the last step's do, and its ring stays (#24 [3]).
    fireEvent.pointerDown(document.querySelector('[data-spot="woman"]')!)
    expect([at(), said()]).toEqual(['[data-half]', ''])
    fireEvent.click(screen.getByRole('button', { name: 'Still stuck? Show me' }))
    expect([at(), said()]).toEqual(['[data-spot="seal"]', 'Here it is. Tap it.'])
    expect(offer()).toBeNull()
    tapSpot('seal')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(coach()).toBeNull()
  })

  // Looking again once everything is found is the loop's return trip, not a stall.
  it('offers nothing for taps that find nothing new once everything is found', () => {
    start(<App />, laterStarted)
    openCase(/The mountain/)
    for (const [m, ids] of [
      ['The water', ['altar', 'pourers', 'caller', 'trench', 'spent']],
      ['The fire', ['fire', 'dry', 'faces', 'praying']],
      ['Baal’s altar', ['prophets', 'mocker', 'crowd', 'king', 'ruin']],
    ] as const) {
      moment(m)
      for (const id of ids) tapSpot(id)
    }
    for (let i = 0; i < stuck.taps * 2; i++) tapSpot('ruin')
    expect(offer()).toBeNull()
  })

  it('offers one after a stay on a moment with something left, timed only while the app is in view', () => {
    const hide = (hidden: boolean) => {
      Object.defineProperty(document, 'hidden', { value: hidden, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    }
    vi.useFakeTimers()
    try {
      start(<App />, laterStarted)
      openCase(/The vineyard/)
      tapSpot('cord')
      act(() => vi.advanceTimersByTime(stuck.seconds * 1000 - 1))
      expect(offer()).toBeNull()
      act(() => hide(true))
      act(() => vi.advanceTimersByTime(stuck.seconds * 1000))
      expect(offer()).toBeNull()
      act(() => hide(false))
      act(() => vi.advanceTimersByTime(stuck.seconds * 1000))
      expect(offer()).toHaveTextContent('Stuck? Where to look')
    } finally {
      vi.useRealTimers()
      Reflect.deleteProperty(document, 'hidden')
    }
  })

  // A caption opened whole with More rises over the picture's foot, so the stay isn't timed while
  // it lies open: A1 times a stay with nothing over the picture (review round 1).
  it('does not time the stay while a caption lies open over the picture', () => {
    const tall = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
    tall.mockImplementation(function (this: HTMLElement) {
      return this.textContent?.startsWith('A wild-haired man') ? 90 : 0
    })
    vi.useFakeTimers()
    try {
      start(<App />, laterStarted)
      openCase(/The vineyard/)
      tapSpot('prophet')
      fireEvent.click(screen.getByRole('button', { name: 'More' }))
      act(() => vi.advanceTimersByTime(stuck.seconds * 1000))
      expect(offer()).toBeNull()
      fireEvent.click(screen.getByRole('button', { name: 'Less' }))
      act(() => vi.advanceTimersByTime(stuck.seconds * 1000))
      expect(offer()).toHaveTextContent('Stuck? Where to look')
    } finally {
      vi.useRealTimers()
      tall.mockRestore()
    }
  })

  // The dock goes when Solve opens, and its caption closes with it, so back on Look the stay is
  // timed again.
  it('times the stay again once a caption left open closes with a trip to Solve', () => {
    const tall = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
    tall.mockImplementation(function (this: HTMLElement) {
      return this.textContent?.startsWith('A wild-haired man') ? 90 : 0
    })
    vi.useFakeTimers()
    try {
      start(<App />, laterStarted)
      openCase(/The vineyard/)
      tapSpot('prophet')
      fireEvent.click(screen.getByRole('button', { name: 'More' }))
      tab(/Solve/)
      tab(/Look/)
      expect(document.querySelector('.dock')).not.toHaveClass('is-open')
      act(() => vi.advanceTimersByTime(stuck.seconds * 1000))
      expect(offer()).toHaveTextContent('Stuck? Where to look')
    } finally {
      vi.useRealTimers()
      tall.mockRestore()
    }
  })

  // Playtest 2's mountain (#23): six of seven filled and nothing left to place, a wait on Solve
  // that no signal on Look can see (#65). The hint sends him where a word of the missing kind is.
  it('offers one on Solve after a wait with something empty and nothing left to place', () => {
    vi.useFakeTimers()
    try {
      start(<App />, laterStarted)
      openCase(/The mountain/)
      for (const [name, ids] of [
        ['The water', ['pourers', 'caller']],
        ['The fire', ['fire']],
        ['Baal’s altar', ['king']],
      ] as const) {
        moment(name)
        for (const id of ids) tapSpot(id)
      }
      tab(/Solve/)
      for (const [word, id] of [
        ['Elijah', 'c1'],
        ['Ahab', 'c2'],
      ]) {
        chip(word)
        slot(id)
      }
      for (const [i, name] of ['Baal’s altar', 'The water', 'The fire'].entries()) {
        tile(name)
        orderSlot(i)
      }
      act(() => vi.advanceTimersByTime(stuck.stranded * 1000))
      expect(offer()).toBeNull()
      chip('stones')
      slot('a3')
      act(() => vi.advanceTimersByTime(stuck.stranded * 1000 - 1))
      expect(offer()).toBeNull()
      act(() => vi.advanceTimersByTime(1))
      // Close the case can't close yet, so the offer has its row alone (#24, Solve's room).
      expect(offer()?.closest('.submit-row')).not.toBeNull()
      expect(screen.queryByRole('button', { name: /Close the case/ })).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Where to look' }))
      // The prophets' half would take most of the picture, so the first hint is the second tier,
      // at them (#102 [1]).
      expect([at(), said()]).toEqual(['[data-view="look"]', 'Here it is. Tap it.'])
      tab(/Look/)
      expect(at()).toBe('[data-spot="prophets"]')
    } finally {
      vi.useRealTimers()
    }
  })

  // The wait starts over on every word placed, emptied, or found, after it has fired too: a word
  // placed that leaves the player stranded takes the offer away for another wait (review round 2).
  it('starts a fired wait over when a word is placed and nothing is left to place still', () => {
    vi.useFakeTimers()
    try {
      start(<App />, laterStarted)
      openCase(/The mountain/)
      for (const [name, ids] of [
        ['The water', ['pourers']],
        ['The fire', ['fire']],
        ['Baal’s altar', ['king', 'mocker']],
      ] as const) {
        moment(name)
        for (const id of ids) tapSpot(id)
      }
      tab(/Solve/)
      for (const [word, id] of [
        ['Elijah', 'c1'],
        ['Ahab', 'c2'],
        ['stones', 'a3'],
      ]) {
        chip(word)
        slot(id)
      }
      for (const [i, name] of ['Baal’s altar', 'The water', 'The fire'].entries()) {
        tile(name)
        orderSlot(i)
      }
      act(() => vi.advanceTimersByTime(stuck.stranded * 1000))
      expect(offer()).toHaveTextContent('Where to look')
      // Jars in the stones' blank: the actions' blanks are still empty, and nothing loose fits them.
      chip('jars')
      slot('a3')
      expect(offer()).toBeNull()
      act(() => vi.advanceTimersByTime(stuck.stranded * 1000))
      expect(offer()).toHaveTextContent('Where to look')
    } finally {
      vi.useRealTimers()
    }
  })

  // Under the step that sends the player back to the picture, its words, which sit over the bank,
  // leave on the next tap and its ring stays (#24 [3]); a wait on Solve with nothing left to place
  // shows the step again, a new mark with its words (A8 as ruled). On Look the step marks nothing,
  // so the signals there offer hints as in any case (#25, #65). The valley is kept past its guided
  // fills and opens on Look, so Solve is a way back during the sweep, which holds nothing there.
  it('under the tutorial’s sweep, a wait on Solve shows the step again, and Look offers hints', () => {
    vi.useFakeTimers()
    try {
      start(<App />, {
        valley: {
          ...fresh(valley),
          tapped: ['boy'],
          bank: ['david', 'sling'],
          faces: { d1: 'david' },
          fills: { t4: 'sling' },
          step: 5,
        },
      })
      openCase(/The valley/)
      tab(/Solve/)
      expect(said()).toBe('Find the other words in the picture.')
      fireEvent.pointerDown(document.querySelector('[data-word="david"]')!)
      expect([at(), said()]).toEqual(['[data-view="look"]', ''])
      const before = coach()
      act(() => vi.advanceTimersByTime(stuck.stranded * 1000 - 1))
      expect(coach()).toBe(before)
      act(() => vi.advanceTimersByTime(1))
      expect(coach()).not.toBe(before)
      expect([at(), said(), offer()]).toEqual([
        '[data-view="look"]',
        'Find the other words in the picture.',
        null,
      ])
      tab(/Look/)
      for (let i = 0; i < stuck.taps; i++) tapSpot('boy')
      expect(offer()).toHaveTextContent('Stuck? Where to look')
    } finally {
      vi.useRealTimers()
    }
  })

  // A close's hint is kept from the close: a changed answer can't ask the hints what is right.
  it('offers one beside Close the case after two failed closes, at what the first found wrong', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    for (const [id, word] of valleyAnswers) {
      chip(id === 't1' ? 'commander' : word)
      slot(id)
    }
    const close = () => fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    close()
    expect(offer()).toBeNull()
    close()
    chip('brothers')
    slot('t1')
    fireEvent.click(screen.getByRole('button', { name: 'Where to look' }))
    expect([at(), said()]).toEqual([
      '[data-view="look"]',
      'Something here settles “loaves for his ___”.',
    ])
    tab(/Look/)
    expect(at()).toBe('[data-half]')
    fireEvent.click(screen.getByRole('button', { name: 'Still stuck? Show me' }))
    expect(at()).toBe('[data-spot="basket"]')
    tapSpot('basket')
    expect(at()).toBe('[data-view="solve"]')
    tab(/Solve/)
    close()
    expect(screen.getByText('You asked for 2 hints.')).toBeInTheDocument()
  })

  // From the menu, a hint uses a close's result after one failed close, where the offer waits for
  // two: holding the menu to two would only make the player close again (A4 as ruled).
  it('the menu’s Hint aims at what a single failed close found wrong', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    for (const [id, word] of valleyAnswers) {
      chip(id === 't1' ? 'commander' : word)
      slot(id)
    }
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(offer()).toBeNull()
    menu('Hint')
    expect([at(), said()]).toEqual([
      '[data-view="look"]',
      'Something here settles “loaves for his ___”.',
    ])
    tab(/Look/)
    fireEvent.click(screen.getByRole('button', { name: 'Still stuck? Show me' }))
    expect(at()).toBe('[data-spot="basket"]')
  })

  // The owner's ruling [2] (#102): a hint for an answer points at a thing found already, so its half
  // marks nothing found, where a ✓ would tell the player to skip it. The marks stay with the hints
  // for what is still unfound (#95).
  it('an evidence hint’s half marks nothing found', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    for (const [id, word] of valleyAnswers) {
      chip(id === 't1' ? 'commander' : word)
      slot(id)
    }
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    menu('Hint')
    tab(/Look/)
    expect(at()).toBe('[data-half]')
    expect(document.querySelectorAll('[data-found]')).toHaveLength(0)
  })

  /** The valley swept and filled with its answers, one slot given another word, then closed. */
  const missOne = async (id: string, word: string) => {
    start()
    openCase(/The valley/)
    await sweep()
    for (const [slotId, answer] of valleyAnswers) {
      chip(slotId === id ? word : answer)
      slot(slotId)
    }
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
  }

  // The next round's first tester (#102): all three of his hints were for the giant's face, and none
  // said so. A hint for an answer names it, a blank by the words beside it, those after it when it
  // opens its sentence, and its second tier names it again.
  it('a hint names the answer it is for, at both tiers', async () => {
    await missOne('t2', 'David')
    menu('Hint')
    expect(said()).toBe('Something here settles “___ dressed the boy”.')
    tab(/Look/)
    fireEvent.click(screen.getByRole('button', { name: 'Still stuck? Show me' }))
    expect(said()).toBe('This settles “___ dressed the boy”. Tap it.')
  })

  // The owner's ruling [1] (#102): where a thing's half would take most of the picture, its first
  // hint is the second tier, since tier 1 would ring the same box and say less. The giant's half
  // takes 80%: a hint for his face rings him, names the face by its line, and offers no Show me.
  it('a hint whose half would take most of the picture starts at its second tier', async () => {
    await missOne('d2', 'Saul')
    menu('Hint')
    expect(said()).toBe('This settles “the fallen giant”. Tap it.')
    tab(/Look/)
    expect(at()).toBe('[data-spot="giant"]')
    expect(screen.queryByRole('button', { name: /Show me/ })).toBeNull()
  })

  // The restarted round's second session (#23): "There’s still something to find here." on The
  // fire's button read as "find the fire in this picture", and he searched the water's. On a
  // moment's button a hint's words name the moment and say to open it, at either tier, and once
  // the moment opens they are the hint's own again (#106 [1]).
  it('on a moment’s button, a hint for something still to find names it and says to open it', () => {
    start(<App />, laterStarted)
    openCase(/The mountain/)
    for (const id of ['altar', 'pourers', 'caller', 'trench', 'spent']) tapSpot(id)
    for (let i = 0; i < stuck.taps; i++) tapSpot('altar')
    fireEvent.click(screen.getByRole('button', { name: 'Stuck? Where to look' }))
    const opens = 'Open The fire: there’s more to find.'
    expect([at(), said()]).toEqual(['[data-moment="fire"]', opens])
    moment('The fire')
    expect([at(), said()]).toEqual(['[data-half]', 'There’s still something to find here.'])
    moment('The water')
    fireEvent.click(screen.getByRole('button', { name: 'Still stuck? Show me' }))
    expect([at(), said()]).toEqual(['[data-moment="fire"]', opens])
  })

  // From the vineyard on, the hint after a failed close is how a stuck player learns which answer
  // doesn't fit (#106): on the moment's button that leads to its evidence, it names the moment and
  // the answer, and says to open it.
  it('on a moment’s button, a hint for an answer names it and the answer, and says to open it', () => {
    const kept = closedCase(vineyard)
    start(<App />, { vineyard: { ...kept, fills: { ...kept.fills, s4: 'ahab' }, solved: false } })
    openCase(/The vineyard/)
    tab(/Solve/)
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    menu('Hint')
    expect(said()).toBe('Something here settles “but written by ___”.')
    tab(/Look/)
    expect([at(), said()]).toEqual([
      '[data-moment="bedchamber"]',
      'Open Bedchamber to settle “but written by ___”.',
    ])
    moment('Bedchamber')
    expect([at(), said()]).toEqual(['[data-half]', 'Something here settles “but written by ___”.'])
  })

  // The ruling on F3's words (#106 [1]): a stranded player's hint points at a spot not yet found,
  // so on a moment's button it says there's more to find. The water's two words are placed, and
  // nothing in the bank fits the empty face or the actions' blanks.
  it('on a moment’s button, a stranded player’s hint says there’s more to find', () => {
    const water = ['altar', 'pourers', 'caller', 'trench', 'spent']
    const placed = { faces: { c1: 'elijah' }, fills: { a3: 'jars' } }
    start(<App />, {
      ...laterStarted,
      carmel: { ...fresh(carmel), tapped: water, bank: ['jars', 'elijah'], ...placed },
    })
    openCase(/The mountain/)
    menu('Hint')
    expect([at(), said()]).toEqual(['[data-moment="fire"]', 'Open The fire: there’s more to find.'])
  })

  // [Q16] on #12: from the vineyard on, the hint offered after the second failed close is how a
  // stuck player learns which answer doesn't fit (#106), and a hint asked for earlier and left
  // unfollowed doesn't hide it. Where a close doesn't mark, the failed close that makes the offer
  // due drops a hint still showing, at either tier, so the offer names the first answer that
  // doesn't fit. Everything is found but the woman at the table, whom the earlier hint is for.
  it.each([1, 2])(
    'a tier-%i hint still showing gives way to the close’s in the vineyard',
    (tier) => {
      const kept = closedCase(vineyard)
      const tapped = kept.tapped.filter((id) => id !== 'woman')
      const fills = { ...kept.fills, s4: 'ahab' }
      start(<App />, { vineyard: { ...kept, tapped, fills, solved: false } })
      openCase(/The vineyard/)
      for (let i = 0; i < tier; i++) menu('Hint')
      tab(/Solve/)
      const close = () => fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
      close()
      close()
      expect(offer()).toHaveTextContent(/^Where to look$/)
      fireEvent.click(offer()!)
      expect([at(), said()]).toEqual([
        '[data-view="look"]',
        'Something here settles “but written by ___”.',
      ])
    },
  )

  // The next round's first tester (#104): "Where to look" rang most of the picture, and with the
  // basket's caption opened over its foot, its ring ran across the caption: "the yellow rectangle
  // is on top of the text." A ring on the picture is cut where an opened caption begins, and a
  // target wholly under it shows no ring until the caption closes. The boxes are the valley's at
  // 360 × 548: the picture 292 × 365 at 34, the basket's half its left, the giant's caption opened
  // from 303. The mark is let sleep before More and before Less, so their clicks alone wake it, as
  // a keyboard's or a screen reader's do ([Q15] on #12).
  it('cuts a ring on the picture where an opened caption begins, and shows none under it', async () => {
    const tall = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
    tall.mockImplementation(function (this: HTMLElement) {
      return this.textContent?.startsWith('The Philistines') ? 90 : 0
    })
    const boxes: Record<string, DOMRect> = {
      '.stage': new DOMRect(34, 0, 292, 365),
      '[data-half]': new DOMRect(34, 0, 146, 365),
      '.dock': new DOMRect(0, 365, 360, 104),
      '.dock .whole': new DOMRect(0, 303, 360, 115),
    }
    vi.mocked(Element.prototype.getBoundingClientRect).mockImplementation(function (this: Element) {
      const hit = Object.keys(boxes).find((s) => this.matches(s))
      return hit ? boxes[hit] : new DOMRect(10, 10, 100, 40)
    })
    const ring = () => document.querySelector<HTMLElement>('.coach .ring')
    const moved = () => fireEvent.scroll(document.querySelector('.stage')!)
    // Past the half second a target holds still before its mark stops following ([Q6]).
    const asleep = () => new Promise((r) => setTimeout(r, 1000))
    try {
      await missOne('t1', 'spear')
      menu('Hint')
      tab(/Look/)
      tapSpot('giant')
      await asleep()
      fireEvent.click(screen.getByRole('button', { name: 'More' }))
      await waitFor(() => expect(ring()?.style.height).toBe('303px'))
      expect(ring()!.style.top).toBe('0px')
      boxes['[data-half]'] = new DOMRect(34, 310, 146, 55)
      moved()
      await waitFor(() => expect(ring()).toBeNull())
      await asleep()
      fireEvent.click(screen.getByRole('button', { name: 'Less' }))
      await waitFor(() => expect(ring()?.style.top).toBe('306px'))
    } finally {
      tall.mockRestore()
    }
  })

  // Under a guided step the step's own mark is the hint, and the step holds the screen (#77): a run
  // of taps outside its ring finds nothing and runs nothing, so nothing is offered, and the step
  // keeps its dim.
  it('under a guided step, taps outside its ring run nothing and nothing is offered', async () => {
    // The dock under the picture, where a ring on the picture ends (#104).
    vi.mocked(Element.prototype.getBoundingClientRect).mockImplementation(function (this: Element) {
      return this.matches('.dock') ? new DOMRect(0, 365, 360, 104) : new DOMRect(10, 10, 100, 40)
    })
    start()
    openCase(/The valley/)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    const ring = () => document.querySelector('.coach .ring')
    await waitFor(() => expect(ring()).toHaveClass('dim'))
    for (let i = 0; i <= stuck.taps; i++) tapSpot('giant')
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveTextContent('Look0/6')
    expect([at(), offer()]).toEqual(['[data-spot="boy"]', null])
    expect(ring()).toHaveClass('dim')
  })

  it('the menu’s quiet Hint gives one without a signal, and a case closed without one says nothing', async () => {
    start(<App />, vineyardStarted)
    openCase(/The vineyard/)
    tapSpot('cord')
    menu('Hint')
    expect([at(), said()]).toEqual(['[data-half]', 'There’s still something to find here.'])
    menu('Cases')
    fireEvent.click(await screen.findByRole('button', { name: /The valley/ }))
    await solveTheValley()
    expect(document.querySelector('.hints-used')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    const sheet = screen.getByRole('dialog', { name: 'Menu' })
    expect(within(sheet).queryByRole('button', { name: 'Hint' })).toBeNull()
  })
})

describe('Solve’s room (#24)', () => {
  const words = () => chips().map((c) => c.textContent)
  afterEach(() => vi.restoreAllMocks())

  // The next round's first tester (#23, 2026-10-05): with a blank waiting, the words that fit it
  // lay across five rows of a bank that showed two. While a slot waits they lead the bank, in the
  // order found, with the rest after them, dimmed, and the bank shows them from its top.
  it('leads the bank with the words that fit a waiting slot, shown from its top', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    const found = words()
    const bank = document.querySelector('.chips')!
    let top = 96
    Object.defineProperty(bank, 'scrollTop', {
      configurable: true,
      get: () => top,
      set: (v: number) => (top = v),
    })
    slot('t1')
    expect(words()).toEqual([
      ...['sling', 'spear', 'sword', 'stones', 'king', 'brothers', 'commander', 'shield'],
      ...['David', 'Goliath', 'six', 'five', 'Saul', 'ten'],
    ])
    expect(document.querySelector('[data-word="ten"]')).toHaveClass('is-dim')
    expect(top).toBe(0)
    slot('t1')
    expect(words()).toEqual(found)
  })

  // A blank tapped on the account's last line under the faces left the rest of its sentence below
  // the account's foot (#23). The account is set as its sentences, and a blank that starts waiting
  // scrolls it the least it takes to show its sentence whole.
  it('brings a waiting blank’s whole sentence into view', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    const solve = document.querySelector('.solve')!
    // Saul's blank opens its sentence, which runs to the next stop (#96).
    const sentence = document.querySelector('[data-slot="t2"]')!.closest('.sentence')!
    expect(sentence).toHaveTextContent(/^dressed the boy in his own armor, .* untested\.$/)
    expect(sentence.previousElementSibling).toHaveTextContent(/cubits and a span\.$/)
    vi.spyOn(solve, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 360, 300))
    vi.spyOn(sentence, 'getBoundingClientRect').mockReturnValue(new DOMRect(20, 270, 320, 92))
    const scrolled = vi.spyOn(solve, 'scrollBy')
    slot('t2')
    expect(scrolled).toHaveBeenCalledWith({ top: 62 })
  })

  // The next round's first tester (#23): Goliath, tapped, was still picked up when he came back
  // from Look, so his tap on the cubits' blank was refused. Leaving Solve lets go of a word picked
  // up, and of a slot waiting.
  it('lets go of a picked word, and of a waiting slot, when Solve is left', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    const away = async () => {
      tab(/Look/)
      await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
      tab(/Solve/)
    }
    chip('Goliath')
    await away()
    expect(document.querySelector('[data-word="goliath"]')).not.toHaveClass('is-on')
    slot('t3')
    expect(result()).not.toHaveTextContent('That blank wants a number.')
    expect(document.querySelector('[data-slot="t3"]')).toHaveClass('is-target')
    await away()
    expect(document.querySelector('[data-slot="t3"]')).not.toHaveClass('is-target')
  })

  // The next round's second tester (#23): from 6 of 7 the one empty slot was the giant's face,
  // above the account and out of view, and he read the count as one answer wrong for three
  // minutes. A fill that leaves Solve short with no empty slot in view brings the nearest into
  // view, and so does Solve's button, tapped on Solve, where the last step rings its count.
  it('brings an empty slot into view when none is, after a fill and on Solve’s button', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    for (const [id, word] of [
      ['t1', 'brothers'],
      ['t2', 'Saul'],
      ['t3', 'six'],
    ] as const) {
      chip(word)
      slot(id)
    }
    const solve = document.querySelector('.solve')!
    const at = (sel: string, box: DOMRect) =>
      vi.spyOn(document.querySelector(sel)!, 'getBoundingClientRect').mockReturnValue(box)
    at('.solve', new DOMRect(0, 100, 360, 300))
    at('[data-face="d2"]', new DOMRect(180, -60, 160, 140))
    at('[data-slot="d2"]', new DOMRect(190, 20, 140, 44))
    at('[data-slot="t5"]', new DOMRect(40, 300, 72, 30))
    const scrolled = vi.spyOn(solve, 'scrollBy')
    chip('Goliath')
    slot('t5')
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent('6/7')
    expect(scrolled).toHaveBeenCalledWith({ top: -160 })
    scrolled.mockClear()
    tab(/Solve/)
    expect(scrolled).toHaveBeenCalledWith({ top: -160 })
  })

  // The next round's first tester (#23) went back to the picture for the cubits, and Solve opened
  // again at its top, the blank he had left out of view. Solve keeps its place across Look.
  it('keeps Solve’s place across a trip to Look', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    const solve = document.querySelector('.solve')!
    Object.defineProperty(solve, 'scrollTop', { configurable: true, get: () => 210 })
    const scrolled = vi.spyOn(Element.prototype, 'scrollBy')
    tab(/Look/)
    await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
    tab(/Solve/)
    expect(document.querySelector('.solve')).not.toBe(solve)
    expect(scrolled).toHaveBeenCalledWith({ top: 210, behavior: 'instant' })
  })
})

describe('the close converges (#95)', () => {
  const at = () => coach()?.getAttribute('data-at')
  const said = () => coach()?.querySelector('[role="status"]')?.textContent
  const ringed = () =>
    [...document.querySelectorAll('.is-wrong')].map((e) => e.getAttribute('data-slot') ?? 'order')
  // jsdom lays nothing out, and a mark shows only where its target can be seen (07c).
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(10, 10, 100, 40),
    )
  })
  afterEach(() => vi.restoreAllMocks())
  const spotsOf = (s: CaseStructure) => s.moments.flatMap((m) => m.spots)
  /** The mountain with the spots given found, and their words in the bank. */
  const mountain = (found: string[], kept: object) => {
    const spots = spotsOf(carmel).filter((x) => found.includes(x.id))
    return {
      carmel: {
        ...fresh(carmel),
        tapped: found,
        bank: [...new Set(spots.flatMap((x) => x.words))],
        ...kept,
      },
    }
  }
  const everything = spotsOf(carmel).map((x) => x.id)
  const right = {
    faces: { c1: 'elijah', c2: 'ahab' },
    order: ['baal', 'water', 'fire'],
    fills: { a1: 'said-nothing', a2: 'cried-aloud', a3: 'stones', a4: 'fell-on-faces' },
  }

  // The next round's three testers (#23): in the mountain a right change read the same as a wrong
  // one, and all three took right answers back out. Every failed close counts as a number, and from
  // the mountain's second it rings what doesn't match, the order whole as the one answer it is, each
  // ring until its answer changes; from the vineyard on, none rings (#106).
  it('counts as a number, and rings what doesn’t match from the second miss', () => {
    const missed = {
      ...right,
      faces: { c1: 'elijah', c2: 'baal' },
      order: ['water', 'fire', 'baal'],
    }
    start(<App />, mountain(everything, missed))
    openCase(/The mountain/)
    tab(/Solve/)
    const close = () => fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    close()
    expect(result()).toHaveTextContent(/^Two answers don’t fit the story\.$/)
    expect(ringed()).toEqual([])
    close()
    expect(ringed()).toEqual(['c2', 'order'])
    expect(screen.getByText(/^What happened first, ringed: doesn’t fit the story$/)).toHaveClass(
      'sr',
    )
    tile('Baal’s altar')
    orderSlot(0)
    expect(ringed()).toEqual(['c2'])
  })

  // The next round's third tester (#23) filled the valley from two of its six things, and its rings
  // said which answers didn't match but not that their words were still in the picture. A close
  // that fails with something unfound says how much, and rings Look until it opens: in a case
  // without steps with no words, and in the valley with its retry.
  it('says how much is left to find, and rings Look until it opens', async () => {
    const found = everything.filter((id) => !['ruin', 'spent'].includes(id))
    start(<App />, mountain(found, { ...right, faces: { c1: 'elijah', c2: 'baal' } }))
    openCase(/The mountain/)
    tab(/Solve/)
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(result()).toHaveTextContent(
      /^One answer doesn’t fit the story\. There are two more to find in the pictures\.$/,
    )
    expect([at(), said()]).toEqual(['[data-view="look"]', ''])
    tab(/Look/)
    await waitFor(() => expect(history.state).toEqual({ case: 'carmel' }))
    tab(/Solve/)
    expect(at()).toBeUndefined()
  })

  it('in the valley, the retry rings Look while something is unfound', () => {
    const tapped = ['boy', 'basket', 'giant', 'armor']
    const spots = spotsOf(valley).filter((x) => tapped.includes(x.id))
    start(<App />, {
      valley: {
        ...fresh(valley),
        tapped,
        bank: [...new Set(spots.flatMap((x) => x.words))],
        faces: { d1: 'david', d2: 'goliath' },
        fills: { t1: 'brothers', t2: 'saul', t3: 'ten', t4: 'sling', t5: 'goliath' },
        step: valley.steps.length - 1,
      },
    })
    openCase(/The valley/)
    tab(/Solve/)
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(result()).toHaveTextContent(
      /^One answer doesn’t fit the story\. There are two more to find in the picture\.$/,
    )
    expect([at(), said()]).toEqual([
      '[data-view="look"]',
      'Ringed answers don’t fit the story. Look closer.',
    ])
  })

  // Testers 2 and 3 (#23) tapped found things again inside "Where to look"'s ring. Its first tier
  // marks what is found inside the half it rings, and nothing outside it: the altar, found, lies in
  // the right half that the spent prophets' smaller box sends the hint to; the caller, found, in
  // the left. The altar runs across the middle, so its mark sits at the middle of its part inside
  // the ring, 569.25 of the picture's 900 across, not at the middle of the whole altar. The
  // pourers' middle lies just outside the half, but they cross into it, so they are marked at the
  // middle of their part inside, at 549 (review on open).
  it('marks what is found inside the first tier’s half', () => {
    start(<App />, mountain(['altar', 'caller', 'pourers'], {}))
    openCase(/The mountain/)
    menu('Hint')
    expect(at()).toBe('[data-half]')
    expect(document.querySelector('[data-found="altar"] circle')).toHaveAttribute('cx', '569.25')
    expect(document.querySelector('[data-found="pourers"] circle')).toHaveAttribute('cx', '549')
    expect(document.querySelector('[data-found="caller"]')).toBeNull()
    expect(document.querySelectorAll('[data-found]')).toHaveLength(2)
  })

  const marked = (cls: string) =>
    [...document.querySelectorAll(`[data-slot].${cls}`)].map((e) => e.getAttribute('data-slot'))

  // The next round's first tester (#102) read no ✓ as wrong and took right answers out four times,
  // and never changed the giant's face, ringed in a thin red line. A close that rings marks every
  // answer, a ✓ on each that fits, which keeps its word, and a ring on each that doesn't; the
  // valley's retry sits at the first answer it rang.
  it('a close that rings marks every answer, and its ✓ keeps its word', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    const his: Record<string, string> = { d2: 'Saul', t1: 'spear' }
    for (const [id, word] of valleyAnswers) {
      chip(his[id] ?? word)
      slot(id)
    }
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(marked('is-wrong')).toEqual(['d2', 't1'])
    expect(marked('is-right')).toEqual(['d1', 't3', 't2', 't4', 't5'])
    await waitFor(() => expect(coach()?.querySelector('.ring')).toHaveClass('dim'))
    expect([at(), said()]).toEqual([
      '[data-slot="d2"]',
      'Ringed answers don’t fit the story. Look closer.',
    ])
    slot('t3')
    expect(document.querySelector('[data-slot="t3"]')).toHaveTextContent('six')
  })

  // A case whose close rings, from its second miss (#95, #106), marks as the valley's does: a ✓ on
  // each face, blank, and the order that fits, and the order, ✓'d, keeps its pictures (#102).
  it('every case marks what fits once its close rings, the order too', () => {
    start(<App />, mountain(everything, { ...right, faces: { c1: 'elijah', c2: 'baal' } }))
    openCase(/The mountain/)
    tab(/Solve/)
    const close = () => fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    const question = () => screen.getByRole('heading', { name: 'What happened first' })
    close()
    expect(marked('is-right')).toEqual([])
    expect(question()).not.toHaveClass('is-right')
    close()
    expect(marked('is-wrong')).toEqual(['c2'])
    expect(marked('is-right')).toEqual(['c1', 'a1', 'a2', 'a3', 'a4'])
    expect(question()).toHaveClass('is-right')
    const places = () => [...document.querySelectorAll('.oslot')]
    expect(places().every((e) => e.classList.contains('is-right'))).toBe(true)
    orderSlot(0)
    expect(places()[0]).toHaveClass('is-filled')
  })

  // The owner's ruling [3] (#102): a close that rings brings its first ringed answer into view, in
  // every case, as the valley's does. With only the mountain's order off, its ring sat below the
  // fold at 360 × 548, under Close the case.
  it('a close that rings brings its first ringed answer into view, in every case', () => {
    start(<App />, mountain(everything, { ...right, order: ['water', 'fire', 'baal'] }))
    openCase(/The mountain/)
    tab(/Solve/)
    const solve = document.querySelector('.solve')!
    // Solve's room, and the order below it, the rest where beforeEach puts it.
    vi.mocked(Element.prototype.getBoundingClientRect).mockImplementation(function (this: Element) {
      if (this === solve) return new DOMRect(0, 100, 360, 300)
      return this.matches('.order') ? new DOMRect(20, 500, 320, 120) : new DOMRect(10, 10, 100, 40)
    })
    const scrolled = vi.spyOn(solve, 'scrollBy')
    const close = () => fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    close()
    scrolled.mockClear()
    close()
    expect(ringed()).toEqual(['order'])
    expect(scrolled).toHaveBeenCalledWith({ top: 310, left: 0 })
  })

  // A hint for the order names it by its question (#102).
  it('a hint for the order names it by its question', () => {
    start(<App />, mountain(everything, { ...right, order: ['water', 'fire', 'baal'] }))
    openCase(/The mountain/)
    tab(/Solve/)
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    menu('Hint')
    expect([at(), said()]).toEqual([
      '[data-view="look"]',
      'Something here settles “What happened first”.',
    ])
  })

  /** A case kept with everything found and filled, the answers given swapped for the words given. */
  const offBy = (s: CaseStructure, off: Record<string, string>) => {
    const kept = closedCase(s)
    return { [s.id]: { ...kept, fills: { ...kept.fills, ...off }, solved: false } }
  }

  // #106: from the vineyard on, a failed close says only how many, however often it fails, and
  // marks no answer. Closes are free, so rings would let an answer fall to its rivals with no trip
  // back to the picture; the valley and the mountain keep their marks, since they teach the loop.
  it.each([
    ['vineyard', vineyard, { s4: 'ahab', v1: 'stoned' }],
    ['battle', micaiah, { b1: 'thirty-two', b3: 'micaiah' }],
  ] as const)('in the %s, every failed close counts and marks no answer', (name, s, off) => {
    start(<App />, offBy(s, off))
    openCase(new RegExp(`The ${name}`))
    tab(/Solve/)
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
      expect(result()).toHaveTextContent(/^Two answers don’t fit the story\.$/)
      expect(document.querySelectorAll('.is-wrong, .is-right')).toHaveLength(0)
    }
  })

  // #106: where no close marks, the hint offered after the second failed close is how a stuck
  // player learns which answer doesn't fit, one at a time, as it was.
  it('in the vineyard, the hint after the second failed close names the first answer that doesn’t fit', () => {
    start(<App />, offBy(vineyard, { s4: 'ahab', v1: 'stoned' }))
    openCase(/The vineyard/)
    tab(/Solve/)
    const close = () => fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    close()
    close()
    fireEvent.click(screen.getByRole('button', { name: 'Where to look' }))
    expect([at(), said()]).toEqual([
      '[data-view="look"]',
      'Something here settles “but written by ___”.',
    ])
  })
})

describe('the case solved (#6, 03c; #24)', () => {
  it('Solve counts what is filled and holds who is who, the account, and the bank', () => {
    start()
    openCase(/The valley/)
    tapSpot('boy')
    fireEvent.click(document.querySelector('.dock')!)
    tab(/Solve/)
    expect(screen.getByRole('heading', { name: 'Who is who' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The account' })).toBeInTheDocument()
    expect(document.querySelector('.bank')).toHaveTextContent(
      /^namesthingsactionsnumbersDavidsling$/,
    )
    expect(screen.queryByRole('button', { name: /Close the case/ })).not.toBeInTheDocument()
  })

  // The guided steps hold the screen, so a word of another kind is refused once they are done (#77).
  it('a blank refuses a word of another kind by name, in the bank’s head', async () => {
    start()
    openCase(/The valley/)
    guide()
    tab(/Look/)
    await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
    tapSpot('brook')
    tab(/Solve/)
    slot('t1')
    chip('five')
    const head = document.querySelector('.bank-head')
    expect(head).toHaveTextContent(/^That blank wants a thing\.$/)
    chip('stones')
    slot('t1')
    expect(head).toHaveTextContent(/^namesthingsactionsnumbers$/)
    expect(document.querySelector('[data-slot="t1"]')).toHaveTextContent('stones')
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent('3/7')
  })

  // Playtest 2 (#23): with only David and sling found, "That blank wants a number." read as "type
  // one in". While no word of the blank's kind is found, the note says where words come from (#71).
  it('a refusal says where to find a word of the kind while none is found', async () => {
    start()
    openCase(/The valley/)
    guide()
    // The sweep holds Solve until Look opens (#77): to Look, finding nothing, and back.
    tab(/Look/)
    await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
    tab(/Solve/)
    slot('t3')
    chip('David')
    expect(result()).toHaveTextContent(/^That blank wants a number\. Find one in the picture\.$/)
    // A refused word stays picked up; tapped again, it is put down.
    chip('David')
    tab(/Look/)
    await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
    tapSpot('brook')
    tab(/Solve/)
    slot('t3')
    chip('David')
    expect(result()).toHaveTextContent(/^That blank wants a number\.$/)
  })

  // The tutorial goes all the way to rule 5 (#26 [4]): a ✓ only on the slots its steps name, Close
  // the case once they are done, and the same coarse check as every case.
  it('the tutorial marks only its guided slots and closes on Close the case, like any case', async () => {
    start()
    openCase(/The valley/)
    await sweep()
    expect(coach()).toHaveAttribute('data-at', '[data-view="solve"]')
    expect(screen.queryByRole('button', { name: /Close the case/ })).not.toBeInTheDocument()
    for (const [id, word] of valleyAnswers.slice(1, 3)) {
      chip(word)
      slot(id)
    }
    expect(document.querySelector('[data-slot="d1"]')).toHaveClass('is-right')
    expect(document.querySelector('[data-slot="t4"]')).toHaveClass('is-right')
    expect(document.querySelector('[data-slot="d2"]')).not.toHaveClass('is-right')
    expect(document.querySelector('[data-slot="t1"]')).not.toHaveClass('is-right')
    for (const [id, word] of [
      ['t2', 'David'],
      ['t3', 'six'],
      ['t5', 'Goliath'],
    ] as const) {
      chip(word)
      slot(id)
    }
    // The sword's blank is asked about only on a miss, so until then it takes no ✓ (#77).
    expect(document.querySelector('[data-slot="t5"]')).not.toHaveClass('is-right')
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(result()).toHaveTextContent('One answer doesn’t fit the story.')
    expect(screen.queryByRole('heading', { name: 'The case is closed.' })).not.toBeInTheDocument()
    slot('t2')
    chip('Saul')
    slot('t2')
    expect(document.querySelector('[data-slot="t2"]')).not.toHaveClass('is-right')
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(screen.getByRole('heading', { name: 'The case is closed.' })).toBeInTheDocument()
  })

  it('the tutorial closed, the reveal reads the passages as verses', async () => {
    start(<App passages={numbered} />)
    openCase(/The valley/)
    await solveTheValley()
    expect(screen.getByRole('heading', { name: 'The case is closed.' })).toBeInTheDocument()
    expect(screen.getByText(/The boy was David/)).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(document.querySelector('.bank')).toBeNull()
    // Each passage under its label, marked with its translation; the notice and its link beneath
    // them (#3).
    expect(screen.getByRole('heading', { name: '1 Samuel 17:4 ESV' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '1 Samuel 17:17–18 ESV' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '1 Samuel 17:38–51 ESV' })).toBeInTheDocument()
    expect(screen.getByText(/^Scripture quotations are from the ESV/)).toHaveClass('attribution')
    expect(screen.getByRole('link', { name: 'www.esv.org' })).toHaveAttribute(
      'href',
      'https://www.esv.org',
    )
    expect(await screen.findAllByText('38')).toHaveLength(3)
    const numberless = screen.getAllByText('A line with no number.')
    expect(numberless).toHaveLength(3)
    expect(numberless[0].querySelector('sup')).toBeNull()
    expect(screen.getAllByText(/One thing\./)[0].querySelector('sup')).toHaveTextContent('38')
    fireEvent.click(screen.getByRole('button', { name: 'Back to cases' }))
    await waitFor(() => expect(screen.getByText('Closed ✓')).toBeInTheDocument())
  })

  /** The misses leading the reveal, each line as it reads, its verse's link last. */
  const missed = () => [...document.querySelectorAll('.missed li')].map((li) => li.textContent)

  // #107: the reveal leads with what the closes found wrong, ahead of the telling: each answer as a
  // hint names it, what it was, what was put there, and a link to the verse that says it, which
  // marks the verse in its passage and brings it into view. The most tried lead, and a reload keeps
  // them.
  it('the reveal leads with what the closes found wrong, each with a link to its verse', async () => {
    const kept = closedCase(vineyard)
    const faces = { ...kept.faces, p1: 'naboth' }
    const fills = { ...kept.fills, s4: 'ahab', v1: 'stoned' }
    const { unmount } = start(<App passages={versed} />, {
      vineyard: { ...kept, solved: false, faces, fills },
    })
    openCase(/The vineyard/)
    tab(/Solve/)
    const close = () => fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    close()
    chip('Naboth')
    slot('s4')
    close()
    for (const [id, word] of [
      ['p1', 'Ahab'],
      ['s4', 'Jezebel'],
      ['v1', 'killed'],
    ]) {
      chip(word)
      slot(id)
    }
    close()
    const said = [
      '“but written by ___”: Jezebel. You put Ahab, then Naboth. 21:8',
      '“the man on the bed”: Ahab. You put Naboth. 21:4',
      '“First you ___”: killed. You put stoned. 21:19',
    ]
    expect(missed()).toEqual(said)
    const story = screen.getByText(/^The man on the bed was Ahab/)
    expect(document.querySelector('.missed')!.compareDocumentPosition(story)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    await screen.findByText('Made-up words, verse 8.')
    const into = vi.fn()
    Element.prototype.scrollIntoView = into
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Read 21:8' }))
      await waitFor(() => expect(into).toHaveBeenCalledOnce())
      const cited = document.querySelectorAll('.passage .is-cited')
      expect([...cited].map((p) => p.textContent)).toEqual(['8Made-up words, verse 8.'])
      expect(into.mock.contexts[0]).toBe(cited[0])
    } finally {
      Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
    }
    unmount()
    render(<App passages={versed} />)
    expect(missed()).toEqual(said)
  })

  // Three misses lead, and the rest wait under a button; the order's line names it in turn, then
  // the order as put, and its link is the verse of what came first. A closed case's return from
  // the cards opens on its reveal, its misses kept (#107).
  it('three misses lead the reveal and the rest wait under a button, the order named in turn', () => {
    const misses = {
      p1: ['naboth'],
      p3: ['ahab'],
      order: ['gate bedchamber vineyard'],
      s4: ['ahab', 'naboth'],
      v1: ['stoned'],
    }
    start(<App passages={versed} />, { vineyard: { ...closedCase(vineyard), misses } })
    openCase(/The vineyard/)
    expect(missed()).toEqual([
      '“but written by ___”: Jezebel. You put Ahab, then Naboth. 21:8',
      '“the man on the bed”: Ahab. You put Naboth. 21:4',
      '“the seated man”: Naboth. You put Ahab. 21:12',
    ])
    fireEvent.click(screen.getByRole('button', { name: '2 more' }))
    expect(missed().slice(3)).toEqual([
      '“What happened first”: Bedchamber, then The gate, then The vineyard. You put The gate, Bedchamber, The vineyard. 21:8',
      '“First you ___”: killed. You put stoned. 21:19',
    ])
    expect(screen.queryByRole('button', { name: /more$/ })).toBeNull()
  })

  // Review round 1 (#111): a link tapped before its passage had come back brought the loading line
  // into view, and once the verses were drawn, the marked one could sit far off screen. The link's
  // verse comes to the middle of the screen once it is drawn, however soon the tap came (#107).
  it('a link tapped while its passage loads brings its verse into view once it is drawn', async () => {
    let arrive = () => {}
    const slow: PassageService = (passage, translation) =>
      new Promise((resolve) => {
        arrive = () => void versed(passage, translation).then(resolve)
      })
    start(<App passages={slow} />, {
      vineyard: { ...closedCase(vineyard), misses: { s4: ['ahab'] } },
    })
    openCase(/The vineyard/)
    expect(screen.getByText('Loading 1 Kings 21…')).toBeInTheDocument()
    const into = vi.fn()
    Element.prototype.scrollIntoView = into
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Read 21:8' }))
      await waitFor(() => expect(into).toHaveBeenCalledOnce())
      expect(into.mock.contexts[0]).toBe(document.querySelector('.passage'))
      act(() => arrive())
      await screen.findByText('Made-up words, verse 8.')
      await waitFor(() => expect(into).toHaveBeenCalledTimes(2))
      expect(into.mock.contexts[1]).toBe(document.querySelector('.passage .is-cited'))
      expect(into.mock.contexts[1]).toHaveTextContent('8Made-up words, verse 8.')
    } finally {
      Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
    }
  })

  it('a case without steps closes on the submit, and says how far off it was', () => {
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
    expect(screen.queryByRole('button', { name: /Close the case/ })).not.toBeInTheDocument()
    for (const [id, word] of [
      ['p1', 'Ahab'],
      ['p2', 'Jezebel'],
      ['p3', 'Naboth'],
    ] as const) {
      chip(word)
      slot(id)
    }
    tile('Bedchamber')
    orderSlot(0)
    tile('The gate')
    orderSlot(1)
    tile('The vineyard')
    orderSlot(2)
    const fills: [string, string][] = [
      ['s1', 'vineyard'],
      ['s2', 'garden'],
      ['s3', 'silver'],
      ['s4', 'Jezebel'],
      ['s5', 'the king'],
      ['v1', 'killed'],
      ['v2', 'taken possession'],
    ]
    for (const [id, word] of fills) {
      chip(word)
      slot(id)
    }
    const submit = screen.getByRole('button', { name: 'Close the case' })
    expect(submit).toBeEnabled()
    fireEvent.click(submit)
    expect(result()).toHaveTextContent(
      'Three answers don’t fit the story. There are nine more to find in the pictures.',
    )
    expect(screen.queryByRole('heading', { name: 'The case is closed.' })).not.toBeInTheDocument()
    for (const [id, word] of [
      ['s1', 'garden'],
      ['s2', 'vineyard'],
    ] as const) {
      slot(id)
      chip(word)
      slot(id)
    }
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(result()).toHaveTextContent(
      'One answer doesn’t fit the story. There are nine more to find in the pictures.',
    )
    slot('s3')
    chip('inheritance')
    slot('s3')
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(screen.getByRole('heading', { name: 'The case is closed.' })).toBeInTheDocument()
    expect(screen.getByText(/The man on the bed was Ahab/)).toBeInTheDocument()
  })

  it('the reveal shows the failure line under each passage when the proxy cannot be reached, or refuses', async () => {
    // The default service asks the proxy, and no test reaches the network (src/test/setup.ts).
    const { unmount } = start()
    openCase(/The valley/)
    await solveTheValley()
    expect(
      await screen.findByText(
        'The passage couldn’t be fetched. Read 1 Samuel 17:17–18 in your own Bible.',
      ),
    ).toBeInTheDocument()
    for (const label of ['1 Samuel 17:4', '1 Samuel 17:38–51'])
      expect(
        await screen.findByText(
          `The passage couldn’t be fetched. Read ${label} in your own Bible.`,
        ),
      ).toBeInTheDocument()
    expect(document.querySelectorAll('.passage sup')).toHaveLength(0)
    unmount()
    history.replaceState(null, '')
    // A closed case in the store opens on its reveal, and the service refuses.
    localStorage.setItem('behold.progress', JSON.stringify({ vineyard: closedCase(vineyard) }))
    start(<App passages={() => Promise.reject(new Error('down'))} />)
    expect(screen.getByText('Closed ✓')).toBeInTheDocument()
    openCase(/The vineyard/)
    expect(
      await screen.findByText(
        'The passage couldn’t be fetched. Read 1 Kings 21 in your own Bible.',
      ),
    ).toBeInTheDocument()
  })

  it('the reveal is a history entry: back returns to the case, and Back to cases pops both (Gate 03 [1])', async () => {
    start()
    openCase(/The valley/)
    await solveTheValley()
    expect(history.state).toEqual({ case: 'valley', view: 'reveal' })
    history.back()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Who is who' })).toBeInTheDocument(),
    )
    expect(history.state).toEqual({ case: 'valley' })
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent('7/7')
    history.forward()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'The case is closed.' })).toBeInTheDocument(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Back to cases' }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Behold' })).toBeInTheDocument(),
    )
    expect(history.state).toBeNull()
  })

  it('a closed case opens on its reveal with both entries, and Restart from the reveal starts it over', async () => {
    start()
    openCase(/The valley/)
    await solveTheValley()
    fireEvent.click(screen.getByRole('button', { name: 'Back to cases' }))
    await waitFor(() => expect(screen.getByText('Closed ✓')).toBeInTheDocument())
    openCase(/The valley/)
    expect(screen.getByRole('heading', { name: 'The case is closed.' })).toBeInTheDocument()
    expect(history.state).toEqual({ case: 'valley', view: 'reveal' })
    history.back()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Who is who' })).toBeInTheDocument(),
    )
    history.forward()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'The case is closed.' })).toBeInTheDocument(),
    )
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    menu('Restart')
    confirm.mockRestore()
    expect(screen.getByRole('dialog', { name: 'The valley' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent('0/7')
    await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
    expect(screen.getByRole('dialog', { name: 'The valley' })).toBeInTheDocument()
  })

  // A restart from a closed case's own entry leaves the reveal's entry ahead; forward must not
  // show a fresh case's solution, so the entry becomes a case entry instead (review round 1, #21).
  // A restart from the reveal turns its entry into a case entry itself (#77), so this one starts
  // from the case's own, a step back from the reveal.
  it('a reveal entry left ahead by a restart shows no solution, and becomes a case entry', async () => {
    start()
    openCase(/The valley/)
    await solveTheValley()
    // jsdom fires each move's popstate on a later task; the handlers have run once it arrives.
    const popped = () =>
      new Promise<void>((r) => addEventListener('popstate', () => r(), { once: true }))
    let landed = popped()
    history.back()
    await landed
    expect(history.state).toEqual({ case: 'valley' })
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    menu('Restart')
    confirm.mockRestore()
    landed = popped()
    history.forward()
    await landed
    expect(history.state).toEqual({ case: 'valley' })
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'The valley' })).toBeInTheDocument(),
    )
    expect(screen.queryByRole('heading', { name: 'The case is closed.' })).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent('0/7')
  })

  // The case entry beneath the reveal is the case with its answers: forward from the cards, or a
  // reload on that entry, shows Solve, not Look (review round 1, #21).
  it('a solved case’s own entry mounts on Solve: forward from the cards, and a reload on it', async () => {
    const { unmount } = start()
    openCase(/The valley/)
    await solveTheValley()
    fireEvent.click(screen.getByRole('button', { name: 'Back to cases' }))
    await waitFor(() => expect(screen.getByText('Closed ✓')).toBeInTheDocument())
    history.forward()
    await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
    expect(screen.getByRole('heading', { name: 'Who is who' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent('7/7')
    expect(screen.queryByRole('heading', { name: 'The case is closed.' })).not.toBeInTheDocument()
    unmount()
    history.replaceState({ case: 'valley' }, '')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Who is who' })).toBeInTheDocument()
    expect(document.querySelector('[data-slot="t4"]')).toHaveClass('is-right')
  })
})
