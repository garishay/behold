import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UpdateToast } from './UpdateToast'

describe('UpdateToast (Gate 01 A2)', () => {
  it('shows nothing while no new version is waiting', () => {
    render(<UpdateToast open={false} onUpdate={() => {}} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('offers the update when one is waiting, and installs it only on the tap', () => {
    const onUpdate = vi.fn()
    render(<UpdateToast open onUpdate={onUpdate} />)
    expect(screen.getByRole('status')).toHaveTextContent('Update available')
    expect(onUpdate).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Update' }))
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })

  // The new version takes a few seconds to take over before the page reloads (#61).
  it('reads "Updating…" once tapped, and takes no second tap', () => {
    const onUpdate = vi.fn()
    render(<UpdateToast open onUpdate={onUpdate} />)
    fireEvent.click(screen.getByRole('button', { name: 'Update' }))
    const button = screen.getByRole('button', { name: 'Updating…' })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })
})
