import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App — the placeholder screen (Gate 01 A6)', () => {
  it('shows the title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Behold' })).toBeInTheDocument()
  })

  it('quotes Proverbs 25:2 from the ESV, with the copyright notice on the same screen', () => {
    render(<App />)
    expect(
      screen.getByText(
        'It is the glory of God to conceal things, but the glory of kings is to search things out.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Proverbs 25:2, ESV')).toBeInTheDocument()
    expect(
      screen.getByText(/Scripture quotations are from the ESV® Bible .* All rights reserved\./),
    ).toBeInTheDocument()
  })

  it('carries the two lines', () => {
    render(<App />)
    expect(
      screen.getByText("You know the stories. You don't know the details."),
    ).toBeInTheDocument()
    expect(screen.getByText('Season one is being written.')).toBeInTheDocument()
  })

  it('has nothing to tap', () => {
    render(<App />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })

  // The setup file's afterEach(cleanup) is what keeps this at one: without it the renders above
  // are still mounted here, and this query finds several headings.
  it('starts from an empty document, so a later render finds one heading', () => {
    render(<App />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})
