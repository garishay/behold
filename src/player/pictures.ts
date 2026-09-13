import type { CaseStructure } from '../cases/types.ts'

/** A case's picture at its stable path under `public/cases/` (docs/case-file.md, Pictures). */
export const picture = (caseId: string, file: string) =>
  `${import.meta.env.BASE_URL}cases/${caseId}/${file}`

/**
 * Every picture of a case requested at once — its moments and its faces — so the service worker's
 * rule caches the whole case when it opens, not one moment at a time (review round 1, #20).
 */
export function prefetch(s: CaseStructure) {
  for (const file of [...s.moments.map((m) => m.picture), ...s.faces.map((f) => f.picture)])
    new Image().src = picture(s.id, file)
}
