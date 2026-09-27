import { useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { drawOrder, nearest, slip } from '../cases/spots.ts'
import type { CaseStructure, CaseText, Moment } from '../cases/types.ts'
import { strings } from '../strings/en.ts'
import { picture } from './pictures.ts'

interface StageProps {
  structure: CaseStructure
  text: CaseText<CaseStructure>
  moment: Moment
  /** The spots tapped so far: a picker button marks a moment with something left (#24 [5]). */
  tapped: readonly string[]
  onMoment: (id: string) => void
  onTap: (spotId: string) => void
  /** What lies over the picture: the brief's card. */
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
export function Stage({ structure, text, moment, tapped, onMoment, onTap, children }: StageProps) {
  const [zoomed, setZoomed] = useState(false)
  const [w, h] = moment.size
  const spots = drawOrder(moment.spots)
  // A tap on a rect is that spot's. The slip is CSS px on the picture as laid out, zoomed or not,
  // read in the picture's pixels.
  const tap = (e: MouseEvent<SVGSVGElement>) => {
    const hit = (e.target as Element).getAttribute('data-spot')
    const r = e.currentTarget.getBoundingClientRect()
    const k = w / r.width
    const point = [(e.clientX - r.left) * k, (e.clientY - r.top) * k] as const
    const id = hit ?? nearest(spots, moment.size, point, slip * k)?.id
    if (id !== undefined) onTap(id)
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
              {spots.map((s) => (
                <rect
                  key={s.id}
                  data-spot={s.id}
                  x={(s.box[0] * w) / 100}
                  y={(s.box[1] * h) / 100}
                  width={(s.box[2] * w) / 100}
                  height={(s.box[3] * h) / 100}
                />
              ))}
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
          {children}
        </div>
      </div>
    </>
  )
}
