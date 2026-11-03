# Bible display regions

This local Expo module reports UIKit division regions in the reader view's own coordinates. It queries inactive regions too: the Duo's fully open fold has zero width but still identifies the two sides. UIKit observes region changes during layout; a hinge interaction also invalidates layout as the device folds. Reports include local horizontal safe-area insets and refresh when those insets change. Unchanged reports are suppressed.

Build with **Xcode 27.1 or newer**. Runtime calls are guarded for **iOS 27.1+**. Older iPhones return no divisions. Android, web, and Expo Go use the responsive reader's saved layout without native fold detection.

Expo autolinks this module from `modules/`. Generate the native project with `npx expo prebuild --platform ios`, or run `pod install` inside an existing `ios/` project, then rebuild the app. A JavaScript-only update cannot add this native module.

The reader measures its own viewport instead of assuming it fills the window, discards fold reports from a different viewport size, and explicitly updates both column widths on a display change. It reserves the system's reported fold margins, uses an additional minimum gutter for a flat fold, and positions headers and verse cells at matching pane widths. Beside a native side dock, it retains the system's safe area with a smaller additional outer margin. Horizontal folds use the existing linked-scroll panes. Detecting a fold never writes a different layout preference to device storage.

References: [Apple's adaptive layout guidance](https://developer.apple.com/videos/play/tech-talks/111463/), [preparing an app for Duo](https://developer.apple.com/videos/play/tech-talks/111461/), and [UIKit region observation](https://developer.apple.com/forums/thread/847876).

Automated coverage exercises flat and partly folded regions, rotated regions, asymmetric insets, window edges, preference restoration, and single-translation reading. Hardware validation should include opening/closing during reading and both full-screen and Split View windows on a Duo.
