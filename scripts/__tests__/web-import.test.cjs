const { test } = require("node:test");
const assert = require("node:assert/strict");
const { parseWebVpl } = require("../import-web-vpl");

test("preserves publisher references, Unicode, poetry, and blank verse entries without renumbering", () => {
  const result = parseWebVpl(
    "LUK 1:46 Mary said, “My soul magnifies the Lord.”\nLUK 1:56 Mary stayed.\nACT 8:37 \n",
  );
  assert.deepEqual(result.books[0].chapters[0].verses, [
    { verse: 46, text: "Mary said, “My soul magnifies the Lord.”" },
    { verse: 56, text: "Mary stayed." },
  ]);
  assert.deepEqual(result.books[1].chapters[0].verses, [
    { verse: 37, text: "" },
  ]);
});

test("rejects duplicate source references rather than overwriting or renumbering", () => {
  assert.throws(
    () => parseWebVpl("GEN 1:1 First\nGEN 1:1 Duplicate\n"),
    /Duplicate source reference/,
  );
});

test("rejects unsupported book codes and malformed verse references", () => {
  assert.throws(
    () => parseWebVpl("XYZ 1:1 Unknown\n"),
    /Invalid source reference/,
  );
  assert.throws(
    () => parseWebVpl("GEN 1:1-2 Merged verses\n"),
    /Invalid source reference/,
  );
});
