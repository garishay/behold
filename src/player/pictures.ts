import type { CaseStructure } from '../cases/types.ts'

/** A case's picture at its stable path under `public/cases/` (docs/case-file.md, Pictures). */
export const picture = (caseId: string, file: string) =>
  `${import.meta.env.BASE_URL}cases/${caseId}/${file}`

/**
 * Every picture of a case requested — its moments and its faces — so the service worker's rule
 * caches the whole case as it opens, not one moment at a time (review round 1, #20): once the
 * worker is ready to control the page, or at once where there is no worker (#12 [Q5]).
 */
export function prefetch(s: CaseStructure) {
  const request = () => {
    for (const file of [...s.moments.map((m) => m.picture), ...s.faces.map((f) => f.picture)])
      new Image().src = picture(s.id, file)
  }
  const worker: ServiceWorkerContainer | undefined = navigator.serviceWorker
  if (worker === undefined) request()
  else void worker.ready.then(request)
}
