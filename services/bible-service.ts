/**
 * Simplified Bible Service
 *
 * Directly loads bundled Bible data without any abstraction layers.
 * Supports KJV, WEB and the incomplete New Etchmiadzin GitHub edition.
 */

import nebData from "@/data/NEB.json";
import kjvData from "@/data/KJV.json";
import webData from "@/data/WEB.json";

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

// Explicit identities prevent the two missing OT books from shifting comparisons.
// Preserve source strings and array positions; the source has no explicit verse IDs.
const nebBookNames: Record<string, string> = {
  gn: "Genesis",
  ex: "Exodus",
  lv: "Leviticus",
  nm: "Numbers",
  dt: "Deuteronomy",
  js: "Joshua",
  jz: "Judges",
  rt: "Ruth",
  "1sm": "I Samuel",
  "2sm": "II Samuel",
  "1rs": "I Kings",
  "2rs": "II Kings",
  "1cr": "I Chronicles",
  "2cr": "II Chronicles",
  ed: "Ezra",
  ne: "Nehemiah",
  jó: "Job",
  sl: "Psalms",
  pv: "Proverbs",
  ec: "Ecclesiastes",
  ct: "Song of Solomon",
  is: "Isaiah",
  jr: "Jeremiah",
  lm: "Lamentations",
  ez: "Ezekiel",
  os: "Hosea",
  jl: "Joel",
  am: "Amos",
  ob: "Obadiah",
  jn: "Jonah",
  mq: "Micah",
  na: "Nahum",
  hc: "Habakkuk",
  sf: "Zephaniah",
  ag: "Haggai",
  zc: "Zechariah",
  ml: "Malachi",
  mt: "Matthew",
  mc: "Mark",
  lc: "Luke",
  jo: "John",
  atos: "Acts",
  rm: "Romans",
  "1co": "I Corinthians",
  "2co": "II Corinthians",
  gl: "Galatians",
  ef: "Ephesians",
  fp: "Philippians",
  cl: "Colossians",
  "1ts": "I Thessalonians",
  "2ts": "II Thessalonians",
  "1tm": "I Timothy",
  "2tm": "II Timothy",
  tt: "Titus",
  fm: "Philemon",
  hb: "Hebrews",
  tg: "James",
  "1pe": "I Peter",
  "2pe": "II Peter",
  "1jo": "I John",
  "2jo": "II John",
  "3jo": "III John",
  jd: "Jude",
  ap: "Revelation of John",
};
const nebBible: BibleData = {
  translation: "New Etchmiadzin Bible (incomplete GitHub edition)",
  // Psalms has only 149 chapter arrays with no explicit references. Do not guess
  // the missing chapter or present position-derived Psalm references as verified.
  books: nebData
    .filter(({ abbrev }) => abbrev !== "sl")
    .map((book) => ({
      name: nebBookNames[book.abbrev],
      chapters: book.chapters.map((verses, index) => ({
        chapter: index + 1,
        verses: verses.map((text, index) => ({ verse: index + 1, text })),
      })),
    })),
};

// Available Bibles
const BIBLES: Record<string, BibleData> = {
  kjv: kjvData as BibleData,
  neb: nebBible,
  web: webData as BibleData,
};

export interface BibleVersion {
  id: string;
  name: string;
  language: string;
  abbreviation: string;
  description?: string;
  notice?: string;
}

export const AVAILABLE_VERSIONS: BibleVersion[] = [
  {
    id: "kjv",
    name: "King James Version",
    abbreviation: "KJV",
    language: "English",
    description: "Traditional English · 66 books",
  },
  {
    id: "web",
    name: "World English Bible",
    abbreviation: "WEB",
    language: "English",
    description: "Modern English · British spelling · 66 books",
  },
  {
    id: "neb",
    name: "New Etchmiadzin Bible",
    language: "Հայերեն",
    abbreviation: "ՆԷ",
    description: "Eastern Armenian · incomplete GitHub edition",
    notice:
      "This copy has all 27 New Testament books, but lacks Esther, Daniel and the additional books of the publisher's edition. Psalms is withheld because its chapter references are uncertain. Other chapter and verse numbers follow source array positions and may differ from English editions. Edition identity, textual accuracy and redistribution rights remain unverified.",
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
  if (versionId === "neb" && bookName === "Psalms") return "withheld";
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
