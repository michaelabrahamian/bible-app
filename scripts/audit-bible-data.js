#!/usr/bin/env node
/* global __dirname */
const fs = require("node:fs");
const path = require("node:path");
const { auditBible } = require("./lib/bible-data-audit");

const requested = process.argv.slice(2);
const files = requested.length
  ? requested
  : ["data/KJV.json", "data/ArmEastern.json"];
let failed = false;
for (const file of files) {
  try {
    const data = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "..", file), "utf8"),
    );
    const { stats, issues } = auditBible(data, {
      allowEmptyVerses: path.basename(file) === "ArmEastern.json",
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
