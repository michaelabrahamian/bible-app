#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { auditBible } = require("./lib/bible-data-audit");
const codes =
  "GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SOL ISA JER LAM EZE DAN HOS JOE AMO OBA JON MIC NAH HAB ZEP HAG ZEC MAL MAT MAR LUK JOH ACT ROM 1CO 2CO GAL EPH PHI COL 1TH 2TH 1TI 2TI TIT PHM HEB JAM 1PE 2PE 1JO 2JO 3JO JUD REV".split(
    " ",
  );
// Normalize book names to the reader's existing English identifiers only.
const names = require("../data/KJV.json").books.map(({ name }) => name);

function parseWebVpl(input) {
  const books = new Map();
  const identities = new Set();
  input
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .forEach((line, index) => {
      if (!line) return;
      const match = /^([A-Z0-9]{3}) ([1-9]\d*):([1-9]\d*) (.*)$/.exec(line);
      if (!match || !codes.includes(match[1]))
        throw new Error(`Invalid source reference at line ${index + 1}`);
      const [, code, chapterNumber, verseNumber, text] = match;
      const identity = `${code} ${chapterNumber}:${verseNumber}`;
      if (identities.has(identity))
        throw new Error(`Duplicate source reference: ${identity}`);
      identities.add(identity);
      if (!books.has(code)) books.set(code, new Map());
      const chapters = books.get(code);
      const chapter = Number(chapterNumber);
      if (!chapters.has(chapter)) chapters.set(chapter, []);
      // Keep the publisher's numbers and exact verse text, including blank entries.
      chapters.get(chapter).push({ verse: Number(verseNumber), text });
    });
  return {
    translation: "World English Bible British Edition (66-book edition)",
    books: codes
      .filter((code) => books.has(code))
      .map((code) => ({
        name: names[codes.indexOf(code)],
        chapters: [...books.get(code)]
          .sort(([a], [b]) => a - b)
          .map(([chapter, verses]) => ({ chapter, verses })),
      })),
  };
}

if (require.main === module) {
  try {
    const [input, output] = process.argv.slice(2);
    if (!input || !output)
      throw new Error(
        "Usage: node scripts/import-web-vpl.js INPUT_vpl.txt OUTPUT.json",
      );
    const data = parseWebVpl(fs.readFileSync(path.resolve(input), "utf8"));
    const result = auditBible(data, { allowEmptyVerses: true });
    if (
      data.books.length !== 66 ||
      data.books.some((book) =>
        book.chapters.some(
          (chapter) => !chapter.verses.some(({ text }) => text.trim()),
        ),
      ) ||
      result.issues.length
    ) {
      throw new Error(
        `Source validation failed; output was not written. ${result.issues.join("; ")}`,
      );
    }
    fs.writeFileSync(
      path.resolve(output),
      JSON.stringify(data, null, 2) + "\n",
    );
    console.log(
      `Imported ${result.stats.populatedBooks} books, ${result.stats.chapters} chapters, ${result.stats.verses} nonempty verses, ${result.stats.emptyVerses} publisher blank entries.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { parseWebVpl };
