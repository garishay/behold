import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// Vitest runs without globals, so Testing Library's automatic cleanup does not
// self-register. Unmount between tests so renders never leak across cases.
afterEach(cleanup)

// No test reaches the network: fetch is refused unless a test stubs its own (#3), so a reveal
// rendered with the default service shows its unreachable line rather than asking the Worker.
beforeEach(() => vi.stubGlobal('fetch', () => Promise.reject(new Error('no network in tests'))))
afterEach(() => vi.unstubAllGlobals())

// jsdom lays nothing out and has no media queries: a coach mark scrolls its target into view and
// asks whether motion is reduced (#25), so both answer as a phone with motion on would.
beforeEach(() => vi.stubGlobal('matchMedia', () => ({ matches: false })))
if (typeof Element !== 'undefined') Element.prototype.scrollIntoView = () => {}
