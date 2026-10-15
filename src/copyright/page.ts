import { copyrightPage, strings, type Link } from '../strings/en.ts'

/**
 * The copyright page (Gate 33 A3): its own address under the site's base, written whole at build
 * time from the strings module, as the privacy policy's is (#9), so it reads without JavaScript and
 * offline. Each passage's citation links here, as API.Bible's terms ask (§7). Its words are
 * `copyrightPage` in `src/strings/en.ts`; nothing here is a sentence.
 */
export const path = 'copyright/'

const escape = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c)
const a = (l: Link) => `<a href="${escape(l.href)}">${escape(l.text)}</a>`

/** The page's HTML, its links to the game resolved against `base`, its stylesheet inline, bare. */
export function page(base: string, css: string) {
  const sections = copyrightPage.sections.flatMap((s) => [
    `<h2>${escape(s.heading)}</h2>`,
    ...s.points.map((point) => `<p>${escape(point)}</p>`),
    ...(s.links ?? []).map((l) => `<p class="link">${a(l)}</p>`),
  ])
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">',
    '<meta name="theme-color" content="#232A3D">',
    `<title>${escape(copyrightPage.tab)}</title>`,
    `<link rel="icon" type="image/png" sizes="48x48" href="${base}icons/favicon-48.png">`,
    `<style>${css.replace(/\/\*[\s\S]*?\*\/\s*/g, '')}</style>`,
    '</head>',
    '<body>',
    '<main>',
    `<p class="masthead">${a({ text: strings.title, href: base })}</p>`,
    `<p class="kicker">${escape(strings.kicker)}</p>`,
    `<h1>${escape(copyrightPage.title)}</h1>`,
    `<p>${escape(copyrightPage.intro)}</p>`,
    ...sections,
    `<p class="back">${a({ text: copyrightPage.back, href: base })}</p>`,
    '</main>',
    '</body>',
    '</html>',
    '',
  ].join('\n')
}
