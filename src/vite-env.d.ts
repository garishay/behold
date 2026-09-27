/** Each case picture's hash by `<case>/<file>`, for its address — `vite.config.ts` (#45). */
declare const __PICTURE_HASHES__: Readonly<Record<string, string>>

/** A dev shell's override of the proxy's address (#3); unset in the build. */
interface ImportMetaEnv {
  readonly VITE_PASSAGES_URL?: string
}
