/** Each case picture's hash by `<case>/<file>`, for its address — `vite.config.ts` (#45). */
declare const __PICTURE_HASHES__: Readonly<Record<string, string>>

/** Each sound file's hash by its path under `public/audio/`, for the music's addresses (Gate 10 A6). */
declare const __AUDIO_HASHES__: Readonly<Record<string, string>>

/** A dev shell's override of the proxy's address (#3); unset in the build. */
interface ImportMetaEnv {
  readonly VITE_PASSAGES_URL?: string
}
