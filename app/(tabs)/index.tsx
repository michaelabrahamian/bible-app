/**
 * Home Screen - Book List
 *
 * Simple list of all Bible books
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useBible } from "@/contexts/bible-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  const {
    getBooks,
    setCurrentBook,
    getCurrentBookName,
    currentChapter,
    primaryVersion,
  } = useBible();
  const borderColor = useThemeColor({}, "tabIconDefault");
  const tintColor = useThemeColor({}, "tint");

  const books = getBooks();

  const handleBookSelect = (bookIndex: number) => {
    setCurrentBook(bookIndex);
    router.push("/reader");
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Bible</ThemedText>
        <ThemedText style={styles.subtitle}>
          {books.length} Books Available
        </ThemedText>
        {primaryVersion === "armenian" && (
          <ThemedText style={styles.subtitle}>
            Genesis, Exodus, Matthew, Mark, Luke and John only.
          </ThemedText>
        )}
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[styles.bookCard, { borderColor }]}
          accessibilityRole="button"
          accessibilityLabel={`Continue reading ${getCurrentBookName()} chapter ${currentChapter}`}
          onPress={() => router.push("/reader")}
        >
          <IconSymbol name="book.fill" size={32} color={tintColor} />
          <ThemedView style={styles.bookInfo}>
            <ThemedText type="defaultSemiBold" style={styles.bookName}>
              Continue reading
            </ThemedText>
            <ThemedText style={styles.bookDetails}>
              {getCurrentBookName()} {currentChapter}
            </ThemedText>
          </ThemedView>
          <IconSymbol name="chevron.right" size={20} color={borderColor} />
        </TouchableOpacity>
        {books.map((book, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.bookCard, { borderColor }]}
            onPress={() => handleBookSelect(index)}
          >
            <IconSymbol name="book" size={32} color={tintColor} />
            <ThemedView style={styles.bookInfo}>
              <ThemedText type="defaultSemiBold" style={styles.bookName}>
                {book.name}
              </ThemedText>
              <ThemedText style={styles.bookDetails}>
                {book.chapters.length}{" "}
                {book.chapters.length === 1 ? "chapter" : "chapters"}
              </ThemedText>
            </ThemedView>
            <IconSymbol name="chevron.right" size={20} color={borderColor} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  bookCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
  },
  bookName: {
    fontSize: 18,
    marginBottom: 4,
  },
  bookDetails: {
    fontSize: 14,
    opacity: 0.6,
  },
});
