import { describe, expect, it } from 'vitest'
import { fixedPassages } from './stub.ts'

describe('the passage stub (#6)', () => {
  it('answers any reference with one unnumbered verse of app copy, and no scripture', async () => {
    const a = await fixedPassages({ book: '1SA', chapter: 17, from: 38, to: 51 }, 'ESV')
    const b = await fixedPassages({ book: '1KI', chapter: 21 }, 'ESV')
    expect(a).toEqual(b)
    expect(a.verses).toEqual([
      { text: 'The passage appears here once the translation service is connected.' },
    ])
  })
})
