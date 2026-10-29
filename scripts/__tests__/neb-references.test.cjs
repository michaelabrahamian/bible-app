/* global __dirname */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const references = require("../../data/NEB-REFERENCES.json");
const source = require("../../data/NEB.json");

test("NEB reference corrections are bound to the exact reviewed source snapshot", () => {
  const bytes = fs.readFileSync(path.join(__dirname, "../../data/NEB.json"));
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    references.sourceFileSha256,
  );
});

test("NEB correction tables cover complete source chapters with distinct increasing verse IDs", () => {
  const sourceBooks = { Matthew: "mt", Mark: "mc" };
  const identities = new Set();
  for (const record of references.chapters) {
    const key = `${record.book}:${record.chapter}`;
    assert(!identities.has(key));
    identities.add(key);
    const chapter = source.find(
      ({ abbrev }) => abbrev === sourceBooks[record.book],
    ).chapters[record.chapter - 1];
    assert.equal(record.sourceEntryCount, chapter.length);
    assert.equal(record.verseNumbers.length, chapter.length);
    assert(
      record.verseNumbers.every(
        (number, index, numbers) =>
          Number.isInteger(number) && number > (numbers[index - 1] ?? 0),
      ),
    );
    assert(record.referenceUrl.startsWith("https://www.bible.com/bible/2860/"));
  }
});
