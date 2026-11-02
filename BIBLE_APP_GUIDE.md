# Reader guide

The **Bible** tab shows your saved passage and lists books in the visible navigation translation. Use **Find a book** to filter the list by book name, or tap the reading card to resume. Select a book to open its first available chapter.

On the reader, tap the compact book/chapter reference (for example, **Proverbs 24**) to open **Go to passage**. Choose a chapter directly, or tap the book name to search for another book and then choose its chapter. The reading position changes only after choosing a chapter; closing the picker cancels the selection. The picker follows the visible translation's available books and chapters. The sheet opens over a stationary backdrop, and respects the phone's Reduce Motion preference.

Swipe left for the next chapter or right for the previous chapter. The bottom arrows do the same, continuing across book boundaries and stopping at the beginning or end of the available Bible. Missing chapters and unavailable books are skipped. Vertical scrolling remains available in each reading pane.

In Stacked layout, scrolling either translation also moves the other to the corresponding verse position. The panes use measured verse positions rather than equal pixel offsets, so different text lengths stay in step. Omitted verses use the nearest shared references, and both panes finish at the bottom together. An unavailable chapter is left independent.

The reader keeps navigation compact: one line for the book/chapter heading, and a slim bottom row with chapter arrows and progress. The main Bible/Settings tabs float over the content using native Liquid Glass on supported iOS devices. Other devices keep the standard themed tab bar. Library and Settings content have extra bottom padding only when the floating bar is used.

The top-right **View** button (sliders icon) opens **Reading options**. Choose Primary only, Secondary only, Side by side or Stacked; adjust the reading text size with **A− / A+**; or change the colour theme and System/Light/Dark appearance. Changes apply immediately, and the menu stays open while you adjust them. Close it to return to reading. Parallel text defaults to Side by side on phones and tablets. Choose Stacked for wider lines. Tap either pane's translation header to choose another text.

The **Settings** tab chooses the primary and comparison translations independently. The same text cannot be selected in both panes; choosing the comparison text as primary swaps their roles. Settings also includes the same reading text size, colour theme and appearance controls as the reader. These preferences stay in sync between both screens and are saved on the device, along with translation choices, comparison preference and reading position.

Reading text size ranges from 80% to 180% of the default, in 10% steps. **Reset** returns it to 100%. Both translations, verse numbers and reading line spacing resize together. The phone's accessibility text scaling still applies. Updating the app preserves earlier theme preferences and starts at 100% if no text size was saved.

The app bundles KJV, World English Bible (British 66-book edition), and an incomplete New Etchmiadzin GitHub edition. ArmEastern is removed. New Etchmiadzin has all 27 NT books; Esther, Daniel and the publisher's additional canonical books are absent, and Psalms is withheld because its chapter references are uncertain. Source numbering and publisher rights remain unverified. Settings provides eight colour presets, Light/Dark/System appearance, Side by side/Stacked comparison, and per-translation licensing notes. See [data/README.md](data/README.md) and [TEXT_LICENSES.md](TEXT_LICENSES.md).

Settings includes a licensing note and a Text sources & licences page. NKJV, NIV, NLT and ESV remain unbundled pending licensed API integration. [Issue #2](https://github.com/michaelabrahamian/bible-app/issues/2) tracks NKJV. New Etchmiadzin is available with explicit source, coverage and unresolved-rights disclosures.
