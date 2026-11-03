const fs = require('node:fs');
const path = require('node:path');

// Derive the extension's small offline catalogue from the same pinned texts as
// the reader. No downloads or separate edits to verse text during native builds.
function buildDailyVerseCatalog(projectRoot) {
  const read = (file) => JSON.parse(fs.readFileSync(path.join(projectRoot, 'data', file), 'utf8'));
  const references = read('daily-verse-references.json');
  const armenian = read('NEB.json');
  const english = read('KJV.json');
  const overrides = read('NEB-REFERENCES.json');
  const verses = references.references.map(({ book, armenianSource, armenianBookLabel, chapter, verse }) => {
    const source = armenian.find(({ abbrev }) => abbrev === armenianSource)?.chapters[chapter - 1];
    const correction = overrides.chapters.find((entry) => entry.book === book && entry.chapter === chapter);
    const index = correction ? correction.verseNumbers.indexOf(verse) : verse - 1;
    if (correction && correction.sourceEntryCount !== source?.length) {
      throw new Error(`Daily verse references changed: ${book} ${chapter}:${verse}`);
    }
    const armenianText = source?.[index];
    const englishText = english.books.find((entry) => entry.name === book)?.chapters
      .find((entry) => entry.chapter === chapter)?.verses.find((entry) => entry.verse === verse)?.text;
    if (!armenianText?.trim() || !englishText?.trim()) {
      throw new Error(`Missing daily verse: ${book} ${chapter}:${verse}`);
    }
    if (armenianText.length > 90 || englishText.length > 100) {
      throw new Error(`Daily verse is too long for the small widget: ${book} ${chapter}:${verse}`);
    }
    return {
      book, chapter, verse,
      reference: `${book} ${chapter}:${verse}`,
      armenianReference: `${armenianBookLabel} ${chapter}․${verse}`,
      armenianText, englishText,
      url: `bibleapp://bible?book=${encodeURIComponent(book)}&chapter=${chapter}&verse=${verse}`,
    };
  });
  if (!verses.length || new Set(verses.map(({ reference }) => reference)).size !== verses.length) {
    throw new Error('Daily verse references must be nonempty and unique');
  }
  return { epoch: references.epoch, verses };
}

module.exports = { buildDailyVerseCatalog };
