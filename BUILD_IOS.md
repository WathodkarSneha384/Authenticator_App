# Building & Sharing the iOS App (Ad‑Hoc `.ipa`)

This guide turns the existing React Native app (currently Android-only) into a
shareable **iOS `.ipa`** that you can send to specific iPhone/iPad users
**without** publishing to the App Store.

> The same JavaScript/TypeScript in `mobile/src/` runs on iOS unchanged.
> The remote-config flow (fetch `apiBaseUrl` from the config endpoint, cache it,
> use it for every API call) works identically on iOS once the ATS exception
> below is in place — it already is, see `mobile/ios/ProctoAuthApp/Info.plist`.

---

## 0. Hard requirements (read first)

iOS is not like Android. You **cannot** "just send an `.ipa` and enable unknown
sources". To install on a real device the app must be **code-signed**, which
requires:

| Requirement | Why | Cost |
|---|---|---|
| **A Mac with Xcode** | Apple's build toolchain only runs on macOS. A Windows PC cannot produce an `.ipa`. Use a Mac, a rented cloud Mac, or a CI service (Codemagic/EAS/Bitrise). | — |
| **Apple Developer Program account** | Needed to sign the app and create provisioning profiles. | $99/yr |
| **Each recipient's device UDID** (for ad-hoc) | An ad-hoc profile only runs on devices you register (max **100** per type per year). | — |

If you don't want to collect UDIDs, use **TestFlight** instead (still not the
public store) — see the bottom of this doc.

---

## 1. What is already prepared in this repo

On branch `ios-development` the iOS config is pre-built so the Mac step is small:

```
mobile/ios/
├── Podfile                              # CocoaPods deps for RN 0.73
├── .xcode.env                           # points Xcode build scripts at node
├── .gitignore                           # ignores Pods/, build/, *.ipa, etc.
├── ExportOptions.adhoc.example.plist    # template for the ad-hoc export
└── ProctoAuthApp/
    └── Info.plist                       # ✅ ATS exception + vector-icon fonts
```

What's intentionally **not** committed: the Xcode project wrapper
(`ProctoAuthApp.xcodeproj`, `AppDelegate`, `main.m`, `LaunchScreen.storyboard`,
asset catalogs). Those must be generated from the official RN template **on a
Mac** so the project file is valid (a hand-written one breaks easily). Step 2
generates them, then you keep our configured `Info.plist` / `Podfile`.

---

## 2. Generate the native iOS project (on the Mac, one time)

```bash
# Prereqs on the Mac: Xcode, Node 18+, Watchman, CocoaPods, Ruby
#   sudo gem install cocoapods

# 1) Clone the repo and switch to this branch
git clone <your-repo-url>
cd <repo>/mobile
git checkout ios-development

# 2) Install JS deps
npm install

# 3) Generate a throwaway RN 0.73.6 project with the SAME app name,
#    then copy its ios/ wrapper in (this gives a valid .xcodeproj).
cd ..
npx @react-native-community/cli@latest init ProctoAuthApp --version 0.73.6 --directory _ios_tmp --skip-install

# 4) Copy ONLY the generated Xcode wrapper files we don't already have:
cp -R _ios_tmp/ios/ProctoAuthApp.xcodeproj            mobile/ios/
cp    _ios_tmp/ios/ProctoAuthApp/AppDelegate.h         mobile/ios/ProctoAuthApp/
cp    _ios_tmp/ios/ProctoAuthApp/AppDelegate.mm        mobile/ios/ProctoAuthApp/
cp    _ios_tmp/ios/ProctoAuthApp/main.m                mobile/ios/ProctoAuthApp/
cp    _ios_tmp/ios/ProctoAuthApp/LaunchScreen.storyboard mobile/ios/ProctoAuthApp/
cp -R _ios_tmp/ios/ProctoAuthApp/Images.xcassets       mobile/ios/ProctoAuthApp/
cp -R _ios_tmp/ios/ProctoAuthApp/PrivacyInfo.xcprivacy mobile/ios/ProctoAuthApp/ 2>/dev/null || true

# IMPORTANT: do NOT overwrite mobile/ios/Podfile or
# mobile/ios/ProctoAuthApp/Info.plist — keep the ones already in this repo
# (they contain the ATS exception + icon fonts).

rm -rf _ios_tmp
```

> Tip: When asked, make sure the generated project's name is exactly
> **`ProctoAuthApp`** so it matches `app.json` (`AppRegistry` name) and the
> `Podfile` target.

---

## 3. Install pods

```bash
cd mobile/ios
pod install
cd ..
```

Open the **workspace** (not the project) from now on:

```bash
open ios/ProctoAuthApp.xcworkspace
```

---

## 4. Verify it runs (simulator — no account needed)

```bash
npx react-native run-ios
```

Confirm: app launches, the **config fetch** logs `Remote config — apiBaseUrl:`,
the User ID → OTP flow works, and the **Ionicons** render (not blank squares).
If icons are blank, the fonts didn't get bundled — re-check `UIAppFonts` in
`Info.plist` and that vector-icons fonts are added to the target's
"Copy Bundle Resources".

---

## 5. Configure signing (in Xcode)

1. In Xcode, select the **ProctoAuthApp** target → **Signing & Capabilities**.
2. Set **Team** to your Apple Developer team.
3. Set **Bundle Identifier** to `com.proctoapp` (matches Android `applicationId`).
4. Keep **Automatically manage signing** checked — Xcode creates the certs/profiles.

---

## 6. Register the recipients' devices (ad-hoc only)

1. Collect each device **UDID** (recipient: connect iPhone to a Mac → Finder →
   click the serial to reveal UDID; or use a site like get.udid.io).
2. In [Apple Developer → Devices](https://developer.apple.com/account/resources/devices/list),
   add each UDID.
3. Let Xcode refresh the provisioning profile (it will include the new devices).

---

## 7. Build the shareable `.ipa`

### Option A — Xcode GUI
1. Select destination **Any iOS Device (arm64)**.
2. **Product → Archive**.
3. In the Organizer: **Distribute App → Ad Hoc → Export**.
4. Xcode writes a folder containing **`ProctoAuthApp.ipa`** — that's your file.

### Option B — Command line
```bash
cd mobile/ios

# Copy the template and set your real Team ID
cp ExportOptions.adhoc.example.plist ExportOptions.plist
# edit ExportOptions.plist → replace YOUR_TEAM_ID

xcodebuild -workspace ProctoAuthApp.xcworkspace \
  -scheme ProctoAuthApp \
  -configuration Release \
  -archivePath build/ProctoAuthApp.xcarchive \
  archive

xcodebuild -exportArchive \
  -archivePath build/ProctoAuthApp.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/ipa

# Result: mobile/ios/build/ipa/ProctoAuthApp.ipa
```

---

## 8. How recipients install the `.ipa`

Pick one:

- **Apple Configurator** (Mac) or **Apple Devices app**: connect the iPhone and
  drag the `.ipa` on — simplest for a few users.
- **Over-the-air (OTA) link**: host the `.ipa` + a `manifest.plist` on an HTTPS
  URL and share an `itms-services://` link. Services like **Diawi.com** or
  **InstallOnAir** do this for you (upload `.ipa`, get a link/QR).
- Recipients may need: **Settings → General → VPN & Device Management → trust**
  the developer profile.

> Reminder: only the devices whose UDIDs you registered in step 6 can install an
> ad-hoc build. Ad-hoc profiles also **expire after 1 year** — re-export to renew.

---

## Easier alternative if you're stuck on Windows: cloud build, no Mac

You can produce the `.ipa` without owning a Mac:

- **Codemagic** or **Bitrise**: connect this repo, set bundle id `com.proctoapp`,
  upload your Apple signing assets (or let them manage signing), pick
  "Ad Hoc" / "Development" export → download the `.ipa`.
- **EAS Build** (`eas build -p ios --profile preview`): works with bare RN; it
  builds on Expo's Macs and gives you an installable build.

All of these still require the **Apple Developer account** and (for ad-hoc) the
**registered UDIDs** — that's an Apple rule, not a tooling limit.

## Easiest sharing without UDIDs: TestFlight

If collecting UDIDs is annoying, upload the build to **TestFlight** (via Xcode or
Codemagic). It's **not the public App Store** — you invite testers by email/link,
up to 10,000 of them. Internal testers get builds instantly; external testers
need a quick one-time Apple review.

---

## Project-specific notes

- **HTTP / ATS:** `mobile/ios/ProctoAuthApp/Info.plist` whitelists
  `223.30.224.244` so the cleartext HTTP config/API calls work (Android allows
  this via `usesCleartextTraffic="true"`). **If the server IP/host changes, update
  that key** — or, better, move the backend to **HTTPS with a domain** and delete
  the exception (Apple may reject HTTP exceptions at review).
- **Icons:** the app uses `react-native-vector-icons` (Ionicons). The font list
  is in `UIAppFonts`. The generate step's `pod install` links the fonts via the
  pod's resources.
- **Hermes / New Arch:** Android uses Hermes with the old architecture
  (`newArchEnabled=false`). The default RN 0.73 iOS template matches this, so no
  extra change is needed.
- **Bundle id:** keep it `com.proctoapp` on both platforms for consistency.
```
