# The Android shell

Behold's app on Google Play is a WebView shell: a small Android app, this folder's project, that
shows the game from its site, `https://play.beholdgame.com`, in a WebView between Android's bars
(Gate 17's A1 as amended, #68). It ships no web content, so every merge to `main` reaches it as it
reaches the site. It keeps its own progress, apart from the browser's, and opens every link off the
game in the player's default browser. When the page's renderer is gone, it builds the page again,
and if that keeps happening it says so (#151). Until 68d it was a Trusted Web Activity, which
Bubblewrap built.

## What the repository keeps here

- **`shell.json`,** the app's config: A1's table as ruled for the shell. The Gradle build reads
  it, and `src/android.test.ts` holds it to that table and to the web manifest the build writes.
- **The project:** `settings.gradle`, `build.gradle`, and `gradle.properties`, and the app in
  `app/`: its manifest, its one activity (`MainActivity.java`), its theme, its launch, the view it
  shows when the game keeps stopping, and its launcher files. Bubblewrap made the launcher files
  for the TWA (68b), and they are kept as built. The view's words are the game's, in
  `src/strings/en.ts` (`shell`), and the build reads them from there.
- **Gradle's wrapper,** `gradlew`, `gradlew.bat`, and `gradle/wrapper/`: Gradle 8.11.1's own,
  under the Apache License 2.0 its files name. The test holds its jar, and the distribution it
  downloads, to the SHA-256s Gradle publishes.
- **`listing.md`,** the store listing's words.
- **This README.**

Git ignores Gradle's state (`.gradle/`, `build/`, and `app/build/`), `local.properties`, and the
builds.

## Tools, once per PC

1. **JDK 17, the 64-bit build,** as the Android Gradle plugin needs. On Windows, download Temurin
   17.0.11+9 for x64 and unzip it to `$HOME\.bubblewrap\jdk-x64`, the folder the TWA's builds used:

   ```powershell
   $ProgressPreference = 'SilentlyContinue'
   Invoke-WebRequest 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.11%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.11_9.zip' -OutFile "$env:TEMP\jdk17-x64.zip"
   (Get-FileHash "$env:TEMP\jdk17-x64.zip").Hash
   Expand-Archive "$env:TEMP\jdk17-x64.zip" -DestinationPath "$HOME\.bubblewrap\jdk-x64"
   Get-Content "$HOME\.bubblewrap\jdk-x64\jdk-17.0.11+9\release" | Select-String JAVA_VERSION
   ```

   The hash should read `FDD6664D4131370398FBC8BFBB7B46DBFEC4A22A090A511FE5C379DAE188C390`, as
   Adoptium publishes it beside the file, and the last line `JAVA_VERSION="17.0.11"`.

2. **The Android SDK,** with Android 36 and build tools 35.0.0. The PC that built the TWA has the
   one Bubblewrap installed, at `$HOME\.bubblewrap\android_sdk`. On another PC, install Android's
   command-line tools, accept their licences with `sdkmanager --licenses`, and then run
   `sdkmanager "platforms;android-36" "build-tools;35.0.0"`.

3. **`local.properties`,** in this folder, naming the SDK in forward slashes:

   ```properties
   sdk.dir=C:/Users/<you>/.bubblewrap/android_sdk
   ```

Bubblewrap itself is no longer needed.

## Once, in a checkout that built the TWA

Bubblewrap wrote its own project into this folder, and Git ignored it: its `app/`, its Gradle
files, `manifest-checksum.txt`, `store_icon.png`, and the TWA's builds. Its files would mix with
this project's, and its Java would break the build, so they go. The TWA's bundle is already on
Play. From the repository's root:

- **Before pulling 68d,** while Git still ignores them, `git clean -ndX android` lists them and
  `git clean -fdX android` deletes them.
- **After pulling it,** Git no longer ignores the ones 68d doesn't replace.
  `git clean -ndx android` lists every file in this folder that Git doesn't track, and
  `git clean -fdx android` deletes them. Write `local.properties` again after it.

## The upload key

`bubblewrap init` made it once, on 2026-10-17, under the alias `upload`, in a keystore at
`../../behold-keys/upload.keystore` from this folder, outside the repository. It signs the bundle
you upload. Play signs the app that players install with its own keys (Play App Signing), so the
site's asset links, `public/.well-known/assetlinks.json`, name Play's three keys as well as this
one.

1. **One password.** The keystore has one password, and the key the same, since keytool's PKCS12
   keystores ignore a separate key password. jarsigner asks for it at every signing: "Enter
   Passphrase for keystore:". It is long, in letters and digits only.

2. **Where it is kept.** On the PC, at the path above; and in the password manager, the keystore
   file as an attachment, with its password. Neither the file nor the password goes in the
   repository, a chat, a PR, or CI, or to anyone else.

3. **Its fingerprint, on #68.** The key's SHA-256 is posted there (issuecomment-6240555530), and
   the asset links list it last of their four. It is a public value, not a secret. To read it
   again, from this folder, where keytool asks for the password:

   ```powershell
   & "$HOME\.bubblewrap\jdk-x64\jdk-17.0.11+9\bin\keytool.exe" -list -v -keystore ..\..\behold-keys\upload.keystore -alias upload
   ```

   Its `SHA256:` line should read as #68's does.

4. **On another PC,** save the password manager's copy as `upload.keystore` in a `behold-keys`
   folder beside the repository's, and read its fingerprint (step 3) before the first build there.

5. **If it is lost or leaked,** it can be reset in Play Console, with a new key's certificate.
   The new key's SHA-256 then takes this one's place in the asset links and in the list
   `src/android.test.ts` pins them to, in the same PR.

## Building

In PowerShell, from this folder:

```powershell
$env:JAVA_HOME = "$HOME\.bubblewrap\jdk-x64\jdk-17.0.11+9"
.\gradlew.bat bundleRelease
& "$env:JAVA_HOME\bin\jarsigner.exe" -sigalg SHA256withRSA -digestalg SHA-256 -keystore ..\..\behold-keys\upload.keystore app\build\outputs\bundle\release\app-release.aab upload
```

- **`bundleRelease`** writes the bundle, unsigned, to `app\build\outputs\bundle\release\`. The
  first build downloads the Android Gradle plugin's libraries from Google's Maven repository and
  Maven Central. The wrapper checks the Gradle it downloads against the SHA-256 in
  `gradle/wrapper/gradle-wrapper.properties`, and stops if it differs.
- **jarsigner** asks for the password, then signs the bundle in place with the upload key.

## Uploading

- **In Play Console,** create a release on a testing track, upload `app-release.aab`, and roll it
  out. Play's App integrity page lists the SHA-256 fingerprints of Play's three app signing keys,
  which the asset links list first.
- **To check a build on a phone,** upload it to the internal track and install it from there, so
  it is the build Play serves, with Play's automatic protection.
- **Play takes each version code once,** so each upload raises it. On a branch, raise
  `appVersionCode` in `shell.json` by one, and `appVersion` with it when the shell changes, and the
  test's rows for them. The PR carries them. Once it merges, build from `main`, as above.
- **Play raises the target API it requires** from time to time. `targetSdkVersion` in
  `shell.json` rises with it, and the SDK platform with that.

## The check build

A build that never goes to Play: the same app as `house.shay.behold.check`, beside the Play app,
which can make its own renderer go, as WebView's own tests do with `chrome://crash` (it crashes)
and `chrome://kill` (it's killed, as Android kills it for memory). The Play app's build can't. It's
for the phone check of the restart (#151). It's "Behold check" on the home screen and in Recents,
so it can't be taken for the Play app.

1. **Once, on the phone:**
   - **Auto Blocker off, if it's on,** on a Galaxy phone (Settings > Security and privacy > Auto
     Blocker). Samsung's page says it "Blocks commands by USB cable" and "Blocks apps from
     unauthorized sources" (https://www.samsung.com/us/support/answer/ANS10003636), so it would
     stop `adb` and the install, and on some Galaxy phones it greys out USB debugging. It goes back
     on afterwards (step 4).
   - **USB debugging:** turn on Developer options and, in them, USB debugging, then connect the
     phone to the PC and allow it. `adb` is in the SDK's `platform-tools`.
2. **Build and install it,** in PowerShell from this folder. Gradle signs it with the PC's own
   debug key, which it makes on the first debug build in `$HOME\.android\`, not with the upload
   key:

   ```powershell
   $env:JAVA_HOME = "$HOME\.bubblewrap\jdk-x64\jdk-17.0.11+9"
   $adb = "$HOME\.bubblewrap\android_sdk\platform-tools\adb.exe"
   .\gradlew.bat assembleDebug
   & $adb install -r app\build\outputs\apk\debug\app-debug.apk
   & $adb shell am start -n house.shay.behold.check/house.shay.behold.MainActivity
   ```

3. **Make the renderer go,** once the game shows:
   - while the game is on the screen:
     `& $adb shell am start -a android.intent.action.VIEW -n house.shay.behold.check/house.shay.behold.MainActivity -d chrome://crash`
   - while the app is hidden: the same with `-d chrome://kill --ei wait 10`, then Home within
     ten seconds.
4. **Afterwards,** uninstall it, turn USB debugging off, and turn Auto Blocker back on:
   - `& $adb uninstall house.shay.behold.check` removes it, with its progress;
   - on the phone, in Developer options, turn USB debugging off, and unplug the phone;
   - turn Auto Blocker back on, if you turned it off.
