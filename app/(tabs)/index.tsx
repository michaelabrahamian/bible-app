import { ContentNotice } from "@/components/content-notice";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useBible } from "@/contexts/bible-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const {
    getBooks,
    setCurrentBook,
    getCurrentBookName,
    currentChapter,
    primaryVersion,
    getVersions,
    getPrimaryChapter,
    getSecondaryChapter,
    secondaryVersion,
    showDualView,
    singlePane,
  } = useBible();
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const books = getBooks();
  const version = getVersions().find(({ id }) => id === primaryVersion);
  const filtered = books
    .map((book, index) => ({ book, index }))
    .filter(({ book }) =>
      book.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
    );
  const secondaryOnly =
    !showDualView && singlePane === "secondary" && secondaryVersion;
  const readingVersion = secondaryOnly
    ? getVersions().find(({ id }) => id === secondaryVersion)
    : version;
  const preview = (secondaryOnly ? getSecondaryChapter() : getPrimaryChapter())
    ?.verses[0]?.text;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandRow}>
          <View style={styles.brand}>
            <View
              style={[styles.emblem, { backgroundColor: colors.accentSoft }]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <ThemedText style={[styles.emblemLetter, { color: colors.tint }]}>
                Ա
              </ThemedText>
            </View>
            <View>
              <ThemedText type="title" style={styles.brandTitle}>
                The Bible
              </ThemedText>
              <ThemedText
                style={[styles.brandSubtitle, { color: colors.secondaryText }]}
              >
                Աստվածաշունչ
              </ThemedText>
            </View>
          </View>
          <View style={[styles.languagePill, { borderColor: colors.border }]}>
            <ThemedText
              style={[styles.languageText, { color: colors.secondaryText }]}
            >
              EN · ՀԱՅ
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.continueCard, { backgroundColor: colors.hero }]}
          accessibilityRole="button"
          accessibilityLabel={`Continue reading ${getCurrentBookName()} chapter ${currentChapter}`}
          onPress={() => router.push("/reader")}
        >
          <View style={styles.cardTop}>
            <ThemedText style={[styles.eyebrow, { color: colors.heroMuted }]}>
              CONTINUE READING
            </ThemedText>
            <IconSymbol name="book" size={21} color={colors.gold} />
          </View>
          <ThemedText style={[styles.passageTitle, { color: colors.heroText }]}>
            {getCurrentBookName()} {currentChapter}
          </ThemedText>
          {preview && (
            <ThemedText
              numberOfLines={2}
              style={[styles.preview, { color: colors.heroMuted }]}
            >
              {preview}
            </ThemedText>
          )}
          <View style={styles.cardBottom}>
            <ThemedText
              style={[styles.heroVersion, { color: colors.heroMuted }]}
            >
              {readingVersion?.name}
            </ThemedText>
            <View
              style={[
                styles.continueArrow,
                { backgroundColor: colors.heroText },
              ]}
            >
              <IconSymbol name="arrow.right" size={20} color={colors.hero} />
            </View>
          </View>
        </TouchableOpacity>

        {version?.notice && <ContentNotice text={version.notice} compact />}

        <View style={styles.sectionHeading}>
          <ThemedText style={styles.sectionTitle}>Your library</ThemedText>
          <ThemedText
            style={[styles.bookCount, { color: colors.secondaryText }]}
          >
            {query.trim() ? `${filtered.length} of ` : ""}
            {books.length} books
          </ThemedText>
        </View>
        <View
          style={[
            styles.search,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <IconSymbol
            name="magnifyingglass"
            size={20}
            color={colors.secondaryText}
          />
          <TextInput
            accessibilityLabel="Search books"
            placeholder="Find a book…"
            placeholderTextColor={colors.secondaryText}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            clearButtonMode="never"
            style={[styles.searchInput, { color: colors.text }]}
          />
          {query.length > 0 && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Clear book search"
              onPress={() => setQuery("")}
              style={styles.clearButton}
            >
              <IconSymbol name="xmark" size={18} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
        <View
          style={[
            styles.bookList,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {filtered.map(({ book, index }, row) => (
            <TouchableOpacity
              key={book.name}
              activeOpacity={0.65}
              accessibilityRole="button"
              accessibilityLabel={`Read ${book.name}, ${book.chapters.length} chapters`}
              style={[
                styles.bookRow,
                row > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: colors.border,
                },
              ]}
              onPress={() => {
                setCurrentBook(index);
                router.push("/reader");
              }}
            >
              <ThemedText
                style={[styles.bookNumber, { color: colors.secondaryText }]}
              >
                {String(index + 1).padStart(2, "0")}
              </ThemedText>
              <ThemedText style={styles.bookName}>{book.name}</ThemedText>
              <ThemedText
                style={[styles.chapterCount, { color: colors.secondaryText }]}
              >
                {book.chapters.length} ch.
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={17}
                color={colors.secondaryText}
              />
            </TouchableOpacity>
          ))}
          {filtered.length === 0 && (
            <View style={styles.emptySearch}>
              <ThemedText style={styles.emptyTitle}>No books found</ThemedText>
              <ThemedText style={{ color: colors.secondaryText }}>
                Try another book name.
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={[styles.footer, { color: colors.secondaryText }]}>
          A quiet space for the Word.
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    gap: 18,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  emblem: {
    width: 44,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  emblemLetter: { fontSize: 29, lineHeight: 36, fontFamily: Fonts.serif },
  brandTitle: { fontSize: 26, lineHeight: 32, letterSpacing: -0.8 },
  brandSubtitle: { fontSize: 12, lineHeight: 19, marginTop: 1 },
  languagePill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  languageText: {
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
  continueCard: { padding: 24, borderRadius: 25, gap: 15 },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "600",
    letterSpacing: 1.8,
  },
  passageTitle: {
    fontFamily: Fonts.serif,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.6,
  },
  preview: { fontFamily: Fonts.serif, fontSize: 16, lineHeight: 25 },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  heroVersion: { fontSize: 12, lineHeight: 18, flex: 1 },
  continueArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  bookCount: { fontSize: 12, lineHeight: 18 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 15,
    borderWidth: 1,
    paddingLeft: 15,
    paddingRight: 6,
    minHeight: 50,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 13, minWidth: 0 },
  clearButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  bookList: { borderWidth: 1, borderRadius: 20, overflow: "hidden" },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 17,
    paddingVertical: 20,
    minHeight: 72,
  },
  bookNumber: {
    fontSize: 11,
    lineHeight: 18,
    width: 20,
    fontVariant: ["tabular-nums"],
  },
  bookName: { fontFamily: Fonts.serif, fontSize: 21, lineHeight: 28, flex: 1 },
  chapterCount: { fontSize: 12, lineHeight: 18 },
  emptySearch: { padding: 24, gap: 5 },
  emptyTitle: { fontWeight: "600" },
  footer: {
    textAlign: "center",
    fontFamily: Fonts.serif,
    fontStyle: "italic",
    fontSize: 14,
    marginTop: 6,
  },
});
