import { useState } from 'react'
import { strings } from './strings/en.ts'

interface UpdateToastProps {
  /** A new version is waiting; the toast shows only then. */
  open: boolean
  /** Installs it: the waiting service worker takes over and the page reloads. */
  onUpdate: () => void
}

/**
 * The "Update available" toast (Gate 01 A2). A deploy never reloads the app on its own — the new
 * version waits until the player taps, so a case in progress is never cut off. Once tapped, the
 * button reads "Updating…" and takes no second tap while the new version takes over, so the wait
 * before the reload doesn't look like a freeze (#61).
 */
export function UpdateToast({ open, onUpdate }: UpdateToastProps) {
  const [updating, setUpdating] = useState(false)
  if (!open) return null
  const update = () => {
    setUpdating(true)
    onUpdate()
  }
  return (
    <div className="toast" role="status">
      <span>{strings.updateAvailable}</span>
      <button type="button" disabled={updating} onClick={update}>
        {updating ? strings.updating : strings.update}
      </button>
    </div>
  )
}
