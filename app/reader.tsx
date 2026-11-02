import { ThemedText } from "@/components/themed-text";
import {
  ReaderOptionsMenu,
  type ReaderLayout,
} from "@/components/reader-options-menu";
import { useAppearance } from "@/contexts/appearance-context";
import { PassagePicker } from "@/components/passage-picker";
import { DisplayRegionsObserver } from "@/components/display-regions-observer";
import {
  getReaderDisplaySplit,
  type ReaderDisplayRegions,
  type ReaderDisplaySplit,
} from "@/utils/reader-display-layout";
import { TranslationSelect } from "@/components/translation-select";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useBible } from "@/contexts/bible-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getAdjacentPassage } from "@/utils/reader-navigation";
import {
  createLinkedVerseScroll,
  type LinkedVerseScroll,
} from "@/utils/linked-verse-scroll";
import {
  getChapterAvailability,
  type Chapter,
  type Verse,
} from "@/services/bible-service";
import { useLayoutEffect, useRef, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useIsFocused } from "expo-router/react-navigation";
import {
  StyleSheet,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  GestureDetector,
  ScrollView,
  usePanGesture,
  type PanGesture,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ReaderScreen() {
  const {
    primaryVersion,
    secondaryVersion,
    currentChapter,
    showDualView,
    toggleDualView,
    setPassage,
    setCurrentBook,
    moveChapter,
    getPrimaryChapter,
    getSecondaryChapter,
    getCurrentBookName,
    getChapterNumbers,
    getBooks,
    setPrimaryVersion,
    setSecondaryVersion,
    comparisonLayout,
    setComparisonLayout,
    getVersions,
    singlePane,
    setSinglePane,
  } = useBible();
  const { book: requestedBook } = useLocalSearchParams<{
    book?: string | string[];
  }>();
  const isFocused = useIsFocused();
  const openedBook = useRef<string | undefined>(undefined);
  useLayoutEffect(() => {
    if (
      !isFocused ||
      typeof requestedBook !== "string" ||
      openedBook.current === requestedBook
    )
      return;
    openedBook.current = requestedBook;
    const index = getBooks().findIndex(({ name }) => name === requestedBook);
    if (index >= 0) setCurrentBook(index);
    // Consume the request so refocusing cannot reset later chapter navigation.
    router.setParams({ book: undefined });
  }, [isFocused, requestedBook, getBooks, setCurrentBook]);
  const [readingMenuOpen, setReadingMenuOpen] = useState(false);
  const [passagePickerOpen, setPassagePickerOpen] = useState(false);
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [displayRegions, setDisplayRegions] =
    useState<ReaderDisplayRegions | null>(null);
  const outerPadding = { left: insets.left + 16, right: insets.right + 16 };
  const displaySplit =
    displayRegions && Math.abs(displayRegions.width - width) < 1
      ? getReaderDisplaySplit(displayRegions, outerPadding)
      : null;
  const bookName = getCurrentBookName();
  const books = getBooks();
  const chapters = getChapterNumbers();
  const chapterIndex = chapters.indexOf(currentChapter);
  const previousPassage = getAdjacentPassage(
    books,
    bookName,
    currentChapter,
    -1,
  );
  const nextPassage = getAdjacentPassage(books, bookName, currentChapter, 1);
  const chapterSwipe = usePanGesture({
    testID: "chapter-swipe",
    enabled: !readingMenuOpen && !passagePickerOpen,
    activeOffsetX: [-24, 24],
    failOffsetY: [-14, 14],
    maxPointers: 1,
    runOnJS: true,
    onDeactivate: ({ canceled, translationX, translationY }) => {
      // Ignore short drags, canceled gestures and diagonal scrolling. Native
      // failOffsetY also gives vertical scrolling priority before activation.
      if (
        canceled ||
        Math.abs(translationX) < Math.min(72, width * 0.18) ||
        Math.abs(translationX) < Math.abs(translationY) * 1.5
      )
        return;
      moveChapter(translationX < 0 ? 1 : -1);
    },
  });
  const comparing = showDualView && Boolean(secondaryVersion);
  const split = comparing ? displaySplit : null;
  const sideBySide =
    comparing &&
    (split ? split.axis === "vertical" : comparisonLayout === "side-by-side");
  const verticalSplit = split?.axis === "vertical" ? split : null;
  const narrow =
    sideBySide &&
    (verticalSplit
      ? Math.min(verticalSplit.primary, verticalSplit.secondary) < 334
      : width < 700);
  const secondaryOnly =
    !comparing && singlePane === "secondary" && Boolean(secondaryVersion);
  const selectedLayout = comparing
    ? sideBySide
      ? "side-by-side"
      : "stacked"
    : secondaryOnly
      ? "secondary"
      : "primary";
  const selectLayout = (layout: ReaderLayout) => {
    if (layout === "primary" || layout === "secondary") {
      if (layout === "secondary" && !secondaryVersion) {
        const other = getVersions().find(({ id }) => id !== primaryVersion);
        if (other) setSecondaryVersion(other.id);
      }
      setSinglePane(layout);
      if (showDualView) toggleDualView();
    } else {
      if (!secondaryVersion) {
        const other = getVersions().find(({ id }) => id !== primaryVersion);
        if (other) setSecondaryVersion(other.id);
      }
      if (!displaySplit) setComparisonLayout(layout);
      if (!showDualView) toggleDualView();
    }
  };

  const unavailableMessage = (versionId: string) =>
    getChapterAvailability(versionId, bookName, currentChapter) === "withheld"
      ? `${bookName} ${currentChapter} is withheld in this translation because its chapter or verse references are uncertain.`
      : `${bookName} ${currentChapter} is not available in this translation.`;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 16,
            paddingLeft: outerPadding.left,
            paddingRight: outerPadding.right,
            maxWidth: comparing ? undefined : 1060,
          },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back to library"
          style={[
            styles.iconButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
        >
          <IconSymbol name="arrow.left" size={21} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Choose passage: ${bookName} ${currentChapter}`}
          accessibilityHint="Choose a book and chapter"
          aria-expanded={passagePickerOpen}
          onPress={() => setPassagePickerOpen(true)}
          style={[
            styles.heading,
            verticalSplit && { flex: 0, width: verticalSplit.primary - 60 },
          ]}
        >
          <View style={styles.passageTitle}>
            <ThemedText numberOfLines={1} style={styles.bookTitle}>
              {bookName} {currentChapter}
            </ThemedText>
            <IconSymbol name="chevron.down" size={14} color={colors.tint} />
          </View>
        </TouchableOpacity>
        {verticalSplit && <View style={{ flex: 1 }} />}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Reading options"
          aria-expanded={readingMenuOpen}
          accessibilityHint="Change layout, text size, colour theme and appearance"
          style={[
            styles.iconButton,
            styles.readingOptionsButton,
            {
              backgroundColor: comparing ? colors.accentSoft : colors.surface,
              borderColor: comparing ? colors.accentSoft : colors.border,
            },
          ]}
          onPress={() => setReadingMenuOpen(true)}
        >
          <IconSymbol
            name="slider.horizontal.3"
            size={18}
            color={colors.tint}
          />
          <ThemedText
            style={[styles.readingOptionsLabel, { color: colors.tint }]}
          >
            View
          </ThemedText>
        </TouchableOpacity>
      </View>
      {passagePickerOpen && (
        <PassagePicker
          books={books}
          currentBookName={bookName}
          currentChapter={currentChapter}
          onClose={() => setPassagePickerOpen(false)}
          onSelect={(name, chapter) => {
            setPassage(name, chapter);
            setPassagePickerOpen(false);
          }}
        />
      )}
      {readingMenuOpen && (
        <ReaderOptionsMenu
          selectedLayout={selectedLayout}
          displayLayout={
            displaySplit
              ? displaySplit.axis === "vertical"
                ? "side-by-side"
                : "stacked"
              : undefined
          }
          onSelectLayout={selectLayout}
          onClose={() => setReadingMenuOpen(false)}
        />
      )}

      <GestureDetector gesture={chapterSwipe} touchAction="pan-y">
        <View
          style={[
            styles.readingArea,
            {
              flexDirection: sideBySide ? "row" : "column",
              gap: split?.gap ?? (narrow ? 8 : 12),
              maxWidth: comparing ? undefined : 1060,
              paddingLeft: outerPadding.left,
              paddingRight: outerPadding.right,
            },
          ]}
        >
          <DisplayRegionsObserver
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            onRegionsChange={({ nativeEvent }) =>
              setDisplayRegions(nativeEvent)
            }
          />
          {sideBySide && secondaryVersion ? (
            <AlignedChapters
              split={verticalSplit}
              key={`${primaryVersion}:${secondaryVersion}:${bookName}:${currentChapter}`}
              primary={{
                chapter: getPrimaryChapter(),
                versionId: primaryVersion,
                label: "Primary translation",
                onVersionChange: setPrimaryVersion,
                swapVersion: secondaryVersion,
                narrow,
                unavailableMessage: unavailableMessage(primaryVersion),
                swipeGesture: chapterSwipe,
              }}
              secondary={{
                chapter: getSecondaryChapter(),
                versionId: secondaryVersion,
                label: "Comparison translation",
                onVersionChange: setSecondaryVersion,
                excludedVersion: primaryVersion,
                narrow,
                unavailableMessage: unavailableMessage(secondaryVersion),
                swipeGesture: chapterSwipe,
              }}
            />
          ) : comparing && secondaryVersion ? (
            <StackedChapters
              split={split?.axis === "horizontal" ? split : null}
              key={`${primaryVersion}:${secondaryVersion}:${bookName}:${currentChapter}`}
              primary={{
                chapter: getPrimaryChapter(),
                versionId: primaryVersion,
                label: "Primary translation",
                onVersionChange: setPrimaryVersion,
                swapVersion: secondaryVersion,
                narrow: false,
                unavailableMessage: unavailableMessage(primaryVersion),
                swipeGesture: chapterSwipe,
              }}
              secondary={{
                chapter: getSecondaryChapter(),
                versionId: secondaryVersion,
                label: "Comparison translation",
                onVersionChange: setSecondaryVersion,
                excludedVersion: primaryVersion,
                narrow: false,
                unavailableMessage: unavailableMessage(secondaryVersion),
                swipeGesture: chapterSwipe,
              }}
            />
          ) : (
            <>
              <View style={styles.pane}>
                <ChapterView
                  key={`${secondaryOnly ? secondaryVersion : primaryVersion}:${bookName}:${currentChapter}:${comparing ? comparisonLayout : "single"}`}
                  chapter={
                    secondaryOnly ? getSecondaryChapter() : getPrimaryChapter()
                  }
                  versionId={secondaryOnly ? secondaryVersion! : primaryVersion}
                  swapVersion={
                    secondaryOnly ? undefined : (secondaryVersion ?? undefined)
                  }
                  excludedVersion={secondaryOnly ? primaryVersion : undefined}
                  label={
                    secondaryOnly
                      ? "Comparison translation"
                      : "Primary translation"
                  }
                  onVersionChange={
                    secondaryOnly ? setSecondaryVersion : setPrimaryVersion
                  }
                  narrow={false}
                  swipeGesture={chapterSwipe}
                  unavailableMessage={unavailableMessage(
                    secondaryOnly ? secondaryVersion! : primaryVersion,
                  )}
                />
              </View>
            </>
          )}
        </View>
      </GestureDetector>

      <View
        style={[
          styles.navigation,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            paddingLeft: outerPadding.left,
            paddingRight: outerPadding.right,
            maxWidth: comparing ? undefined : 1060,
          },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Previous chapter"
          accessibilityState={{ disabled: previousPassage === undefined }}
          disabled={previousPassage === undefined}
          onPress={() => moveChapter(-1)}
          style={[
            styles.navButton,
            {
              opacity: previousPassage === undefined ? 0.4 : 1,
            },
          ]}
        >
          <IconSymbol name="chevron.left" size={19} color={colors.text} />
        </TouchableOpacity>
        <View
          style={[
            styles.progress,
            verticalSplit && { flex: 0, width: verticalSplit.primary - 60 },
          ]}
        >
          <ThemedText
            accessibilityLabel={`${chapterIndex + 1} of ${chapters.length} available chapters`}
            style={styles.progressNumbers}
          >
            {chapterIndex + 1}
            <ThemedText
              style={[styles.progressTotal, { color: colors.secondaryText }]}
            >
              {" "}
              / {chapters.length}
            </ThemedText>
          </ThemedText>
        </View>
        {verticalSplit && <View style={{ flex: 1 }} />}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Next chapter"
          accessibilityState={{ disabled: nextPassage === undefined }}
          disabled={nextPassage === undefined}
          onPress={() => moveChapter(1)}
          style={[
            styles.navButton,
            {
              opacity: nextPassage === undefined ? 0.4 : 1,
            },
          ]}
        >
          <IconSymbol name="chevron.right" size={19} color={colors.tint} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface ReadingPane {
  chapter: Chapter | null;
  versionId: string;
  label: string;
  onVersionChange: (id: string) => void;
  excludedVersion?: string;
  swapVersion?: string;
  narrow: boolean;
  unavailableMessage: string;
  swipeGesture: PanGesture;
}

function StackedChapters({
  primary,
  secondary,
  split,
}: {
  primary: ReadingPane;
  secondary: ReadingPane;
  split: ReaderDisplaySplit | null;
}) {
  const [scrollLink] = useState(createLinkedVerseScroll);
  return (
    <>
      {([primary, secondary] as const).map((pane, index) => (
        <View
          key={pane.label}
          testID={`comparison-pane-${pane.versionId}`}
          style={[
            styles.pane,
            split && {
              flex: 0,
              height: index === 0 ? split.primary : split.secondary,
            },
          ]}
        >
          <ChapterView
            {...pane}
            linkedScroll={{ controller: scrollLink, pane: index as 0 | 1 }}
          />
        </View>
      ))}
    </>
  );
}

function AlignedChapters({
  primary,
  secondary,
  split,
}: {
  primary: ReadingPane;
  secondary: ReadingPane;
  split: ReaderDisplaySplit | null;
}) {
  const colors = useAppTheme();
  const panes = [primary, secondary];
  const columnSize = (index: number) =>
    split
      ? { flex: 0, width: (index === 0 ? split.primary : split.secondary) - 1 }
      : undefined;
  const verses = panes.map(
    ({ chapter }) =>
      new Map(chapter?.verses.map((verse) => [verse.verse, verse])),
  );
  const numbers = [...new Set(verses.flatMap((map) => [...map.keys()]))].sort(
    (a, b) => a - b,
  );
  if (!numbers.length) numbers.push(1);
  return (
    <View
      style={[
        styles.chapter,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.parallelRow, { gap: split?.gap ?? 0 }]}>
        {panes.map((pane, index) => (
          <View
            key={pane.label}
            testID={`parallel-header-${pane.versionId}`}
            style={[styles.parallelColumn, columnSize(index)]}
          >
            <TranslationSelect
              label={pane.label}
              value={pane.versionId}
              onChange={pane.onVersionChange}
              excludedVersion={pane.excludedVersion}
              swapVersion={pane.swapVersion}
              compact
            />
          </View>
        ))}
      </View>
      <ScrollView
        simultaneousWith={primary.swipeGesture}
        style={styles.versesContainer}
        contentContainerStyle={styles.parallelContent}
        showsVerticalScrollIndicator={false}
      >
        {numbers.map((number, rowIndex) => (
          <View
            key={number}
            testID={`parallel-verse-${number}`}
            style={[styles.parallelRow, { gap: split?.gap ?? 0 }]}
          >
            {panes.map((pane, index) => (
              <View
                key={pane.label}
                testID={`parallel-${pane.versionId}-verse-${number}`}
                style={[
                  styles.parallelColumn,
                  columnSize(index),
                  styles.parallelCell,
                  pane.narrow && styles.narrowParallelCell,
                ]}
              >
                {pane.chapter ? (
                  <VerseContent
                    verse={
                      verses[index].get(number) ?? { verse: number, text: "" }
                    }
                    narrow={pane.narrow}
                  />
                ) : rowIndex === 0 ? (
                  <UnavailableText message={pane.unavailableMessage} />
                ) : null}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      {!split && (
        <View
          testID="parallel-divider"
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.parallelDivider, { borderLeftColor: colors.border }]}
        />
      )}
    </View>
  );
}

function VerseContent({ verse, narrow }: { verse: Verse; narrow: boolean }) {
  const colors = useAppTheme();
  const { readingTextSize } = useAppearance();
  const scale = readingTextSize / 100;
  const fontSize = (narrow ? 16 : 19) * scale;
  const lineHeight = (narrow ? 27 : 32) * scale;
  return (
    <View style={[styles.verseRow, narrow && styles.narrowVerseRow]}>
      <ThemedText
        style={[
          styles.verseNumber,
          { color: colors.secondaryText, fontSize: 10 * scale, lineHeight },
        ]}
      >
        {verse.verse}
      </ThemedText>
      <ThemedText
        style={[
          styles.verseText,
          { fontSize, lineHeight },
          !verse.text.trim() && {
            fontFamily: undefined,
            fontSize: 12 * scale,
            lineHeight: 20 * scale,
            color: colors.secondaryText,
          },
        ]}
      >
        {verse.text.trim() ? verse.text : "Not included in this edition."}
      </ThemedText>
    </View>
  );
}

function UnavailableText({ message }: { message: string }) {
  const colors = useAppTheme();
  return (
    <View style={styles.noContent}>
      <IconSymbol name="info.circle" size={24} color={colors.secondaryText} />
      <ThemedText style={[styles.noContentTitle, { color: colors.text }]}>
        Text unavailable
      </ThemedText>
      <ThemedText
        style={[styles.noContentBody, { color: colors.secondaryText }]}
      >
        {message}
      </ThemedText>
    </View>
  );
}

function ChapterView({
  chapter,
  versionId,
  label,
  onVersionChange,
  excludedVersion,
  swapVersion,
  narrow,
  unavailableMessage,
  swipeGesture,
  linkedScroll,
}: ReadingPane & {
  linkedScroll?: { controller: LinkedVerseScroll; pane: 0 | 1 };
}) {
  const colors = useAppTheme();
  const takeControl = () =>
    linkedScroll?.controller.activate(linkedScroll.pane);
  return (
    <View
      style={[
        styles.chapter,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <TranslationSelect
        label={label}
        value={versionId}
        excludedVersion={excludedVersion}
        swapVersion={swapVersion}
        onChange={onVersionChange}
        compact
      />
      <ScrollView
        testID={`chapter-scroll-${versionId}`}
        ref={(node) =>
          linkedScroll?.controller.attach(
            linkedScroll.pane,
            node ? (y) => node.scrollTo({ y, animated: false }) : undefined,
          )
        }
        onScrollBeginDrag={takeControl}
        onTouchStart={takeControl}
        // React Native Web forwards these DOM events; native uses drag/touch.
        {...(Platform.OS === "web"
          ? {
              onWheel: takeControl,
              onPointerDown: takeControl,
              onKeyDown: takeControl,
            }
          : {})}
        onLayout={({ nativeEvent }) =>
          linkedScroll?.controller.measureViewport(
            linkedScroll.pane,
            nativeEvent.layout.height,
          )
        }
        onContentSizeChange={(_, height) =>
          linkedScroll?.controller.measureContent(linkedScroll.pane, height)
        }
        onScroll={({ nativeEvent }) =>
          linkedScroll?.controller.scroll(
            linkedScroll.pane,
            nativeEvent.contentOffset.y,
          )
        }
        scrollEventThrottle={16}
        simultaneousWith={swipeGesture}
        style={styles.versesContainer}
        contentContainerStyle={[
          styles.versesContent,
          narrow && styles.narrowContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {chapter ? (
          chapter.verses.map((verse) => (
            <View
              key={verse.verse}
              testID={`chapter-${versionId}-verse-${verse.verse}`}
              onLayout={({ nativeEvent }) =>
                linkedScroll?.controller.measureVerse(
                  linkedScroll.pane,
                  verse.verse,
                  nativeEvent.layout.y,
                )
              }
            >
              <VerseContent verse={verse} narrow={narrow} />
            </View>
          ))
        ) : (
          <UnavailableText message={unavailableMessage} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    maxWidth: 1060,
    alignSelf: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  readingOptionsButton: {
    width: "auto",
    minWidth: 66,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
  },
  readingOptionsLabel: { fontSize: 11, lineHeight: 16, fontWeight: "600" },
  heading: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 8,
    minHeight: 44,
  },
  passageTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    maxWidth: "100%",
  },
  bookTitle: {
    flexShrink: 1,
    fontFamily: Fonts.serif,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600",
  },
  readingArea: {
    flex: 1,
    gap: 12,
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: 1060,
    alignSelf: "center",
    minHeight: 0,
  },
  pane: { flex: 1, minHeight: 0, minWidth: 0 },
  chapter: { flex: 1, borderRadius: 21, borderWidth: 1, overflow: "hidden" },
  parallelRow: { flexDirection: "row", alignItems: "stretch" },
  parallelDivider: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  parallelColumn: { flex: 1, minWidth: 0 },
  parallelContent: { paddingTop: 16, paddingBottom: 28 },
  parallelCell: { paddingHorizontal: 18 },
  narrowParallelCell: { paddingHorizontal: 10 },
  versesContainer: { flex: 1 },
  versesContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 28 },
  narrowContent: { paddingHorizontal: 10, paddingTop: 16 },
  narrowVerseRow: { gap: 4, marginBottom: 16 },
  verseRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
  verseNumber: {
    fontSize: 10,
    lineHeight: 30,
    minWidth: 16,
    fontVariant: ["tabular-nums"],
  },
  verseText: {
    flex: 1,
    minWidth: 0,
    fontFamily: Fonts.serif,
    fontSize: 19,
    lineHeight: 32,
  },
  noContent: { alignItems: "center", paddingVertical: 12, gap: 10 },
  noContentTitle: { fontSize: 15, lineHeight: 22, fontWeight: "600" },
  noContentBody: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 320,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    width: "100%",
    maxWidth: 1060,
    alignSelf: "center",
  },
  navButton: {
    borderRadius: 22,
    minHeight: 44,
    minWidth: 44,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  progress: { flex: 1, alignItems: "center", gap: 1 },
  progressNumbers: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  progressTotal: { fontSize: 12, lineHeight: 18, fontWeight: "400" },
});
