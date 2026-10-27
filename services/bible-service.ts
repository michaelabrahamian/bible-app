/**
 * Simplified Bible Service
 *
 * Directly loads bundled Bible data without any abstraction layers.
 * Supports KJV and the publicly distributed, partial Eastern Armenian text.
 */

import armenianData from "@/data/ArmEastern.json";
import kjvData from "@/data/KJV.json";

export interface Verse {
  verse: number;
  text: string;
}

export interface Chapter {
  chapter: number;
  verses: Verse[];
}

export interface Book {
  name: string;
  chapters: Chapter[];
}

export interface BibleData {
  translation: string;
  books: Book[];
}

// Partly populated ArmEastern chapters can have shifted verse references
// (for example Luke 1). Withhold the entire chapter instead of dropping blanks
// and presenting the remaining references as reliable. Keep source files intact.
function isReadableArmenianChapter(chapter: Chapter): boolean {
  return (
    chapter.verses.length > 0 && chapter.verses.every(({ text }) => text.trim())
  );
}

const armenianBible: BibleData = {
  translation: armenianData.translation,
  books: (armenianData as BibleData).books
    .map((book) => ({
      ...book,
      chapters: book.chapters.filter(isReadableArmenianChapter),
    }))
    .filter(({ chapters }) => chapters.length > 0),
};

// Available Bibles
const BIBLES: Record<string, BibleData> = {
  kjv: kjvData as BibleData,
  armenian: armenianBible,
};

export interface BibleVersion {
  id: string;
  name: string;
  language: string;
  notice?: string;
}

export const AVAILABLE_VERSIONS: BibleVersion[] = [
  { id: "kjv", name: "King James Version", language: "English" },
  {
    id: "armenian",
    name: "Eastern Armenian (partial)",
    language: "Հայերեն",
    notice:
      "Genesis, Exodus and the four Gospels only. 17 chapters are withheld because text is missing and verse references may be incorrect. The remaining text has not been independently verified.",
  },
];

export function getVersions(): BibleVersion[] {
  return AVAILABLE_VERSIONS;
}

export function getBooks(versionId: string): Book[] {
  const bible = BIBLES[versionId];
  if (!bible) {
    throw new Error(`Version ${versionId} not found`);
  }
  return bible.books;
}

export function getChapter(
  versionId: string,
  bookIndex: number,
  chapterNumber: number,
): Chapter | null {
  const bible = BIBLES[versionId];
  if (!bible) return null;

  const book = bible.books[bookIndex];
  if (!book) return null;

  const chapter = book.chapters.find((c) => c.chapter === chapterNumber);
  return chapter || null;
}

export function getChapterByName(
  versionId: string,
  bookName: string,
  chapterNumber: number,
): Chapter | null {
  const bible = BIBLES[versionId];
  if (!bible) return null;

  const book = bible.books.find((b) => b.name === bookName);
  if (!book) return null;

  const chapter = book.chapters.find((c) => c.chapter === chapterNumber);
  return chapter || null;
}

export type ChapterAvailability = "available" | "missing" | "withheld";

export function getChapterAvailability(
  versionId: string,
  bookName: string,
  chapterNumber: number,
): ChapterAvailability {
  if (getChapterByName(versionId, bookName, chapterNumber)) return "available";
  if (versionId === "armenian") {
    const sourceChapter = (armenianData as BibleData).books
      .find(({ name }) => name === bookName)
      ?.chapters.find(({ chapter }) => chapter === chapterNumber);
    if (sourceChapter?.verses.some(({ text }) => text.trim()))
      return "withheld";
  }
  return "missing";
}

export function getBookName(versionId: string, bookIndex: number): string {
  const bible = BIBLES[versionId];
  return bible?.books[bookIndex]?.name || "";
}

export function getChapterNumbers(
  versionId: string,
  bookIndex: number,
): number[] {
  const chapters = BIBLES[versionId]?.books[bookIndex]?.chapters ?? [];
  return [...new Set(chapters.map(({ chapter }) => chapter))].sort(
    (a, b) => a - b,
  );
}
