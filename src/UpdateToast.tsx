interface UpdateToastProps {
  /** A new version is waiting; the toast shows only then. */
  open: boolean
  /** Installs it: the waiting service worker takes over and the page reloads. */
  onUpdate: () => void
}

/**
 * The "Update available" toast (Gate 01 A2). A deploy never reloads the app on its own — the new
 * version waits until the player taps, so a case in progress is never cut off.
 */
export function UpdateToast({ open, onUpdate }: UpdateToastProps) {
  if (!open) return null
  return (
    <div className="toast" role="status">
      <span>Update available</span>
      <button type="button" onClick={onUpdate}>
        Update
      </button>
    </div>
  )
}
