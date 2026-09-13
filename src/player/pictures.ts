/** A case's picture at its stable path under `public/cases/` (docs/case-file.md, Pictures). */
export const picture = (caseId: string, file: string) =>
  `${import.meta.env.BASE_URL}cases/${caseId}/${file}`
