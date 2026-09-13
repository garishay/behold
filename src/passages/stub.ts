import { strings } from '../strings/en.ts'
import type { PassageService } from './service.ts'

/**
 * The stub (#6): answers every reference with one verse carrying no number and one fixed line of
 * app copy, so the reveal's shape is built and shown now and the proxy (#3) drops in behind the
 * same contract. It holds no scripture and makes no request.
 */
export const fixedPassages: PassageService = () =>
  Promise.resolve({ verses: [{ text: strings.passagePending }] })
