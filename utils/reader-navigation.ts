import type { Book } from "@/services/bible-service";

export interface Passage {
  bookName: string;
  chapter: number;
}

export function getAdjacentPassage(
  books: Book[],
  bookName: string,
  chapter: number,
  direction: -1 | 1,
): Passage | undefined {
  const bookIndex = books.findIndex((book) => book.name === bookName);
  if (bookIndex < 0) return;
  const numbers = (book: Book) =>
    [...new Set(book.chapters.map((entry) => entry.chapter))].sort(
      (a, b) => a - b,
    );
  const chapters = numbers(books[bookIndex]);
  const index = chapters.indexOf(chapter);
  if (index < 0) return;
  const adjacent = chapters[index + direction];
  if (adjacent !== undefined) return { bookName, chapter: adjacent };

  for (
    let next = bookIndex + direction;
    next >= 0 && next < books.length;
    next += direction
  ) {
    const available = numbers(books[next]);
    if (available.length)
      return {
        bookName: books[next].name,
        chapter:
          direction === 1 ? available[0] : available[available.length - 1],
      };
  }
}
