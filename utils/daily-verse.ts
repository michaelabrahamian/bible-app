import references from "@/data/daily-verse-references.json";

export interface VerseReference {
  book: string;
  chapter: number;
  verse: number;
}

// A local calendar day, not elapsed hours: DST and timezone offsets must not
// change the verse partway through the day. Swift uses the same Gregorian epoch.
export function getDailyVerseReference(date = new Date()): VerseReference {
  const epoch = Date.parse(`${references.epoch}T00:00:00Z`);
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  if (!Number.isFinite(day)) throw new Error("Invalid daily verse date");
  const length = references.references.length;
  const index = ((Math.floor((day - epoch) / 86400000) % length) + length) % length;
  const { book, chapter, verse } = references.references[index];
  return { book, chapter, verse };
}

export function getVerseURL({ book, chapter, verse }: VerseReference) {
  return `bibleapp://bible?book=${encodeURIComponent(book)}&chapter=${chapter}&verse=${verse}`;
}
