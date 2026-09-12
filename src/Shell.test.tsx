import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Shell } from './Shell'

// The plugin's hook, stood in for: what the service worker reports, and what the tap hands it.
const sw = vi.hoisted(() => ({
  waiting: false,
  updateServiceWorker: vi.fn(() => Promise.resolve()),
}))
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [sw.waiting, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: sw.updateServiceWorker,
  }),
}))

describe('Shell (Gate 01 A2)', () => {
  it('shows the screen and no toast while nothing is waiting', () => {
    sw.waiting = false
    render(<Shell />)
    expect(screen.getByRole('heading', { level: 1, name: 'Behold' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('hands a waiting version to the service worker on the tap, and not before', () => {
    sw.waiting = true
    render(<Shell />)
    expect(screen.getByRole('status')).toHaveTextContent('Update available')
    expect(sw.updateServiceWorker).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Update' }))
    expect(sw.updateServiceWorker).toHaveBeenCalledTimes(1)
  })
})
