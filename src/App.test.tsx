import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Behold' })).toBeInTheDocument()
  })

  // The setup file's afterEach(cleanup) is what keeps this at one: without it the first test's
  // render is still mounted here, and this query finds two headings.
  it('starts from an empty document, so a second render finds one heading', () => {
    render(<App />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})
