/** Structural checks only: this does not establish textual accuracy or reuse rights. */
function auditBible(data, { allowEmptyVerses = false } = {}) {
  const issues = [];
  const stats = {
    books: 0,
    populatedBooks: 0,
    chapters: 0,
    verses: 0,
    emptyVerses: 0,
  };
  if (
    !data ||
    typeof data.translation !== "string" ||
    !Array.isArray(data.books) ||
    !data.books.length
  ) {
    return {
      stats,
      issues: ["Expected a translation name and a nonempty books array."],
    };
  }
  stats.books = data.books.length;
  const bookNames = new Set();
  for (const book of data.books) {
    if (
      !book ||
      typeof book.name !== "string" ||
      !Array.isArray(book.chapters) ||
      !book.chapters.length
    ) {
      issues.push(
        "Expected each book to have a name and nonempty chapters array.",
      );
      continue;
    }
    if (bookNames.has(book.name)) issues.push(`${book.name}: duplicate book.`);
    bookNames.add(book.name);
    const chapters = new Set();
    let populated = false;
    for (const chapter of book.chapters) {
      stats.chapters++;
      if (
        !chapter ||
        !Number.isInteger(chapter.chapter) ||
        chapter.chapter < 1 ||
        !Array.isArray(chapter.verses)
      ) {
        issues.push(`${book.name}: invalid chapter.`);
        continue;
      }
      const label = `${book.name} ${chapter.chapter}`;
      if (chapters.has(chapter.chapter))
        issues.push(`${label}: duplicate chapter.`);
      chapters.add(chapter.chapter);
      if (!chapter.verses.length) issues.push(`${label}: no verse entries.`);
      const verses = new Set();
      let duplicateVerses = 0;
      for (const verse of chapter.verses) {
        if (
          !verse ||
          !Number.isInteger(verse.verse) ||
          verse.verse < 1 ||
          typeof verse.text !== "string"
        ) {
          issues.push(`${label}: invalid verse.`);
          continue;
        }
        if (verses.has(verse.verse)) duplicateVerses++;
        verses.add(verse.verse);
        if (verse.text.trim()) {
          stats.verses++;
          populated = true;
        } else {
          stats.emptyVerses++;
          if (!allowEmptyVerses)
            issues.push(`${label}:${verse.verse}: empty text.`);
        }
      }
      if (duplicateVerses)
        issues.push(`${label}: ${duplicateVerses} duplicate verse entries.`);
    }
    if (populated) stats.populatedBooks++;
    const highest = Math.max(...chapters);
    const missing = [];
    // Bound malformed chapter IDs instead of looping over untrusted input indefinitely.
    if (highest > 1000)
      issues.push(`${book.name}: chapter number exceeds supported range.`);
    else
      for (let chapter = 1; chapter <= highest; chapter++) {
        if (!chapters.has(chapter)) missing.push(chapter);
      }
    if (missing.length)
      issues.push(
        `${book.name}: missing chapter numbers ${missing.join(", ")}.`,
      );
  }
  return { stats, issues };
}

module.exports = { auditBible };
