import { ThemedText } from "@/components/themed-text";
import { TranslationSelect } from "@/components/translation-select";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useBible } from "@/contexts/bible-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  getChapterAvailability,
  type Chapter,
  type Verse,
} from "@/services/bible-service";
import { useState } from "react";
import { router, Stack } from "expo-router";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ReaderScreen() {
  const {
    primaryVersion,
    secondaryVersion,
    currentChapter,
    showDualView,
    toggleDualView,
    setCurrentChapter,
    getPrimaryChapter,
    getSecondaryChapter,
    getCurrentBookName,
    getChapterNumbers,
    setPrimaryVersion,
    setSecondaryVersion,
    comparisonLayout,
    setComparisonLayout,
    getVersions,
    singlePane,
    setSinglePane,
  } = useBible();
  const [layoutMenuOpen, setLayoutMenuOpen] = useState(false);
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const bookName = getCurrentBookName();
  const chapters = getChapterNumbers();
  const chapterIndex = chapters.indexOf(currentChapter);
  const previousChapter = chapters[chapterIndex - 1];
  const nextChapter = chapters[chapterIndex + 1];
  const comparing = showDualView && Boolean(secondaryVersion);
  const sideBySide = comparing && comparisonLayout === "side-by-side";
  const narrow = sideBySide && width < 700;
  const layoutOptions = [
    { id: "primary", name: "Primary only", icon: "text.alignleft" },
    { id: "secondary", name: "Secondary only", icon: "text.alignleft" },
    { id: "side-by-side", name: "Side by side", icon: "rectangle.split.2x1" },
    { id: "stacked", name: "Stacked", icon: "rectangle.split.1x2" },
  ] as const;
  const secondaryOnly =
    !comparing && singlePane === "secondary" && Boolean(secondaryVersion);
  const selectedLayout = comparing
    ? comparisonLayout
    : secondaryOnly
      ? "secondary"
      : "primary";
  const selectLayout = (layout: (typeof layoutOptions)[number]["id"]) => {
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
      setComparisonLayout(layout);
      if (!showDualView) toggleDualView();
    }
    setLayoutMenuOpen(false);
  };

  const unavailableMessage = (versionId: string) =>
    getChapterAvailability(versionId, bookName, currentChapter) === "withheld"
      ? `${bookName} ${currentChapter} is withheld in this translation because its chapter or verse references are uncertain.`
      : `${bookName} ${currentChapter} is not available in this translation.`;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
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
        <View style={styles.heading}>
          <ThemedText style={[styles.eyebrow, { color: colors.secondaryText }]}>
            CHAPTER {currentChapter}
          </ThemedText>
          <ThemedText
            accessibilityRole="header"
            numberOfLines={1}
            style={styles.bookTitle}
          >
            {bookName}
          </ThemedText>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Reading layout: ${layoutOptions.find(({ id }) => id === selectedLayout)?.name}`}
          aria-expanded={layoutMenuOpen}
          accessibilityHint="Choose primary only, secondary only, side by side, or stacked"

          style={[
            styles.iconButton,
            {
              backgroundColor: comparing ? colors.accentSoft : colors.surface,
              borderColor: comparing ? colors.accentSoft : colors.border,
            },
          ]}
          onPress={() => setLayoutMenuOpen(true)}
        >
          <IconSymbol
            name={layoutOptions.find(({ id }) => id === selectedLayout)!.icon}
            size={21}
            color={colors.tint}
          />
        </TouchableOpacity>
      </View>
      <Modal
        visible={layoutMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLayoutMenuOpen(false)}
      >
        <View style={styles.menuOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss reading layout"
            onPress={() => setLayoutMenuOpen(false)}
            style={styles.menuBackdrop}
          />
          <View
            accessibilityViewIsModal
            style={[
              styles.layoutMenu,
              {
                marginTop: insets.top + 66,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <ThemedText
              accessibilityRole="header"
              style={[styles.menuTitle, { color: colors.secondaryText }]}
            >
              Reading layout
            </ThemedText>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Reading layout"
            >
              {layoutOptions.map((option) => {
                const selected = selectedLayout === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    accessibilityRole="radio"
                    aria-checked={selected}
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={option.name}
                    onPress={() => selectLayout(option.id)}
                    style={[
                      styles.menuOption,
                      selected && { backgroundColor: colors.accentSoft },
                    ]}
                  >
                    <IconSymbol
                      name={option.icon}
                      size={21}
                      color={colors.tint}
                    />
                    <ThemedText style={styles.menuOptionText}>
                      {option.name}
                    </ThemedText>
                    {selected && (
                      <IconSymbol
                        name="checkmark"
                        size={18}
                        color={colors.tint}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <View
        style={[
          styles.readingArea,
          {
            flexDirection: sideBySide ? "row" : "column",
            gap: narrow ? 8 : 12,
            paddingHorizontal: narrow ? 10 : 16,
          },
        ]}
      >
        {sideBySide && secondaryVersion ? (
          <AlignedChapters
            key={`${primaryVersion}:${secondaryVersion}:${bookName}:${currentChapter}`}
            primary={{
              chapter: getPrimaryChapter(),
              versionId: primaryVersion,
              label: "Primary translation",
              onVersionChange: setPrimaryVersion,
              swapVersion: secondaryVersion,
              narrow,
              unavailableMessage: unavailableMessage(primaryVersion),
            }}
            secondary={{
              chapter: getSecondaryChapter(),
              versionId: secondaryVersion,
              label: "Comparison translation",
              onVersionChange: setSecondaryVersion,
              excludedVersion: primaryVersion,
              narrow,
              unavailableMessage: unavailableMessage(secondaryVersion),
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
                unavailableMessage={unavailableMessage(
                  secondaryOnly ? secondaryVersion! : primaryVersion,
                )}
              />
            </View>
            {comparing && secondaryVersion && (
              <View style={styles.pane}>
                <ChapterView
                  key={`${secondaryVersion}:${bookName}:${currentChapter}:${comparisonLayout}`}
                  chapter={getSecondaryChapter()}
                  versionId={secondaryVersion}
                  label="Comparison translation"
                  excludedVersion={primaryVersion}
                  onVersionChange={setSecondaryVersion}
                  narrow={false}
                  unavailableMessage={unavailableMessage(secondaryVersion)}
                />
              </View>
            )}
          </>
        )}
      </View>

      <View
        style={[
          styles.navigation,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Previous chapter"
          accessibilityState={{ disabled: previousChapter === undefined }}
          disabled={previousChapter === undefined}
          onPress={() =>
            previousChapter !== undefined && setCurrentChapter(previousChapter)
          }
          style={[
            styles.navButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: previousChapter === undefined ? 0.4 : 1,
            },
          ]}
        >
          <IconSymbol name="chevron.left" size={17} color={colors.text} />
          <ThemedText style={styles.navText}>Previous</ThemedText>
        </TouchableOpacity>
        <View style={styles.progress}>
          <ThemedText style={styles.progressNumbers}>
            {chapterIndex + 1}
            <ThemedText
              style={[styles.progressTotal, { color: colors.secondaryText }]}
            >
              {" "}
              / {chapters.length}
            </ThemedText>
          </ThemedText>
          <ThemedText
            style={[styles.progressLabel, { color: colors.secondaryText }]}
          >
            available chapters
          </ThemedText>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Next chapter"
          accessibilityState={{ disabled: nextChapter === undefined }}
          disabled={nextChapter === undefined}
          onPress={() =>
            nextChapter !== undefined && setCurrentChapter(nextChapter)
          }
          style={[
            styles.navButton,
            {
              backgroundColor: colors.tint,
              borderColor: colors.tint,
              opacity: nextChapter === undefined ? 0.4 : 1,
            },
          ]}
        >
          <ThemedText style={[styles.navText, { color: colors.onAccent }]}>
            Next
          </ThemedText>
          <IconSymbol name="chevron.right" size={17} color={colors.onAccent} />
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
}

function AlignedChapters({
  primary,
  secondary,
}: {
  primary: ReadingPane;
  secondary: ReadingPane;
}) {
  const colors = useAppTheme();
  const panes = [primary, secondary];
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
      <View style={styles.parallelRow}>
        {panes.map((pane) => (
          <View key={pane.label} style={styles.parallelColumn}>
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
        style={styles.versesContainer}
        contentContainerStyle={styles.parallelContent}
        showsVerticalScrollIndicator={false}
      >
        {numbers.map((number, rowIndex) => (
          <View
            key={number}
            testID={`parallel-verse-${number}`}
            style={styles.parallelRow}
          >
            {panes.map((pane, index) => (
              <View
                key={pane.label}
                testID={`parallel-${pane.versionId}-verse-${number}`}
                style={[
                  styles.parallelColumn,
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
      <View
        testID="parallel-divider"
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.parallelDivider, { borderLeftColor: colors.border }]}
      />
    </View>
  );
}

function VerseContent({ verse, narrow }: { verse: Verse; narrow: boolean }) {
  const colors = useAppTheme();
  return (
    <View style={[styles.verseRow, narrow && styles.narrowVerseRow]}>
      <ThemedText style={[styles.verseNumber, { color: colors.secondaryText }]}>
        {verse.verse}
      </ThemedText>
      <ThemedText
        style={[
          styles.verseText,
          narrow && styles.narrowVerseText,
          !verse.text.trim() && {
            fontFamily: undefined,
            fontSize: 12,
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
}: ReadingPane) {
  const colors = useAppTheme();
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
        style={styles.versesContainer}
        contentContainerStyle={[
          styles.versesContent,
          narrow && styles.narrowContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {chapter ? (
          chapter.verses.map((verse) => (
            <VerseContent key={verse.verse} verse={verse} narrow={narrow} />
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
  menuOverlay: { flex: 1, alignItems: "flex-end" },
  menuBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  layoutMenu: {
    width: 250,
    maxWidth: "90%",
    marginRight: 20,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 8,
    boxShadow: "0px 6px 24px rgba(0,0,0,0.15)",
  },
  menuTitle: { fontSize: 12, lineHeight: 20, padding: 10 },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  menuOptionText: { flex: 1, fontSize: 14, lineHeight: 22 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
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
  heading: { flex: 1, alignItems: "center", gap: 2 },
  eyebrow: {
    fontSize: 9,
    lineHeight: 15,
    letterSpacing: 1.7,
    fontWeight: "600",
  },
  bookTitle: { fontFamily: Fonts.serif, fontSize: 25, lineHeight: 32 },
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
  narrowVerseText: { fontSize: 16, lineHeight: 27 },
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
    paddingHorizontal: 20,
    paddingTop: 16,
    width: "100%",
    maxWidth: 1060,
    alignSelf: "center",
  },
  navButton: {
    borderRadius: 15,
    borderWidth: 1,
    minHeight: 46,
    minWidth: 89,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  navText: { fontSize: 12, lineHeight: 20, fontWeight: "600" },
  progress: { flex: 1, alignItems: "center", gap: 1 },
  progressNumbers: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  progressTotal: { fontSize: 13, lineHeight: 21, fontWeight: "400" },
  progressLabel: { fontSize: 9, lineHeight: 15, textAlign: "center" },
});
