# Changelog

## 2026-10-27 — Reading UI refresh

- Introduce warm paper and deep green themes with matching dark mode and navigation.
- Add a passage preview to Continue reading and book-name search to the library.
- Simplify translation selection and parallel-reading settings while retaining content notices.
- Use larger serif reading text and configurable Side by side or Stacked comparison at all screen sizes.
- Save eight themes (Forest, Ocean, Clay, Plum, White, Cream, Black, Grey) and System/Light/Dark appearance.
- Add the public-domain World English Bible British edition as a third text, preserving publisher references and blank entries.
- Provide independent translation selectors in Settings and reader headers.
- Align numeric verse pairs with equal row heights and shared scrolling in side-by-side mode; add a saved reader layout menu including primary-only and secondary-only reading without swapping translations.
- Add repo and in-app text licensing notes; document New Etchmiadzin's unresolved rights and four English candidates without bundling those English texts.
- Preserve saved reading state and chapter scroll resets.
- Replace ArmEastern with the pinned New Etchmiadzin GitHub copy; migrate saved book identities. Withhold uncertain Psalms and disclose missing books and reference limitations.
- Track licensed NKJV API integration in GitHub issue #2.

## 2026-10-27 — Review fixes

- Withhold 17 partly populated Armenian chapters with missing text and potentially shifted references; preserve public source files unchanged.
- Explain missing and withheld comparison content explicitly while keeping translations in separate panes.
- Reset reading panes to the top on book/chapter/translation changes.
- Make settings scrollable with top safe-area spacing and bottom padding.
- Add quarantine and saved-position regression coverage.

## 2026-10-27 — Framework and reader maintenance

- Upgrade Expo SDK 54 to 58 through SDKs 55, 56, and 57; align React 19.3, React Native 0.88, and SDK dependencies.
- Use public npm package URLs and pin the development Node version to 24.18.0.
- Migrate navigation imports to Expo Router and remove unused direct dependencies and obsolete app config.
- Save translation choices, comparison preference, and reading position; add Continue reading.
- Navigate actual chapter IDs, reset invalid saved selections, fill Android icon mappings, and fix web theme hydration.
- Add reader lifecycle tests, data-audit tests, and type/lint/check commands.
- Add structural audits and source records with pinned public download URLs and hashes. KJV and ArmEastern source files match the downloads exactly.
- Exclude scrapers, scraped outputs, unverified conversions, raw research inputs, and logs from published commits.
- Use partial ArmEastern in the reader, hide unavailable text, and label its six-book coverage.

Known limitations: Armenian coverage is partial, edition identity and release licence requirements need review, and npm audit flags upstream Expo CLI dependencies (node-forge and Zod). Native compilation needs a separate machine/toolchain check.

## Historical prototype — Simplified Architecture

### Complete Refactor

- **Removed** all API complexity, adapters, interfaces, and abstractions
- **Removed** support for multiple remote Bible sources
- **Removed** complex state management with loading/error states
- **Removed** 14 files including services, adapters, types, and documentation

### New Simple Architecture

- Direct JSON data imports from `data/` folder
- Single service file (`bible-service.ts`) with straightforward functions
- Simple React Context for state management
- No async operations - instant Bible access
- Only 2 versions supported: KJV and Eastern Armenian

### Features Added

- ✅ Chapter navigation (Previous/Next buttons)
- ✅ Chapter indicator showing "X of Y chapters"
- ✅ Clean, modern UI with proper spacing
- ✅ Full dark mode support
- ✅ Dual-view toggle from reader header
- ✅ Better version selection in settings

### Files Changed

- `services/bible-service.ts` - New simple service
- `contexts/bible-context.tsx` - Simplified context
- `app/(tabs)/index.tsx` - Cleaned up home screen
- `app/(tabs)/explore.tsx` - Simplified settings
- `app/reader.tsx` - Enhanced with navigation
- `README.md` - Completely rewritten

### Files Removed

- `services/bible-api.ts`
- `services/bible-service.interface.ts`
- `services/adapters/wldeh-bible-adapter.ts`
- `services/adapters/local-bible-adapter.ts`
- `types/domain.ts`
- `types/bible.ts`
- `components/bible-version-selector.tsx`
- `components/bible-chapter-view.tsx`
- `scripts/convert-scrollmapper-bibles.js`
- `ARCHITECTURE.md`
- `API_SETUP.md`
- `BIBLE_DATA_GUIDE.md`
- `SCROLLMAPPER_SETUP.md`
- `QUICKSTART.md`

### Performance

- **Before**: API calls with loading states, caching, error handling
- **After**: Instant access to Bible data, no loading states needed
- App size increased due to bundled data, but no network dependency

### Developer Experience

- Reduced from ~2000 lines of complex code to ~600 lines of simple code
- No more abstractions to understand
- Direct data access with TypeScript types
- Easy to add new versions (just add JSON + 3 lines of code)

---

## v1.0.0 - Initial Complex Architecture

### Features

- API integration with wldeh/bible-api
- Support for 140+ Bible versions
- Adapter pattern for swappable data sources
- Complex error handling and loading states
- Comprehensive documentation
