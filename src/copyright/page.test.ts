// The test reads the app's page from disk under Vitest, which runs on Node; the app project
// declares no Node types, so this file brings them in itself, as the privacy page's test does.
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { copyrightPage } from '../strings/en.ts'
import { page } from './page.ts'

/** The page as the build writes it, at the site's root. */
const html = page('/', '')

describe('the copyright page (Gate 33 A3)', () => {
  it('reads without JavaScript, labelled as the copyright page, every line of it', () => {
    expect(html).not.toMatch(/<script/i)
    expect(html).toContain(`<title>${copyrightPage.tab}</title>`)
    expect(html).toContain(`<h1>${copyrightPage.title}</h1>`)
    const said = [copyrightPage.intro, ...copyrightPage.sections.flatMap((s) => s.points)]
    for (const line of [...said, copyrightPage.back]) expect(html).toContain(line)
  })

  // API.Bible's terms (§7): the translation's name and abbreviation, its holder's notice, and the
  // holder's site, linked; and the Starter plan's citation of API.Bible, linked.
  it('names the NIV, gives Biblica’s notice and site, and links API.Bible', () => {
    expect(html).toContain('New International Version (NIV)')
    expect(html).toContain('Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.®')
    expect(html).toContain('<a href="https://biblica.com">biblica.com</a>')
    expect(html).toContain('<a href="https://api.bible">api.bible</a>')
    expect(html).toContain('Berean Standard Bible (BSB), which is in the public domain')
  })

  it('links the icon the app’s page links, and leads back to the game', () => {
    const icon = /<link rel="icon"[^>]*href="\/?([^"]+)"/
    const app = icon.exec(readFileSync('index.html', 'utf8'))?.[1]
    expect(icon.exec(html)?.[1]).toBe(app)
    expect(html).toContain(`<a href="/">${copyrightPage.back}</a>`)
  })
})
