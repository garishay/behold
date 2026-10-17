# The Android shell

Behold's app on Google Play is a Trusted Web Activity: a small Android app that opens the game,
`https://play.beholdgame.com`, in the phone's browser, full screen and without its address bar,
once the site's asset links vouch for the app (Gate 17, #68).
[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) makes the Android project from this
folder's `twa-manifest.json`, then builds and signs it.

## What the repository keeps here

- **`twa-manifest.json`,** the app's config. `bubblewrap init` wrote it, and it is held to Gate 17
  A1's table as amended (#68). `src/android.test.ts` holds it to that table and to the web
  manifest the build writes, the file Bubblewrap reads.
- **`listing.md`,** the store listing's words.
- **This README.**

Git ignores everything else Bubblewrap writes here: the project (`app/` and Gradle's files), its
`manifest-checksum.txt` and `store_icon.png`, and the builds. `bubblewrap update` makes it all
again from the config. Don't run `bubblewrap init` here again: it writes a new config over this
one.

## Tools, once per PC

1. **JDK 17, the 64-bit build.** Bubblewrap needs 17 exactly. On Windows, the JDK it downloads
   itself is the 32-bit build, which often can't reserve the 1.5 GB heap Gradle asks for
   ([Bubblewrap's #611](https://github.com/GoogleChromeLabs/bubblewrap/issues/611)). So download
   Temurin 17.0.11+9 for x64 and unzip it to `$HOME\.bubblewrap\jdk-x64`:

   ```powershell
   $ProgressPreference = 'SilentlyContinue'
   Invoke-WebRequest 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.11%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.11_9.zip' -OutFile "$env:TEMP\jdk17-x64.zip"
   (Get-FileHash "$env:TEMP\jdk17-x64.zip").Hash
   Expand-Archive "$env:TEMP\jdk17-x64.zip" -DestinationPath "$HOME\.bubblewrap\jdk-x64"
   Get-Content "$HOME\.bubblewrap\jdk-x64\jdk-17.0.11+9\release" | Select-String JAVA_VERSION
   ```

   The hash should read `FDD6664D4131370398FBC8BFBB7B46DBFEC4A22A090A511FE5C379DAE188C390`, as
   Adoptium publishes it beside the file, and the last line `JAVA_VERSION="17.0.11"`.

2. **Bubblewrap 1.27.0:**

   ```powershell
   npm install -g @bubblewrap/cli@1.27.0
   npm ls -g @bubblewrap/core
   ```

   The second line should list `@bubblewrap/core@1.27.0`, the part that makes the project.

3. **`bubblewrap doctor`.** Every Bubblewrap command sets itself up on its first run, so the first
   is this one. Decline its JDK, and give the folder from step 1, typed out in full: your home
   folder, then `.bubblewrap\jdk-x64\jdk-17.0.11+9`. Let it install the Android SDK, once you've
   read its terms. It ends "Your jdkpath and androidSdkPath are valid."

## The upload key

`bubblewrap init` made it once, on 2026-10-17, under the alias `upload`, in a keystore at
`../../behold-keys/upload.keystore` from this folder, outside the repository. It signs the bundle
you upload. Play signs the app that players install with its own keys (Play App Signing), so the
site's asset links name Play's keys as well as this one (68c).

1. **One password, at both prompts.** Bubblewrap asks "Password for the Key Store:" and then
   "Password for the Key:" at every build, as `init` did when it made the key. Give the same
   password at both: keytool's PKCS12 keystores ignore a separate key password, so a different one
   fails at Bubblewrap's signing. It is long, in letters and digits only, since Bubblewrap hands it
   to keytool, apksigner, and jarsigner on a `cmd` line, where `%` or `"` can break it.

2. **Where it is kept.** On the PC, at the path above; and in the password manager, the keystore
   file as an attachment, with its password. Neither the file nor the password goes in the
   repository, a chat, a PR, or CI, or to anyone else.

3. **Its fingerprint, on #68.** The key's SHA-256 is posted there (issuecomment-6240555530), for
   the site's asset links (68c). It is a public value, not a secret. To read it again, from this
   folder, where keytool asks for the password:

   ```powershell
   & "$HOME\.bubblewrap\jdk-x64\jdk-17.0.11+9\bin\keytool.exe" -list -v -keystore ..\..\behold-keys\upload.keystore -alias upload
   ```

   Its `SHA256:` line should read as #68's does.

4. **On another PC,** save the password manager's copy as `upload.keystore` in a `behold-keys`
   folder beside the repository's, and read its fingerprint (step 3) before the first build there.

5. **If it is lost or leaked,** it can be reset in Play Console, with a new key's certificate.

## Building

In PowerShell, from this folder:

```powershell
bubblewrap update --skipVersionUpgrade
bubblewrap build
```

- **`update --skipVersionUpgrade`** deletes the project and makes it again from the config, so it
  runs after a fresh checkout and after any change to the config. It fetches every icon from its
  address on the site, so a new icon is deployed before it runs. The flag keeps the version the
  config has.
- **`build`** asks for the password at both prompts, then writes `app-release-bundle.aab`, for
  Play, and `app-release-signed.apk`, for a phone by hand. The first build installs Android's
  build tools, whose licence it asks you to accept, and Gradle downloads what it needs.
- **If `build` offers to apply the config, or to make the project again, stop it with Ctrl+C.** A
  yes runs its own update, without the flag, which raises the version code; a no builds the
  project as it was. Run `update --skipVersionUpgrade`, then `build` again.

## Uploading

- **In Play Console,** create a release on a testing track, upload `app-release-bundle.aab`, and
  roll it out. The first upload enrols the app in Play App Signing, and its App integrity page
  then lists the SHA-256 fingerprints of Play's keys, which the site's asset links need (68c).
- **Play takes each version code once,** so each upload after the first raises it. On a branch,
  `bubblewrap update --appVersionName=<name>` raises `appVersionCode` by one, sets `appVersion` to
  the name, and saves the config in Bubblewrap's own form, so then run
  `npx prettier --write twa-manifest.json`. The PR carries the config, and the test's table rows
  for the version with it. Once it merges, build from `main`, as above.
