import { useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { drawOrder, nearest, slip } from '../cases/spots.ts'
import type { Box, CaseStructure, CaseText, Moment } from '../cases/types.ts'
import { strings } from '../strings/en.ts'
import { picture } from './pictures.ts'

/** Whether a box's middle lies inside another box, both in percentages of the picture. */
const within = ([l, t, w, h]: Box, [hl, ht, hw, hh]: Box) =>
  l + w / 2 >= hl && l + w / 2 <= hl + hw && t + h / 2 >= ht && t + h / 2 <= ht + hh

/** The part of a box inside another, so a mark on it sits inside the other's ring. */
const clip = ([l, t, w, h]: Box, [hl, ht, hw, hh]: Box): Box => {
  const [left, top] = [Math.max(l, hl), Math.max(t, ht)]
  return [left, top, Math.min(l + w, hl + hw) - left, Math.min(t + h, ht + hh) - top]
}

interface StageProps {
  structure: CaseStructure
  text: CaseText<CaseStructure>
  moment: Moment
  /** The spots tapped so far: a picker button marks a moment with something left (#24 [5]). */
  tapped: readonly string[]
  onMoment: (id: string) => void
  onTap: (spotId: string) => void
  /** A tap that found no spot, which a stuck run counts (#29). */
  onMiss: () => void
  /** The half of the picture a hint's first tier rings (#29). */
  half?: Box
  /**
   * What lies over the picture: the brief's card, over the picture's whole row, so a picture the
   * screen's height narrows doesn't narrow it too, as at the floor (#77).
   */
  children?: ReactNode
}

/**
 * The Look view (#6, #24): the picker when a case has more than one moment, the picture as large
 * as the screen leaves it with its tappable spots drawn over it at the structure's boxes, and the
 * zoom toggle, the one thing on the picture: check (l) counts its pill as a box over every picture
 * (#24, ruling [1]). Spots are drawn
 * largest first, so where two boxes overlap the smaller is on top and takes the tap — a small
 * thing inside a large one stays reachable, whatever the file's order (#26 [7]). A tap on no spot
 * goes to the nearest within a fingertip's slip, so a box hugs its thing and is never padded
 * (#27 [2]).
 */
export function Stage(props: StageProps) {
  const { structure, text, moment, tapped, onMoment, onTap, onMiss, half, children } = props
  const [zoomed, setZoomed] = useState(false)
  const [w, h] = moment.size
  const spots = drawOrder(moment.spots)
  const place = ([l, t, bw, bh]: Box) => ({
    x: (l * w) / 100,
    y: (t * h) / 100,
    width: (bw * w) / 100,
    height: (bh * h) / 100,
  })
  // A tap on a rect is that spot's. The slip is CSS px on the picture as laid out, zoomed or not,
  // read in the picture's pixels.
  const tap = (e: MouseEvent<SVGSVGElement>) => {
    const hit = (e.target as Element).getAttribute('data-spot')
    const r = e.currentTarget.getBoundingClientRect()
    const k = w / r.width
    const point = [(e.clientX - r.left) * k, (e.clientY - r.top) * k] as const
    const id = hit ?? nearest(spots, moment.size, point, slip * k)?.id
    if (id === undefined) onMiss()
    else onTap(id)
  }
  return (
    <>
      {structure.moments.length > 1 && (
        <div className="moment-picker">
          {structure.moments.map((m) => (
            <button
              key={m.id}
              type="button"
              className={'moment-btn' + (m.id === moment.id ? ' is-on' : '')}
              data-moment={m.id}
              onClick={() => onMoment(m.id)}
            >
              {text.moments[m.id]}
              {m.spots.some((x) => !tapped.includes(x.id)) && (
                <i className="left">
                  <span className="sr">{strings.somethingLeft}</span>
                </i>
              )}
            </button>
          ))}
        </div>
      )}
      <div className="stage-wrap" style={{ '--ar': w / h } as CSSProperties}>
        <div className="frame">
          <div className={'stage' + (zoomed ? ' zoomed' : '')}>
            <svg
              viewBox={`0 0 ${w} ${h}`}
              role="img"
              aria-label={text.moments[moment.id]}
              onClick={tap}
            >
              <image href={picture(structure.id, moment.picture)} width={w} height={h} />
              {half && <rect className="half" data-half {...place(half)} />}
              {spots.map((s) => (
                <rect key={s.id} data-spot={s.id} {...place(s.box)} />
              ))}
              {/* Inside a hint's half, what is found already is marked, so the ring's search is
                  for the rest (#95): a ✓ at each found thing's middle, taking no tap. */}
              {half &&
                spots
                  .filter((s) => tapped.includes(s.id) && within(s.box, half))
                  .map((s) => {
                    const { x, y, width, height } = place(clip(s.box, half))
                    const [cx, cy, r] = [x + width / 2, y + height / 2, w * 0.035]
                    return (
                      <g key={s.id} className="found" data-found={s.id}>
                        <circle cx={cx} cy={cy} r={r} />
                        <path
                          d={`M${cx - r * 0.45} ${cy}l${r * 0.3} ${r * 0.32}l${r * 0.6} ${-r * 0.62}`}
                        />
                      </g>
                    )
                  })}
            </svg>
          </div>
          <button
            type="button"
            className={'pill zoom' + (zoomed ? ' is-on' : '')}
            aria-pressed={zoomed}
            onClick={() => setZoomed(!zoomed)}
          >
            {strings.zoom}
          </button>
        </div>
        {children}
      </div>
    </>
  )
}
