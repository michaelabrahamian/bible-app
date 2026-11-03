# Daily Bible verse widget

The first native widget is for iOS 17+. Small widgets show Armenian; medium and
large widgets stack Armenian above KJV English. Long-press a widget and choose
**Edit Widget → Background** to pick System, Forest, Ocean, Clay, Plum, White,
Cream, Black or Grey. Each widget keeps its own choice. System preserves the
original forest palette and follows the phone's light/dark appearance; the other
options use a fixed background with matching readable text. The widget does not
yet inherit the reader's selected theme or offer translation preferences.

The Home Screen's tinted or clear appearance modes can override widget colours.
Use the standard Home Screen appearance to see the selected background colours.

Add **Daily Bible Verse** from the iPhone home-screen widget gallery after
installing a native build. Expo Go and JavaScript-only updates cannot add this
extension. Tap the widget to open its exact chapter and verse in the Bible tab;
the reader scrolls to the verse and highlights it for five seconds. Existing
reading layout and translation preferences are retained.

## Offline calendar

`data/daily-verse-references.json` is a starter cycle of 25 short New Testament
verses, selected for availability in both bundled editions and widget space.
The cycle starts on 1 January 2026 and repeats every 25 days. It is based on the
local Gregorian date, including daylight saving changes, rather than elapsed
24-hour periods or a random selection on refresh.

The config plugin derives a small native catalogue from the pinned reader texts.
It validates missing, duplicate and oversized references and preserves source
strings exactly. No new Bible downloads, API keys or server are required.

WidgetKit builds a rolling eight-entry timeline in the extension and requests a
new timeline at its end, including when the containing app is not running. It
does not depend on an expiring schedule written by the app. WidgetKit controls
the actual refresh timing. Changing timezones relies on the system requesting a
fresh timeline. Android widgets are not implemented yet; the reference catalogue,
calendar utility and verse links can be reused for that implementation.

## Native build and checks

The local `plugins/with-daily-verse-widget.cjs` config plugin generates a
`DailyVerseWidget` extension with bundle ID `<ios.bundleIdentifier>.widget`.
It is idempotent and does not need App Groups, push notifications, or a JavaScript
runtime inside the widget. Automatic signing uses the app's team when available;
configure signing for both targets in Xcode or pass `DEVELOPMENT_TEAM` when
building locally. The extension deployment target is iOS 17.

Run `npx expo prebuild --platform ios`, install CocoaPods dependencies, and build
the app. Do not hand-edit the generated catalogue in `ios/`.

`npm run check` covers catalogue generation and the reader link behavior. Test
the native calendar independently with:

```sh
xcrun swiftc widgets/ios/DailyVerseCalendar.swift widgets/tests/main.swift -o /tmp/bible-widget-calendar-test
/tmp/bible-widget-calendar-test
```

Hardware checks should include small/medium/large layouts, a cold app launch and
a tap while the app is already open, and adding a widget before opening the app.

## Text permissions

The prototype uses the existing bundled NEB and KJV texts. It does not obtain or
expand permission to distribute them. The Bible Society of Armenia confirmed
that NEB digital use, including widgets and offline reading, needs an agreement.
No agreement was obtained. See `TEXT_LICENSES.md` before public distribution.
