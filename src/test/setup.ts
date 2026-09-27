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

// jsdom has no Element.scrollBy, which a mark brings its target with (#47); here it moves at once,
// as jsdom's scrollTop does. The Worker's tests run on Node, with no DOM at all.
if (typeof Element !== 'undefined')
  Element.prototype.scrollBy = function (this: Element, options?: ScrollToOptions | number) {
    const o = typeof options === 'object' ? options : {}
    this.scrollTop += o.top ?? 0
    this.scrollLeft += o.left ?? 0
  } as Element['scrollBy']
