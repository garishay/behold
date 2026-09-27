import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { PassageService } from './passages/service.ts'

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

/** The tutorial's answers, faces and blanks. */
const valleyAnswers: [string, string][] = [
  ['d1', 'David'],
  ['d2', 'Goliath'],
  ['t1', 'ten'],
  ['t2', 'commander'],
  ['t3', 'six'],
  ['t4', 'sling'],
  ['t5', 'Goliath'],
]

/** The tutorial played through: every spot with a word tapped, every slot filled right, closed. */
const solveTheValley = () => {
  for (const s of ['boy', 'giant', 'brook', 'armor', 'basket']) tapSpot(s)
  tab(/Solve/)
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

describe('the title screen (Gate 01 A6, #6)', () => {
  it('keeps the title, the epigraph with its notice, and the two lines', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Behold' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'It is the glory of God to conceal things, but the glory of kings is to search things out.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Proverbs 25:2, ESV')).toBeInTheDocument()
    expect(
      screen.getByText(/Scripture quotations are from the ESV® Bible .* All rights reserved\./),
    ).toBeInTheDocument()
    expect(
      screen.getByText("You know the stories. You don't know the details."),
    ).toBeInTheDocument()
    expect(screen.getByText('Season one is being written.')).toBeInTheDocument()
  })

  it('lists every registered case as a card, the tutorial first, with no status before a visit', () => {
    render(<App />)
    const cards = screen.getAllByRole('button')
    expect(cards.map((c) => c.querySelector('.ct')?.textContent)).toEqual([
      'The valley',
      'The vineyard',
    ])
    expect(cards[0]).toHaveTextContent('Learn to play')
    expect(screen.queryByText('In progress')).not.toBeInTheDocument()
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})

describe('the case screen explored (#6, 03b; #24)', () => {
  it('opens a fresh case on Look, the brief’s card over the picture, Look and Solve at the foot', () => {
    render(<App />)
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

  it('the brief’s card goes with the first tap, and the menu holds the brief, Cases, and Restart', () => {
    render(<App />)
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
    ).toEqual(['Cases', 'Restart'])
  })

  it('a tap shows the caption and what it found, and its words wait on Solve, ringed', () => {
    render(<App />)
    openCase(/The valley/)
    tapSpot('boy')
    expect(screen.getByText(/A shepherd boy in a plain tunic/)).toBeInTheDocument()
    expect(screen.getByText(/Found:/)).toHaveTextContent(
      'Found: David, sling · one of the faces in Solve',
    )
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveTextContent('Look1/6')
    expect(coach()).toHaveTextContent('Open Solve to name him.')
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent('Solve0/7+2')
    tapSpot('giant')
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent('Solve0/7+6')
    tab(/Solve/)
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent(/^Solve0\/7$/)
    expect(chips().map((c) => c.textContent)).toEqual([
      'David',
      'sling',
      'Goliath',
      'six',
      'spear',
      'sword',
    ])
    expect(chips().every((c) => c.classList.contains('is-new'))).toBe(true)
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

  it('a chip picked up is marked, and put down on a second tap', () => {
    render(<App />)
    openCase(/The valley/)
    tapSpot('brook')
    tab(/Solve/)
    fireEvent.click(chips()[0])
    expect(chips()[0]).toHaveClass('is-on')
    fireEvent.click(chips()[0])
    expect(chips()[0]).not.toHaveClass('is-on')
  })

  it('the picker switches the moment and clears the caption; Zoom toggles', () => {
    render(<App />)
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
    render(<App />)
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
    render(<App />)
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
    render(<App />)
    openCase(/The vineyard/)
    moment('Bedchamber')
    const svg = screen.getByRole('img', { name: 'Bedchamber' })
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 320, 400))
    fireEvent.click(svg, { clientX: 180, clientY: 380 })
    expect(screen.getByRole('tab', { name: /Look/ })).toHaveTextContent('Look0/18')
    fireEvent.click(svg, { clientX: 250, clientY: 214 })
    expect(screen.getByRole('dialog', { name: 'The seal' })).toBeInTheDocument()
  })

  // jsdom lays nothing out, so the caption's overflow is given: taller than the dock for the giant,
  // not for the brook (#24).
  it('a caption longer than the dock shows More, which opens it whole until the next tap', () => {
    const tall = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
    tall.mockImplementation(function (this: HTMLElement) {
      return this.textContent?.startsWith('The Philistines') ? 90 : 0
    })
    try {
      render(<App />)
      openCase(/The valley/)
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
    render(<App />)
    openCase(/The valley/)
    tapSpot('giant')
    expect(screen.getByText(/Found:/)).toHaveTextContent('Found: Goliath, six, spear, sword')
    expect(screen.getByText(/a sheathed sword across his back/)).toBeInTheDocument()
    expect(document.querySelector('[data-spot="sheath"]')).toBeNull()
  })

  it('a paper opens over the screen on the tap, and its copy lands in Papers', () => {
    render(<App />)
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

  // A second tap on the seal opens the paper again but copies nothing, and the console says so by
  // saying nothing (review round 3, #20).
  it('a repeat tap on a paper reopens it and reports no copy', () => {
    render(<App />)
    openCase(/The vineyard/)
    moment('Bedchamber')
    tapSpot('seal')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    tapSpot('seal')
    expect(screen.getByRole('dialog', { name: 'The seal' })).toBeInTheDocument()
    expect(screen.queryByText(/copied to Papers/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Found:/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    tab(/Solve/)
    expect(screen.getByRole('button', { name: /Papers/ })).toHaveTextContent('Papers1')
  })

  it('Solve offers Papers only once a paper has been opened', () => {
    render(<App />)
    openCase(/The vineyard/)
    tab(/Solve/)
    expect(screen.queryByRole('button', { name: /Papers/ })).not.toBeInTheDocument()
  })

  it('progress is kept on the device, and Restart clears the open case after a confirm', () => {
    const { unmount } = render(<App />)
    openCase(/The valley/)
    tapSpot('boy')
    unmount()
    history.replaceState(null, '')
    render(<App />)
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
    render(<App />)
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
    expect(history.state).toEqual({ case: 'vineyard' })
    menu('Cases')
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Behold' })).toBeInTheDocument(),
    )
    expect(history.state).toBeNull()
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
      render(<App />)
      openCase(/The vineyard/)
      expect(requested.sort()).toEqual(
        ['bedchamber.jpg', 'gate.jpg', 'p1.jpg', 'p2.jpg', 'p3.jpg', 'vineyard.jpg'].map(
          (f) => `/cases/vineyard/${f}`,
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
      render(<App />)
      openCase(/The valley/)
      expect(requested).toEqual([])
      ready()
      await waitFor(() => expect(requested).toHaveLength(3))
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
  /** The valley played to its fourth step: David named, sling picked up for its blank. */
  const toSling = () => {
    render(<App />)
    openCase(/The valley/)
    tapSpot('boy')
    tab(/Solve/)
    chip('David')
    slot('d1')
    chip('sling')
  }

  // The case screen never scrolls, so a mark brings its target to the middle of the target's own
  // scroll box, the account, and leaves the page alone (07c, #24 [1]). jsdom doesn't clamp a
  // scroll at 0 as a phone does, so the test reads the one move to Close the case.
  it('brings its target to the middle of the account, and never scrolls the page', () => {
    const intoView = vi.fn()
    Element.prototype.scrollIntoView = intoView
    try {
      boxes = {
        '[data-close]': new DOMRect(0, 500, 360, 50),
        '.solve': new DOMRect(0, 0, 360, 400),
      }
      toSling()
      const before = document.querySelector('.solve')!.scrollTop
      slot('t4')
      expect(at()).toBe('[data-close]')
      expect(document.querySelector('.solve')!.scrollTop - before).toBe(325)
      expect(document.documentElement.scrollTop).toBe(0)
      expect(intoView).not.toHaveBeenCalled()
    } finally {
      Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
    }
  })

  // A mark is drawn only where its target can be seen: out of the account's view it shows no ring
  // and no words, and part in view its ring is cut at the account's edge (07c, #24 [2]).
  it('shows nothing while its target is out of view, and cuts its ring at the scroll box', async () => {
    boxes = { '[data-close]': new DOMRect(0, 500, 360, 50), '.solve': new DOMRect(0, 0, 360, 400) }
    toSling()
    slot('t4')
    await new Promise((r) => setTimeout(r, 100))
    expect(at()).toBe('[data-close]')
    expect(ring()).toBeNull()
    expect(document.querySelector('.coach .label')).toBeNull()
    boxes['[data-close]'] = new DOMRect(0, 380, 360, 50)
    fireEvent.scroll(document.querySelector('.solve')!)
    await waitFor(() => expect(ring()).not.toBeNull())
    expect([ring()!.style.top, ring()!.style.height]).toEqual(['376px', '24px'])
  })

  it('shows each step at its target, or at the button of the view that holds it', () => {
    render(<App />)
    openCase(/The valley/)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect([at(), said()]).toEqual(['[data-spot="boy"]', 'Tap the boy with the sling.'])
    tab(/Solve/)
    expect(at()).toBe('[data-view="look"]')
    tab(/Look/)
    tapSpot('boy')
    expect([at(), said()]).toEqual(['[data-view="solve"]', 'Open Solve to name him.'])
    tab(/Solve/)
    expect([at(), said()]).toEqual([
      '[data-word="david"]',
      'Tap David, then the slot under the boy.',
    ])
    chip('David')
    expect(at()).toBe('[data-slot="d1"]')
    slot('d1')
    expect([at(), said()]).toEqual(['[data-word="sling"]', 'Now tap sling, then its blank.'])
    slot('t4')
    expect(at()).toBe('[data-word="sling"]')
    chip('sling')
    expect([at(), said()]).toEqual(['[data-close]', 'Fill the rest, then close the case.'])
    tab(/Look/)
    expect(at()).toBe('[data-view="solve"]')
  })

  it('marks nothing under the brief’s card or the menu, and nothing in a case without steps', async () => {
    render(<App />)
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

  // Persistent, not blocking (#25): the ring stays until the step is done, a tap elsewhere is
  // still play, and the first one lifts the dim.
  it('blocks nothing: a tap elsewhere plays, lifts the dim, and leaves the ring', async () => {
    render(<App />)
    openCase(/The valley/)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    const ring = () => document.querySelector('.coach .ring')
    await waitFor(() => expect(ring()).toHaveClass('dim'))
    fireEvent.pointerDown(document.querySelector('[data-spot="boy"]')!)
    expect(ring()).toHaveClass('dim')
    fireEvent.pointerDown(document.querySelector('[data-spot="giant"]')!)
    tapSpot('giant')
    expect(screen.getByText(/The Philistines’ champion/)).toBeInTheDocument()
    expect(ring()).not.toHaveClass('dim')
    expect([at(), said()]).toEqual(['[data-spot="boy"]', 'Tap the boy with the sling.'])
    tapSpot('boy')
    await waitFor(() => expect(ring()).toHaveClass('dim'))
  })

  // A step can sit on a phone for minutes, so the mark stops reading its target's place once it
  // has held still, about half a second, and a scroll, a resize, or a tap wakes it ([Q6] on #12).
  // jsdom's target never moves, so it settles after its first frames.
  it('stops following a target that holds still, and a scroll wakes it', async () => {
    const frames = vi.spyOn(window, 'requestAnimationFrame')
    const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))
    try {
      render(<App />)
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
  // leave on the next tap after they show; its ring stays until the case closes (#24, ruling [3]).
  it('the last step’s words leave on the next tap, and its ring stays', async () => {
    render(<App />)
    openCase(/The valley/)
    tapSpot('boy')
    tab(/Solve/)
    for (const [id, word] of [
      ['d1', 'David'],
      ['t4', 'sling'],
    ] as const) {
      chip(word)
      slot(id)
    }
    await waitFor(() => expect(document.querySelector('.coach .label')).not.toBeNull())
    expect([at(), said()]).toEqual(['[data-close]', 'Fill the rest, then close the case.'])
    fireEvent.pointerDown(document.querySelector('[data-slot="t1"]')!)
    expect(document.querySelector('.coach .label')).toBeNull()
    expect(document.querySelector('.coach .ring')).not.toHaveClass('dim')
    expect([at(), said()]).toEqual(['[data-close]', ''])
    tab(/Look/)
    expect([at(), said()]).toEqual(['[data-view="solve"]', ''])
    // The dim left with the words, and a new target doesn't bring it back (#24, addendum (b)).
    expect(document.querySelector('.coach .ring')).not.toHaveClass('dim')
  })
})

describe('the case solved (#6, 03c; #24)', () => {
  it('Solve counts what is filled and holds who is who, the account, and the bank', () => {
    render(<App />)
    openCase(/The valley/)
    tapSpot('boy')
    tab(/Solve/)
    expect(screen.getByRole('heading', { name: 'Who is who' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The account' })).toBeInTheDocument()
    expect(document.querySelector('.bank')).toHaveTextContent(
      /^namesthingsactionsnumbersDavidsling$/,
    )
    expect(screen.queryByRole('button', { name: /Close the case/ })).not.toBeInTheDocument()
  })

  it('a blank refuses a word of another kind by name, in the bank’s head', () => {
    render(<App />)
    openCase(/The valley/)
    tapSpot('boy')
    tapSpot('brook')
    tab(/Solve/)
    slot('t4')
    chip('five')
    const head = document.querySelector('.bank-head')
    expect(head).toHaveTextContent(/^That blank wants a thing\.$/)
    chip('sling')
    slot('t4')
    expect(head).toHaveTextContent(/^namesthingsactionsnumbers$/)
    expect(document.querySelector('[data-slot="t4"]')).toHaveClass('is-right')
    expect(screen.getByRole('tab', { name: /Solve/ })).toHaveTextContent('1/7')
  })

  // The tutorial goes all the way to rule 5 (#26 [4]): a ✓ only on the slots its steps name, Close
  // the case once they are done, and the same coarse check as every case.
  it('the tutorial marks only its guided slots and closes on Close the case, like any case', () => {
    render(<App />)
    openCase(/The valley/)
    for (const s of ['boy', 'giant', 'brook', 'armor', 'basket']) tapSpot(s)
    tab(/Solve/)
    for (const [id, word] of valleyAnswers.slice(0, 3)) {
      chip(word)
      slot(id)
    }
    expect(screen.queryByRole('button', { name: /Close the case/ })).not.toBeInTheDocument()
    expect(document.querySelector('[data-slot="d1"]')).toHaveClass('is-right')
    expect(document.querySelector('[data-slot="d2"]')).not.toHaveClass('is-right')
    expect(document.querySelector('[data-slot="t1"]')).not.toHaveClass('is-right')
    chip('sling')
    slot('t4')
    expect(document.querySelector('[data-slot="t4"]')).toHaveClass('is-right')
    expect(coach()).toHaveAttribute('data-at', '[data-close]')
    for (const [id, word] of [
      ['t2', 'brothers'],
      ['t3', 'six'],
      ['t5', 'Goliath'],
    ] as const) {
      chip(word)
      slot(id)
    }
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(result()).toHaveTextContent('One or two are wrong.')
    expect(screen.queryByRole('heading', { name: 'The case is closed.' })).not.toBeInTheDocument()
    slot('t2')
    chip('commander')
    slot('t2')
    expect(document.querySelector('[data-slot="t2"]')).not.toHaveClass('is-right')
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(screen.getByRole('heading', { name: 'The case is closed.' })).toBeInTheDocument()
  })

  it('the tutorial closed, the reveal reads the passages as verses', async () => {
    render(<App passages={numbered} />)
    openCase(/The valley/)
    solveTheValley()
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

  it('a case without steps closes on the submit, and says how far off it was', () => {
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
    expect(screen.getByRole('button', { name: /Close the case — 0 of 11 filled/ })).toBeDisabled()
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
    expect(result()).toHaveTextContent('Several are wrong.')
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
    expect(result()).toHaveTextContent('One or two are wrong.')
    slot('s3')
    chip('inheritance')
    slot('s3')
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(screen.getByRole('heading', { name: 'The case is closed.' })).toBeInTheDocument()
    expect(screen.getByText(/The man on the bed was Ahab/)).toBeInTheDocument()
  })

  it('the reveal shows the failure line under each passage when the proxy cannot be reached, or refuses', async () => {
    // The default service asks the proxy, and no test reaches the network (src/test/setup.ts).
    const { unmount } = render(<App />)
    openCase(/The valley/)
    solveTheValley()
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
    localStorage.setItem(
      'behold.progress',
      JSON.stringify({
        vineyard: {
          moment: 'vineyard',
          tapped: [],
          bank: [],
          papers: [],
          faces: {},
          order: [null, null, null],
          fills: {},
          step: 0,
          solved: true,
        },
      }),
    )
    render(<App passages={() => Promise.reject(new Error('down'))} />)
    expect(screen.getByText('Closed ✓')).toBeInTheDocument()
    openCase(/The vineyard/)
    expect(
      await screen.findByText(
        'The passage couldn’t be fetched. Read 1 Kings 21 in your own Bible.',
      ),
    ).toBeInTheDocument()
  })

  it('the reveal is a history entry: back returns to the case, and Back to cases pops both (Gate 03 [1])', async () => {
    render(<App />)
    openCase(/The valley/)
    solveTheValley()
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
    render(<App />)
    openCase(/The valley/)
    solveTheValley()
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

  // Restart from the reveal steps back and leaves the reveal's entry ahead; forward must not show
  // a fresh case's solution, so the entry becomes a case entry instead (review round 1, #21).
  it('a reveal entry left ahead by a restart shows no solution, and becomes a case entry', async () => {
    render(<App />)
    openCase(/The valley/)
    solveTheValley()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    menu('Restart')
    confirm.mockRestore()
    await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
    // jsdom fires the forward's popstate on a later task; the handler has run once it arrives.
    const popped = new Promise<void>((r) => addEventListener('popstate', () => r(), { once: true }))
    history.forward()
    await popped
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
    const { unmount } = render(<App />)
    openCase(/The valley/)
    solveTheValley()
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
