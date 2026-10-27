const { test } = require("node:test");
const assert = require("node:assert/strict");
const { auditBible } = require("../lib/bible-data-audit");

const bible = (chapters) => ({
  translation: "Fixture",
  books: [{ name: "Exodus", chapters }],
});
const chapter = (number, text = "Verse") => ({
  chapter: number,
  verses: [{ verse: 1, text }],
});

test("reports a missing first chapter rather than accepting book counts", () => {
  assert.match(
    auditBible(bible([chapter(2), chapter(3)])).issues.join("\n"),
    /missing chapter numbers 1/,
  );
});

test("reports duplicate chapters from merged books", () => {
  const result = auditBible(bible([chapter(1), chapter(2), chapter(1)]));
  assert.match(result.issues.join("\n"), /duplicate chapter/);
});

test("reports notes appended as repeated verse numbers", () => {
  const entry = chapter(1);
  entry.verses.push({
    verse: 1,
    text: "A footnote incorrectly parsed as a verse",
  });
  assert.match(auditBible(bible([entry])).issues.join("\n"), /duplicate verse/);
});

test("counts explicitly permitted empty slots separately from available text", () => {
  const result = auditBible(bible([chapter(1, "")]), {
    allowEmptyVerses: true,
  });
  assert.equal(result.stats.populatedBooks, 0);
  assert.equal(result.stats.verses, 0);
  assert.equal(result.stats.emptyVerses, 1);
  assert.deepEqual(result.issues, []);
});

test("accepts a well formed partial edition without assuming a 66-book canon", () => {
  assert.deepEqual(auditBible(bible([chapter(1)])).issues, []);
});

test("reports malformed data without treating it as a complete edition", () => {
  assert.ok(auditBible({}).issues.length);
  assert.ok(auditBible(bible([null])).issues.length);
});
