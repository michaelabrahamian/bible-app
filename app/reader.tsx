/**
 * Bible Reader Screen
 *
 * Displays Bible chapters with optional dual-view for comparing versions
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useBible } from "@/contexts/bible-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { Chapter } from "@/services/bible-service";
import { Stack } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

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
    getVersions,
    getChapterNumbers,
  } = useBible();

  const tintColor = useThemeColor({}, "tint");

  const primaryChapter = getPrimaryChapter();
  const secondaryChapter = showDualView ? getSecondaryChapter() : null;

  const versions = getVersions();
  const primaryVersionName =
    versions.find((v) => v.id === primaryVersion)?.name || "Bible";
  const secondaryVersionName = secondaryVersion
    ? versions.find((v) => v.id === secondaryVersion)?.name
    : null;

  const bookName = getCurrentBookName();
  const chapters = getChapterNumbers();
  const chapterIndex = chapters.indexOf(currentChapter);
  const previousChapter = chapters[chapterIndex - 1];
  const nextChapter = chapters[chapterIndex + 1];
  const totalChapters = chapters.length;

  const goToPreviousChapter = () => {
    if (previousChapter !== undefined) setCurrentChapter(previousChapter);
  };

  const goToNextChapter = () => {
    if (nextChapter !== undefined) setCurrentChapter(nextChapter);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `${bookName} ${currentChapter}`,
          headerRight: () => (
            <TouchableOpacity
              onPress={toggleDualView}
              accessibilityRole="button"
              accessibilityLabel={
                showDualView ? "Show one translation" : "Compare translations"
              }
              style={styles.headerButton}
            >
              <IconSymbol
                name={showDualView ? "square.split.2x1" : "square"}
                size={24}
                color={tintColor}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ThemedView style={styles.container}>
        {showDualView && secondaryChapter ? (
          <View style={styles.dualViewContainer}>
            <View style={styles.halfView}>
              <ChapterView
                chapter={primaryChapter}
                versionName={primaryVersionName}
              />
            </View>
            <View
              style={[styles.divider, { backgroundColor: tintColor + "30" }]}
            />
            <View style={styles.halfView}>
              <ChapterView
                chapter={secondaryChapter}
                versionName={secondaryVersionName || ""}
              />
            </View>
          </View>
        ) : (
          <View style={styles.fullView}>
            <ChapterView
              chapter={primaryChapter}
              versionName={primaryVersionName}
            />
          </View>
        )}

        {/* Chapter Navigation */}
        <View style={styles.navigationBar}>
          <TouchableOpacity
            style={[
              styles.navButton,
              previousChapter === undefined && styles.navButtonDisabled,
            ]}
            onPress={goToPreviousChapter}
            disabled={previousChapter === undefined}
            accessibilityRole="button"
          >
            <IconSymbol
              name="chevron.left"
              size={24}
              color={previousChapter === undefined ? "#ccc" : tintColor}
            />
            <ThemedText
              style={[
                styles.navButtonText,
                previousChapter === undefined && styles.navButtonTextDisabled,
              ]}
            >
              Previous
            </ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.chapterIndicator}>
            Chapter {currentChapter} · {chapterIndex + 1}/{totalChapters}
          </ThemedText>

          <TouchableOpacity
            style={[
              styles.navButton,
              nextChapter === undefined && styles.navButtonDisabled,
            ]}
            onPress={goToNextChapter}
            disabled={nextChapter === undefined}
            accessibilityRole="button"
          >
            <ThemedText
              style={[
                styles.navButtonText,
                nextChapter === undefined && styles.navButtonTextDisabled,
              ]}
            >
              Next
            </ThemedText>
            <IconSymbol
              name="chevron.right"
              size={24}
              color={nextChapter === undefined ? "#ccc" : tintColor}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </>
  );
}

function ChapterView({
  chapter,
  versionName,
}: {
  chapter: Chapter | null;
  versionName: string;
}) {
  const borderColor = useThemeColor({}, "tabIconDefault");

  if (!chapter) {
    return (
      <ThemedView style={styles.chapterContainer}>
        <ThemedText style={styles.noContent}>Chapter not available</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.chapterContainer}>
      <ThemedText type="subtitle" style={styles.versionLabel}>
        {versionName}
      </ThemedText>
      <ScrollView
        style={styles.versesContainer}
        showsVerticalScrollIndicator={false}
      >
        {chapter.verses.map((verse, index) => (
          <View
            key={`${verse.verse}-${index}`}
            style={[styles.verseRow, { borderColor }]}
          >
            <ThemedText style={styles.verseNumber}>{verse.verse}</ThemedText>
            <ThemedText style={styles.verseText}>{verse.text}</ThemedText>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dualViewContainer: {
    flex: 1,
    flexDirection: "row",
  },
  halfView: {
    flex: 1,
  },
  fullView: {
    flex: 1,
  },
  divider: {
    width: 2,
  },
  headerButton: {
    padding: 8,
  },
  chapterContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  versionLabel: {
    marginTop: 12,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  versesContainer: {
    flex: 1,
  },
  verseRow: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 12,
    marginTop: 2,
    minWidth: 24,
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  noContent: {
    textAlign: "center",
    opacity: 0.5,
    marginTop: 40,
  },
  navigationBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  navButtonTextDisabled: {
    opacity: 0.3,
  },
  chapterIndicator: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.7,
  },
});
