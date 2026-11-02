import { ReaderSheet } from "@/components/reader-sheet";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { Book } from "@/services/bible-service";
import { useRef, useState, type ComponentRef } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

export function PassagePicker({
  books,
  currentBookName,
  currentChapter,
  onSelect,
  onClose,
}: {
  books: Book[];
  currentBookName: string;
  currentChapter: number;
  onSelect: (bookName: string, chapter: number) => void;
  onClose: () => void;
}) {
  const colors = useAppTheme();
  const { width, fontScale } = useWindowDimensions();
  const chapterList = useRef<ComponentRef<typeof ScrollView>>(null);
  const contentWidth = Math.min(width, 560) - 40;
  const columns = Math.max(
    2,
    Math.min(6, Math.floor((contentWidth + 8) / (48 * fontScale + 8))),
  );
  const chapterWidth = Math.floor((contentWidth - (columns - 1) * 8) / columns);
  const [bookName, setBookName] = useState(currentBookName);
  const [choosingBook, setChoosingBook] = useState(false);
  const [query, setQuery] = useState("");
  const selectedBook = books.find((book) => book.name === bookName) ?? books[0];
  const chapters = [
    ...new Set(selectedBook?.chapters.map(({ chapter }) => chapter) ?? []),
  ].sort((a, b) => a - b);
  const filteredBooks = books.filter((book) =>
    book.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  return (
    <ReaderSheet
      title="Go to passage"
      closeLabel="Close passage picker"
      dismissLabel="Dismiss passage picker"
      onClose={onClose}
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={
          choosingBook
            ? "Back to chapters"
            : `Choose book: ${selectedBook?.name}`
        }
        onPress={() => {
          setQuery("");
          setChoosingBook(!choosingBook);
        }}
        style={[
          styles.bookChoice,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <IconSymbol name="book" size={20} color={colors.tint} />
        <ThemedText numberOfLines={1} style={styles.bookName}>
          {selectedBook?.name}
        </ThemedText>
        <IconSymbol
          name={choosingBook ? "chevron.left" : "chevron.down"}
          size={18}
          color={colors.secondaryText}
        />
      </TouchableOpacity>
      {choosingBook ? (
        <>
          <TextInput
            accessibilityLabel="Search books"
            placeholder="Find a book"
            placeholderTextColor={colors.secondaryText}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            style={[
              styles.search,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.books}
          >
            {!filteredBooks.length && (
              <ThemedText style={styles.empty}>No matching books</ThemedText>
            )}
            {filteredBooks.map((book) => (
              <TouchableOpacity
                key={book.name}
                accessibilityRole="button"
                accessibilityLabel={`Choose ${book.name}`}
                accessibilityState={{
                  selected: book.name === selectedBook?.name,
                }}
                onPress={() => {
                  setBookName(book.name);
                  setChoosingBook(false);
                  setQuery("");
                }}
                style={[
                  styles.book,
                  book.name === selectedBook?.name && {
                    backgroundColor: colors.accentSoft,
                  },
                ]}
              >
                <ThemedText style={styles.bookName}>{book.name}</ThemedText>
                <IconSymbol
                  name="chevron.right"
                  size={18}
                  color={colors.tint}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : (
        <>
          <ThemedText style={[styles.hint, { color: colors.secondaryText }]}>
            Choose a chapter
          </ThemedText>
          <ScrollView
            key={selectedBook?.name}
            ref={chapterList}
            contentContainerStyle={styles.chapters}
          >
            {chapters.map((chapter) => {
              const selected =
                selectedBook.name === currentBookName &&
                chapter === currentChapter;
              return (
                <TouchableOpacity
                  key={chapter}
                  accessibilityRole="button"
                  accessibilityLabel={`${selectedBook.name} chapter ${chapter}`}
                  accessibilityState={{ selected }}
                  onLayout={
                    selected
                      ? ({ nativeEvent: { layout } }) => {
                          chapterList.current?.scrollTo({
                            y: Math.max(0, layout.y - 56),
                            animated: false,
                          });
                        }
                      : undefined
                  }
                  onPress={() => onSelect(selectedBook.name, chapter)}
                  style={[
                    styles.chapter,
                    {
                      width: chapterWidth,
                      backgroundColor: selected ? colors.tint : colors.surface,
                      borderColor: selected ? colors.tint : colors.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.chapterNumber,
                      { color: selected ? colors.onAccent : colors.text },
                    ]}
                  >
                    {chapter}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}
    </ReaderSheet>
  );
}

const styles = StyleSheet.create({
  bookChoice: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
  },
  bookName: { flex: 1, fontSize: 16, lineHeight: 24, fontWeight: "600" },
  hint: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 20,
  },
  chapters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  chapter: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  chapterNumber: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  search: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  books: { paddingHorizontal: 12, paddingBottom: 16 },
  book: {
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
  },
  empty: { padding: 20, textAlign: "center" },
});
