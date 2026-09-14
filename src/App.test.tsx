import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
const moment = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

/** A passage service for the tests: made-up words with verse numbers, never scripture. */
const numbered: PassageService = () =>
  Promise.resolve({
    verses: [
      { number: 38, text: 'One thing.' },
      { number: 39, text: 'Another thing.' },
      { text: 'A line with no number.' },
    ],
  })

/** The tutorial played through: every spot tapped, every face and blank filled right. */
const solveTheValley = () => {
  for (const s of ['boy', 'giant', 'brook', 'armor', 'basket']) tapSpot(s)
  tab(/Think/)
  const answers: [string, string][] = [
    ['d1', 'David'],
    ['d2', 'Goliath'],
    ['t1', 'cheeses'],
    ['t2', 'armor'],
    ['t3', 'five'],
    ['t4', 'sling'],
    ['t5', 'sword'],
  ]
  for (const [id, word] of answers) {
    chip(word)
    slot(id)
  }
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

describe('the case screen explored (#6, 03b)', () => {
  it('opens a case on its brief, its first moment, the first step, and an empty bank', () => {
    render(<App />)
    openCase(/The valley/)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/A giant lies face-down/)
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Moments',
      'Think0/7',
      'Papers',
    ])
    expect(screen.getByText('Tap the boy with the sling.')).toBeInTheDocument()
    expect(screen.getByText('The valley · 0 of 6 things found here')).toBeInTheDocument()
    expect(screen.getByText('Tap anything that looks like it matters.')).toBeInTheDocument()
    expect(screen.getByText('Nothing yet. Tap things in the picture.')).toBeInTheDocument()
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('a tap shows the caption and what was found, rings the new chips, and moves the tutorial on', () => {
    render(<App />)
    openCase(/The valley/)
    tapSpot('boy')
    expect(screen.getByText(/A shepherd boy, sling still swinging/)).toBeInTheDocument()
    expect(screen.getByText(/Found:/)).toHaveTextContent('Found: David, sling')
    expect(screen.getByText('The valley · 1 of 6 things found here')).toBeInTheDocument()
    expect(screen.getByText(/Open Think at the top/)).toBeInTheDocument()
    expect(chips().map((c) => c.textContent)).toEqual(['David', 'sling'])
    expect(chips().every((c) => c.classList.contains('is-new'))).toBe(true)
    tapSpot('boy')
    expect(chips()).toHaveLength(2)
    expect(chips().some((c) => c.classList.contains('is-new'))).toBe(false)
  })

  it('a chip picked up is marked, and put down on a second tap', () => {
    render(<App />)
    openCase(/The valley/)
    tapSpot('brook')
    fireEvent.click(chips()[0])
    expect(chips()[0]).toHaveClass('is-on')
    fireEvent.click(chips()[0])
    expect(chips()[0]).not.toHaveClass('is-on')
  })

  it('the picker switches the moment and clears the caption; Zoom toggles', () => {
    render(<App />)
    openCase(/The vineyard/)
    expect(screen.getByText('The vineyard · 0 of 5 things found here')).toBeInTheDocument()
    tapSpot('cord')
    expect(screen.getByText(/Servants stretching a cord/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Bedchamber' }))
    expect(screen.getByText('Bedchamber · 0 of 8 things found here')).toBeInTheDocument()
    expect(screen.getByText('Tap anything that looks like it matters.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Bedchamber' })).toBeInTheDocument()
    const zoom = screen.getByRole('button', { name: 'Zoom' })
    expect(zoom).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(zoom)
    expect(zoom).toHaveAttribute('aria-pressed', 'true')
  })

  it('a paper opens over the screen on the tap, and its copy lands in Papers', () => {
    render(<App />)
    openCase(/The vineyard/)
    fireEvent.click(screen.getByRole('button', { name: 'Bedchamber' }))
    tapSpot('seal')
    expect(screen.getByRole('dialog', { name: 'The seal' })).toHaveTextContent(
      'BELONGING TO AHAB, KING.',
    )
    expect(screen.getByText(/Found:/)).toHaveTextContent('Found: Ahab, seal · copied to Papers')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Papers/ })).toHaveTextContent('1')
    tab(/Papers/)
    expect(screen.getByText('The seal')).toBeInTheDocument()
    expect(screen.queryByText(/Nothing here yet/)).not.toBeInTheDocument()
  })

  // A second tap on the seal opens the paper again but copies nothing, and the console says so by
  // saying nothing (review round 3, #20).
  it('a repeat tap on a paper reopens it and reports no copy', () => {
    render(<App />)
    openCase(/The vineyard/)
    fireEvent.click(screen.getByRole('button', { name: 'Bedchamber' }))
    tapSpot('seal')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    tapSpot('seal')
    expect(screen.getByRole('dialog', { name: 'The seal' })).toBeInTheDocument()
    expect(screen.queryByText(/copied to Papers/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Found:/)).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Papers/ })).toHaveTextContent('1')
  })

  it('Papers says so while nothing has been opened', () => {
    render(<App />)
    openCase(/The valley/)
    tab(/Papers/)
    expect(screen.getByText(/Nothing here yet\. Things with writing on them/)).toBeInTheDocument()
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
    expect(screen.getByText(/Open Think at the top/)).toBeInTheDocument()
    expect(chips()).toHaveLength(2)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }))
    expect(chips()).toHaveLength(2)
    confirm.mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }))
    expect(screen.getByText('Tap the boy with the sling.')).toBeInTheDocument()
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
    fireEvent.click(screen.getByRole('button', { name: 'Cases' }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Behold' })).toBeInTheDocument(),
    )
    expect(history.state).toBeNull()
  })

  it('a reload inside a case reopens it from the history entry', () => {
    history.replaceState({ case: 'vineyard' }, '')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/A king stands/)
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

describe('the case solved (#6, 03c)', () => {
  it('the Think tab counts what is filled, and pulses while a step waits on it', () => {
    render(<App />)
    openCase(/The valley/)
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Moments',
      'Think0/7',
      'Papers',
    ])
    expect(screen.getByRole('tab', { name: /Think/ })).not.toHaveClass('pulse')
    tapSpot('boy')
    expect(screen.getByRole('tab', { name: /Think/ })).toHaveClass('pulse')
    tab(/Think/)
    expect(screen.getByRole('tab', { name: /Think/ })).not.toHaveClass('pulse')
    expect(screen.getByRole('heading', { name: 'Who is who' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The account' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Close the case/ })).not.toBeInTheDocument()
  })

  it('the console names a face found, and a blank refuses a word of another kind by name', () => {
    render(<App />)
    openCase(/The valley/)
    tapSpot('boy')
    expect(screen.getByText(/Found:/)).toHaveTextContent(
      'Found: David, sling · one of the faces in Think',
    )
    tapSpot('brook')
    tab(/Think/)
    slot('t4')
    chip('five')
    expect(screen.getByRole('status')).toHaveTextContent('That blank wants a thing.')
    chip('sling')
    slot('t4')
    expect(screen.getByRole('status')).toHaveTextContent('')
    expect(document.querySelector('[data-slot="t4"]')).toHaveClass('is-right')
    expect(screen.getByRole('tab', { name: /Think/ })).toHaveTextContent('1/7')
  })

  it('the tutorial closes itself on the last right answer, and the reveal reads the passages as verses', async () => {
    render(<App passages={numbered} />)
    openCase(/The valley/)
    solveTheValley()
    expect(screen.getByRole('heading', { name: 'The case is closed.' })).toBeInTheDocument()
    expect(screen.getByText(/The boy was David/)).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(document.querySelector('.bank')).toBeNull()
    expect(screen.getByText('1 Samuel 17:17–18')).toBeInTheDocument()
    expect(screen.getByText('1 Samuel 17:38–51')).toBeInTheDocument()
    expect(await screen.findAllByText('38')).toHaveLength(2)
    const numberless = screen.getAllByText('A line with no number.')
    expect(numberless).toHaveLength(2)
    expect(numberless[0].querySelector('sup')).toBeNull()
    expect(screen.getAllByText(/One thing\./)[0].querySelector('sup')).toHaveTextContent('38')
    fireEvent.click(screen.getByRole('button', { name: 'Back to cases' }))
    await waitFor(() => expect(screen.getByText('Closed ✓')).toBeInTheDocument())
  })

  it('a case without steps closes on the submit, and says how far off it was', () => {
    render(<App />)
    openCase(/The vineyard/)
    for (const s of ['man-rows', 'cord', 'stain', 'balcony']) tapSpot(s)
    moment('Bedchamber')
    for (const s of ['tray', 'seal', 'purse', 'lamp']) tapSpot(s)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    moment('The gate')
    for (const s of ['stones', 'accusers', 'letter', 'law']) tapSpot(s)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    tab(/Think/)
    expect(screen.getByRole('button', { name: /Close the case — 0 of 13 filled/ })).toBeDisabled()
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
      ['s1', 'silver'],
      ['s2', 'garden'],
      ['s3', 'lamp'],
      ['s4', 'would not eat'],
      ['s5', 'Jezebel'],
      ['s6', 'two'],
      ['s7', 'stoned'],
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
    expect(screen.getByRole('status')).toHaveTextContent('Several are wrong.')
    expect(screen.queryByRole('heading', { name: 'The case is closed.' })).not.toBeInTheDocument()
    for (const [id, word] of [
      ['s1', 'garden'],
      ['s2', 'silver'],
    ] as const) {
      slot(id)
      chip(word)
      slot(id)
    }
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(screen.getByRole('status')).toHaveTextContent('One or two are wrong.')
    slot('s3')
    chip('inheritance')
    slot('s3')
    fireEvent.click(screen.getByRole('button', { name: 'Close the case' }))
    expect(screen.getByRole('heading', { name: 'The case is closed.' })).toBeInTheDocument()
    expect(screen.getByText(/The man on the bed was Ahab/)).toBeInTheDocument()
  })

  it('the reveal shows the stub’s line under each passage, and the failure line when the service refuses', async () => {
    const { unmount } = render(<App />)
    openCase(/The valley/)
    solveTheValley()
    expect(
      await screen.findAllByText(
        'The passage appears here once the translation service is connected.',
      ),
    ).toHaveLength(2)
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
    expect(screen.getByRole('tab', { name: /Think/ })).toHaveTextContent('7/7')
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
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }))
    confirm.mockRestore()
    expect(screen.getByText('Tap the boy with the sling.')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Think/ })).toHaveTextContent('0/7')
    await waitFor(() => expect(history.state).toEqual({ case: 'valley' }))
    expect(screen.getByText('Tap the boy with the sling.')).toBeInTheDocument()
  })
})
