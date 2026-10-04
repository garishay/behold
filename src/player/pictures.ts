import type { CaseStructure } from '../cases/types.ts'

/**
 * A case's picture: its stable path under `public/cases/`, stamped with its file's hash, so a
 * changed picture is an address the service worker has not cached (docs/case-file.md, Pictures).
 */
export const picture = (caseId: string, file: string) =>
  `${import.meta.env.BASE_URL}cases/${caseId}/${file}?v=${__PICTURE_HASHES__[`${caseId}/${file}`]}`

/** The title's picture, stamped as a case picture is (docs/title.md, #75). */
export const titlePicture = `${import.meta.env.BASE_URL}title.jpg?v=${__TITLE_HASH__}`

/**
 * Pictures requested once the service worker is ready to control the page, or at once where there
 * is no worker (#12 [Q5]), so its rule keeps them: a case's as it opens, and the title's.
 */
export function keep(addresses: readonly string[]) {
  const request = () => {
    for (const address of addresses) new Image().src = address
  }
  const worker: ServiceWorkerContainer | undefined = navigator.serviceWorker
  if (worker === undefined) request()
  else void worker.ready.then(request)
}

/**
 * Every picture of a case requested — its moments and its faces — so the service worker's rule
 * caches the whole case as it opens, not one moment at a time (review round 1, #20).
 */
export const prefetch = (s: CaseStructure) =>
  keep([...s.moments, ...s.faces].map((x) => picture(s.id, x.picture)))
