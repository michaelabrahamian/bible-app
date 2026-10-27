# Bible App

An offline English/Armenian Bible reader built with Expo, React Native, Expo Router, and TypeScript. It supports book/chapter navigation, side-by-side reading, automatic light/dark themes, and saved translation preferences and reading position.

## Setup

The project uses **Expo SDK 58, React Native 0.88, and React 19.3**.

Use Node.js **24.18.0** (`.node-version`) and npm. With fnm:

```sh
fnm use
npm ci
npm start
```

Use `npm run ios`, `npm run android`, or `npm run web` to open a development target. Native compilation requires the Xcode/Android toolchain supported by Expo SDK 58 (including iOS 16.4+ support). Rebuild native development clients after SDK/native dependency changes. Home-screen widgets are not implemented yet; future widget work requires a development build, not Expo Go.

## Checks

```sh
npm run check
npm run data:audit
npx expo install --check
npx expo-doctor
npx expo export --platform web
```

`check` runs TypeScript, lint, and tests. `data:audit` checks the structure of both bundled datasets and reports unavailable Armenian placeholders separately. A successful app build does not establish Bible text accuracy or release readiness. See [data/README.md](data/README.md).

## Current translations

- **English:** KJV, not NKJV.
- **Armenian:** the publicly distributed `ArmEastern.json`, containing Genesis, Exodus, Matthew, Mark, Luke, and John only. The app hides empty chapters, withholds 17 partly populated chapters with unreliable references, and labels this version partial. The remaining 162 chapters have not been independently verified. It is not verified as New Echmiadzin.

Both files match pinned public Scrollmapper downloads byte-for-byte; URLs and hashes are recorded in `data/sources.json`. Scrapers, scraped outputs, and unverified local conversions are excluded from the branch. Public availability does not replace text-specific licence requirements; see [data/README.md](data/README.md).

## Structure

- `app/(tabs)/index.tsx`: book list.
- `app/(tabs)/explore.tsx`: translation and comparison preferences.
- `app/reader.tsx`: chapter reader.
- `contexts/bible-context.tsx`: reading state, validated restoration, and device storage.
- `services/bible-service.ts`: access to the two bundled translations.
- `scripts/audit-bible-data.js`: structural content audit.
- `scripts/`: structural audit and its tests; see [scripts/README.md](scripts/README.md).

The reader navigates actual available chapter numbers rather than assuming every dataset is contiguous. This avoids missing-chapter navigation errors but does not repair the underlying content. Comparing translations matches book names and chapter numbers; it does not guarantee verse alignment across editions. Missing or withheld comparison content shows an explicit message beside the primary text. Both reading panes start at the top when the book, chapter, or translation changes.

## Storage

Preferences and reading position are stored locally under `bible-app:reader:v1` using AsyncStorage. Invalid or unreadable stored state falls back to available translations and chapters. Data is not synced between devices. Reopening the reader resumes the saved position; selecting a book starts at its first available chapter.

## Text and code rights

Bible texts have their own rights and attribution requirements. The app is a personal prototype; no application-code licence has been selected. See [data/README.md](data/README.md) for the evidence and unresolved questions for each text.

## Maintenance limitations

The October 2026 upgrade passes type checking, lint, tests, Expo dependency validation, and JavaScript/Hermes exports for iOS, Android, and web. These exports do not compile or launch a native app. Native device/simulator testing still requires full Xcode and an Android SDK.

At the maintenance check, npm audit reports five high-severity findings inherited through Expo CLI, involving node-forge and its Zod 3 dependency. The registry has no patched node-forge release, and Expo CLI requires Zod 3. Do not force a framework downgrade or a Zod major override to silence the report. Recheck when Expo publishes compatible fixes.
