import type { CaseStructure, CaseText, Language } from './types.ts'
import { valley } from './valley/case.ts'
import { en as valleyEn } from './valley/en.ts'
import { vineyard } from './vineyard/case.ts'
import { en as vineyardEn } from './vineyard/en.ts'

/** A case with its text by language. */
export interface CaseEntry {
  readonly structure: CaseStructure
  readonly text: Readonly<Record<Language, CaseText<CaseStructure>>>
}

// Pairs a structure with text typed against that structure, so a mismatch is a type error here.
const entry = <S extends CaseStructure>(
  structure: S,
  text: Readonly<Record<Language, CaseText<S>>>,
): CaseEntry => ({ structure, text })

/** Every case, in play order; the player (#6) and the check read the same list. */
export const cases: readonly CaseEntry[] = [
  entry(valley, { en: valleyEn }),
  entry(vineyard, { en: vineyardEn }),
]
