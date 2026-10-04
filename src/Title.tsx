import { useEffect, useLayoutEffect, useRef } from 'react'
import { keep, titlePicture } from './player/pictures.ts'
import { Music } from './sound/music.ts'
import { strings } from './strings/en.ts'

/**
 * A line's sentences, so the title sets each on its own line at every width while the line stays
 * one string (#73, Gate 20 A3 as ruled). A browser without the sentence segmenter keeps the line
 * whole.
 */
const sentences = (line: string) =>
  typeof Intl.Segmenter === 'function'
    ? [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(line)].map((s) =>
        s.segment.trim(),
      )
    : [line]

interface TitleProps {
  /** Begin was tapped, and the title is giving way to the cases page. */
  readonly leaving: boolean
  readonly onBegin: () => void
}

/**
 * The title (#75), shown when the app opens on the cases page: the picture, the name and the line
 * over its fade, and Begin, the player's first tap, which lets the title theme start. Leaving, it
 * fades, and the name and the kicker glide up into the cases page's header.
 */
export function Title({ leaving, onBegin }: TitleProps) {
  const name = useRef<HTMLHeadingElement>(null)
  const kicker = useRef<HTMLParagraphElement>(null)
  useEffect(() => keep([titlePicture]), [])
  useLayoutEffect(() => {
    if (!leaving) return
    // Each glides from its place here to its place in the header, which is laid out by now: down
    // the column by the difference, and shrunk to the header's size.
    for (const [from, to] of [
      [name.current, '.masthead h1'],
      [kicker.current, '.masthead .kicker'],
    ] as const) {
      const target = document.querySelector(to)
      if (from === null || target === null) continue
      const [a, b] = [from, target].map((e) => e.getBoundingClientRect())
      from.style.setProperty('--dy', `${b.top - a.top}px`)
      from.style.setProperty('--s', `${b.height / a.height}`)
    }
  }, [leaving])
  return (
    <div className={leaving ? 'title leaving' : 'title'} inert={leaving}>
      <img className="title-picture" src={titlePicture} alt="" />
      <div className="title-body">
        <h1 ref={name}>{strings.title}</h1>
        <p className="kicker" ref={kicker}>
          {strings.kicker}
        </p>
        <p className="line">
          {sentences(strings.line).map((s) => (
            <span key={s}>{s}</span>
          ))}
        </p>
        <button type="button" className="begin" onClick={onBegin}>
          {strings.begin}
        </button>
        <p className="sound-line">
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
              <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
            </svg>
            {strings.bestWithSound}
          </span>
          {/iPhone/.test(navigator.userAgent) && <span>{strings.silentMode}</span>}
        </p>
      </div>
      <Music cue="title" />
    </div>
  )
}
