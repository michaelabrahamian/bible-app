import { expect, test } from "@jest/globals";
import { getDailyVerseReference, getVerseURL } from "@/utils/daily-verse";
import { resolvePassageLink } from "@/utils/passage-link";
import { getBooks, getChapterByName } from "@/services/bible-service";
import references from "@/data/daily-verse-references.json";

test("a local calendar day has one verse, advancing at the next local midnight", () => {
  const start = new Date(2026, 0, 1, 0, 0);
  const end = new Date(2026, 0, 1, 23, 59, 59);
  expect(getDailyVerseReference(start)).toEqual(getDailyVerseReference(end));
  expect(getDailyVerseReference(start)).toEqual({ book: "I Thessalonians", chapter: 5, verse: 16 });
  expect(getDailyVerseReference(new Date(2026, 0, 2))).toEqual({ book: "I Thessalonians", chapter: 5, verse: 17 });
});

test("calendar selection wraps across years, leap days, and dates before its epoch", () => {
  const { book, chapter, verse } = references.references.at(-1)!;
  expect(getDailyVerseReference(new Date(2025, 11, 31))).toEqual({ book, chapter, verse });
  expect(getDailyVerseReference(new Date(2026, 0, 26))).toEqual(getDailyVerseReference(new Date(2026, 0, 1)));
  expect(getDailyVerseReference(new Date(2028, 1, 29))).not.toEqual(getDailyVerseReference(new Date(2028, 2, 1)));
  expect(() => getDailyVerseReference(new Date(NaN))).toThrow();
});

test("widget URLs resolve to the exact verse in every bundled navigation edition", () => {
  for (const ref of references.references) {
    const url = new URL(getVerseURL(ref));
    const params = Object.fromEntries(url.searchParams);
    for (const version of ["neb", "kjv", "web"]) {
      expect(resolvePassageLink(params, getBooks(version))).toEqual({ book: ref.book, chapter: ref.chapter, verse: ref.verse });
      expect(getChapterByName(version, ref.book, ref.chapter)!.verses.find(({ verse }) => verse === ref.verse)?.text.trim()).toBeTruthy();
    }
  }
});

test("book-only links remain compatible; malformed or unavailable passages do not navigate", () => {
  const books = getBooks("kjv");
  expect(resolvePassageLink({ book: "John" }, books)).toEqual({ book: "John", chapter: 1, verse: undefined });
  for (const params of [
    { book: "John", chapter: "3", verse: "999" },
    { book: "John", chapter: "99", verse: "1" },
    { book: "John", chapter: "3.2", verse: "1" },
    { book: "John", chapter: "3", verse: ["1", "2"] },
    { book: ["John", "Luke"], chapter: "3", verse: "1" },
    { book: "John", chapter: "3", verse: "9007199254740993" },
  ]) expect(resolvePassageLink(params, books)).toBeNull();
});
