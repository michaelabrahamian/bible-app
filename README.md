# Bible App

An offline English/Armenian Bible reader built with Expo, React Native, Expo Router, and TypeScript. It supports book/chapter navigation, configurable parallel reading, saved colour themes and light/dark appearance, and saved translation preferences and reading position.

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

- **English:** KJV and World English Bible (British 66-book edition).
- **Armenian:** New Etchmiadzin from a pinned `thiagobodruk/bible` snapshot, replacing ArmEastern. This incomplete copy has 64 source books and all 27 NT books. Esther, Daniel and the publisher's additional canonical books are absent; Psalms is withheld because its 149 chapter arrays cannot be reliably mapped. The app offers the other 63 books. Matthew 23 and Mark 9 have verified verse-number corrections; other references come from source positions, remain unverified and may differ from English editions.

KJV and NEB source files match pinned public GitHub downloads byte-for-byte. WEB is imported from the publisher's official public-domain download with exact verse strings and reference numbers preserved. Source URLs and hashes are recorded in `data/sources.json`. ArmEastern has been removed from the current tree and app bundle. New Etchmiadzin's exact publisher edition and redistribution permission remain unverified; inclusion is for this prototype and is not clearance for public release. See [data/README.md](data/README.md) and [TEXT_LICENSES.md](TEXT_LICENSES.md).

## Structure

- `app/(tabs)/index.tsx`: reading card, book list, and book-name search.
- `app/(tabs)/explore.tsx`: translation and comparison preferences.
- `app/reader.tsx`: chapter reader.
- `contexts/bible-context.tsx`: reading state, validated restoration, and device storage.
- `services/bible-service.ts`: access to the two bundled translations.
- `scripts/audit-bible-data.js`: structural content audit.
- `scripts/`: structural audit and its tests; see [scripts/README.md](scripts/README.md).

Settings saves Forest, Ocean, Clay, Plum, White, Cream, Black or Grey themes; System, Light or Dark appearance; and Side by side or Stacked comparison layouts. Every palette has light and dark variants. Primary and comparison texts have separate selectors, also available in reader headers. Only two distinct translations are displayed at once. In secondary-only mode, the library and chapter navigation follow the secondary edition; saved positions use book names so switching catalogues preserves the passage.

The reader navigates actual available chapter numbers rather than assuming every dataset is contiguous. This avoids missing-chapter navigation errors but does not repair the underlying content. Side-by-side comparison aligns each numeric verse pair in a shared row and scroll area; the taller verse sets the row height. Missing verse references get an explicit edition notice. This matches reference numbers, not guaranteed equivalent passages across editions. Stacked panes scroll independently. Missing or withheld comparison content shows an explicit message beside the primary text. Both reading panes start at the top when the book, chapter, or translation changes. Side by side is the default at every screen size; Stacked is available in Settings for more text width. The reader’s top-right layout menu offers Primary only, Secondary only, Side by side and Stacked, saved to the same preferences. Narrow columns use smaller, still scalable reading text. WEB blank verse entries show an explicit edition notice.

## Storage

Reading preferences, comparison layout and reading position are stored locally under `bible-app:reader:v1`; colour and appearance preferences use `bible-app:appearance:v1`. Both use AsyncStorage. Invalid or unreadable stored state falls back to available translations and chapters. Data is not synced between devices. Reopening the reader resumes the saved position; selecting a book starts at its first available chapter.

## Text and code rights

Bible texts have their own rights and attribution requirements. The app is a personal prototype; no application-code licence has been selected. See [TEXT_LICENSES.md](TEXT_LICENSES.md) for included-text rights, the four remaining candidate translations and publisher permission routes; [data/README.md](data/README.md) records provenance and content limitations. Settings exposes licensing notes for the three bundled texts only. NKJV, NIV, NLT and ESV are not bundled. [Issue #2](https://github.com/michaelabrahamian/bible-app/issues/2) tracks licensed NKJV access.

## Maintenance limitations

The October 2026 upgrade passes type checking, lint, tests, Expo dependency validation, and JavaScript/Hermes exports for iOS, Android, and web. These exports do not compile or launch a native app. Native device/simulator testing still requires full Xcode and an Android SDK.

At the maintenance check, npm audit reports five high-severity findings inherited through Expo CLI, involving node-forge and its Zod 3 dependency. The registry has no patched node-forge release, and Expo CLI requires Zod 3. Do not force a framework downgrade or a Zod major override to silence the report. Recheck when Expo publishes compatible fixes.
