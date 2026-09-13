import { useState } from 'react'
import type { CaseStructure, CaseText, Moment } from '../cases/types.ts'
import { strings } from '../strings/en.ts'
import { picture } from './pictures.ts'

interface StageProps {
  structure: CaseStructure
  text: CaseText<CaseStructure>
  moment: Moment
  onMoment: (id: string) => void
  onTap: (spotId: string) => void
}

/**
 * The Moments view (#6): the picker when a case has more than one moment, the picture with its
 * tappable spots drawn over it at the structure's boxes, and the zoom toggle.
 */
export function Stage({ structure, text, moment, onMoment, onTap }: StageProps) {
  const [zoomed, setZoomed] = useState(false)
  const [w, h] = moment.size
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
            </button>
          ))}
        </div>
      )}
      <div className="stage-wrap">
        <div className={'stage' + (zoomed ? ' zoomed' : '')}>
          <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={text.moments[moment.id]}>
            <image href={picture(structure.id, moment.picture)} width={w} height={h} />
            {moment.spots.map((s) => (
              <rect
                key={s.id}
                data-spot={s.id}
                x={(s.box[0] * w) / 100}
                y={(s.box[1] * h) / 100}
                width={(s.box[2] * w) / 100}
                height={(s.box[3] * h) / 100}
                rx={18}
                onClick={() => onTap(s.id)}
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
      </div>
    </>
  )
}
