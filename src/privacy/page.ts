import { policy, strings, type Link } from '../strings/en.ts'

/**
 * The privacy policy's page (#9): its own address under the site's base, written whole at build
 * time from the strings module, so it reads without JavaScript and a reviewer's fetch finds every
 * word (Gate 17 A8). The service worker precaches it with the build, so it reads offline too. Its
 * words are `policy` in `src/strings/en.ts`; nothing here is a sentence.
 */
export const path = 'privacy/'

const escape = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c)
const a = (l: Link) => `<a href="${escape(l.href)}">${escape(l.text)}</a>`

/** The page's HTML, its links to the game resolved against `base`, its stylesheet inline, bare. */
export function page(base: string, css: string) {
  const sections = policy.sections.flatMap((s) => [
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
    `<title>${escape(policy.tab)}</title>`,
    `<link rel="icon" type="image/png" sizes="192x192" href="${base}icons/icon-192.png">`,
    `<style>${css.replace(/\/\*[\s\S]*?\*\/\s*/g, '')}</style>`,
    '</head>',
    '<body>',
    '<main>',
    `<p class="masthead">${a({ text: strings.title, href: base })}</p>`,
    `<p class="kicker">${escape(strings.kicker)}</p>`,
    `<h1>${escape(policy.title)}</h1>`,
    `<p class="effective">${escape(policy.effective)}</p>`,
    `<p>${escape(policy.intro)}</p>`,
    ...sections,
    `<p class="back">${a({ text: policy.back, href: base })}</p>`,
    '</main>',
    '</body>',
    '</html>',
    '',
  ].join('\n')
}
