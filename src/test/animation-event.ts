// jsdom has no AnimationEvent, and React, finding none as it loads, hears an animation's end by its
// webkit name. Every browser the game plays in has it, so the tests give jsdom one before React
// loads, and fire the standard event (#77, the pulse of a refused tap). The Worker's tests run on
// Node, with no window.
if (typeof window !== 'undefined' && !('AnimationEvent' in window))
  Object.defineProperty(window, 'AnimationEvent', { value: class extends Event {} })
