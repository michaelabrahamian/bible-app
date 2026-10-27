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

// Upstream ArmEastern contains empty placeholders for unavailable text.
// Keep those intact in the source file, but only offer readable content.
const armenianBible: BibleData = {
  translation: armenianData.translation,
  books: (armenianData as BibleData).books
    .map((book) => ({
      ...book,
      chapters: book.chapters
        .map((chapter) => ({
          ...chapter,
          verses: chapter.verses.filter(({ text }) => text.trim()),
        }))
        .filter(({ verses }) => verses.length > 0),
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
}

export const AVAILABLE_VERSIONS: BibleVersion[] = [
  { id: "kjv", name: "King James Version", language: "English" },
  { id: "armenian", name: "Eastern Armenian (partial)", language: "Հայերեն" },
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
