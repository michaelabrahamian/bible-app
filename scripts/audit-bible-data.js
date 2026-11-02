#!/usr/bin/env node
/* global __dirname */
const fs = require("node:fs");
const path = require("node:path");
const { auditBible } = require("./lib/bible-data-audit");

const requested = process.argv.slice(2);
const files = requested.length
  ? requested
  : ["data/KJV.json", "data/NEB.json", "data/WEB.json"];
let failed = false;
for (const file of files) {
  try {
    let data = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "..", file), "utf8"),
    );
    if (path.basename(file) === "NEB.json") {
      data = {
        translation: "New Etchmiadzin source arrays",
        books: data.map((book) => ({
          name: book.abbrev,
          chapters: book.chapters.map((verses, index) => ({
            chapter: index + 1,
            verses: verses.map((text, index) => ({ verse: index + 1, text })),
          })),
        })),
      };
    }
    const { stats, issues } = auditBible(data, {
      allowEmptyVerses: path.basename(file) === "WEB.json",
    });
    console.log(
      `${file}: ${stats.populatedBooks}/${stats.books} populated books, ${stats.chapters} chapter entries, ${stats.verses} nonempty verse entries, ${stats.emptyVerses} empty slots`,
    );
    issues.forEach((issue) => console.error(`  ${issue}`));
    failed ||= issues.length > 0;
  } catch (error) {
    console.error(`${file}: ${error.message}`);
    failed = true;
  }
}
console.log(
  "Checks cover structure only. They do not verify canon completeness, verse alignment, textual accuracy, or licences.",
);
process.exitCode = failed ? 1 : 0;
