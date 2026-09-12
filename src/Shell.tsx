import { useRegisterSW } from 'virtual:pwa-register/react'
import App from './App.tsx'
import { UpdateToast } from './UpdateToast.tsx'

/**
 * The PWA shell around the app (Gate 01 A2): the service worker registers on load, and a version
 * found waiting surfaces as the toast — installed on the tap, never on its own.
 */
export function Shell() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  return (
    <>
      <App />
      <UpdateToast open={needRefresh} onUpdate={() => void updateServiceWorker()} />
    </>
  )
}
