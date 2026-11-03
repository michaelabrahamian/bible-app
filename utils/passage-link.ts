import type { Book } from "@/services/bible-service";

type Parameter = string | string[] | undefined;
export type PassageLinkParameters = {
  book?: Parameter;
  chapter?: Parameter;
  verse?: Parameter;
};

const positiveInteger = (value: Parameter) =>
  typeof value === "string" && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value))
    ? Number(value)
    : undefined;

export function resolvePassageLink(params: PassageLinkParameters, books: Book[]) {
  if (typeof params.book !== "string") return null;
  const book = books.find(({ name }) => name === params.book);
  if (!book) return null;
  const chapterNumber = params.chapter === undefined
    ? [...book.chapters].sort((a, b) => a.chapter - b.chapter)[0]?.chapter
    : positiveInteger(params.chapter);
  const chapter = book.chapters.find((entry) => entry.chapter === chapterNumber);
  if (!chapter) return null;
  const verse = params.verse === undefined ? undefined : positiveInteger(params.verse);
  if (params.verse !== undefined && (!verse || !chapter.verses.some((entry) => entry.verse === verse))) return null;
  return { book: book.name, chapter: chapter.chapter, verse };
}
