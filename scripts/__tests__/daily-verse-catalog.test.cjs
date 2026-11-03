/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { Buffer } = require('node:buffer');
const plist = require('@expo/plist').default;
const { buildDailyVerseCatalog } = require('../lib/daily-verse-catalog.cjs');
const { writeWidgetFiles } = require('../../plugins/with-daily-verse-widget.cjs');
const root = path.resolve(__dirname, '../..');

test('every daily verse is short, complete, unique and links to the same reference', () => {
  const { epoch, verses } = buildDailyVerseCatalog(root);
  assert.equal(epoch, '2026-01-01');
  assert.equal(verses.length, 25);
  assert.equal(new Set(verses.map(({ reference }) => reference)).size, verses.length);
  for (const entry of verses) {
    assert.ok(entry.armenianText.trim().length > 0 && entry.armenianText.length <= 90);
    assert.ok(entry.englishText.trim().length > 0 && entry.englishText.length <= 100);
    const url = new URL(entry.url);
    assert.equal(url.searchParams.get('book'), entry.book);
    assert.equal(Number(url.searchParams.get('chapter')), entry.chapter);
    assert.equal(Number(url.searchParams.get('verse')), entry.verse);
  }
});

test('native generation preserves Armenian Unicode and source strings exactly', () => {
  const ios = fs.mkdtempSync(path.join(os.tmpdir(), 'bible-widget-test-'));
  try {
    writeWidgetFiles(root, ios, 'group.test.bible.widgets');
    const info = plist.parse(fs.readFileSync(path.join(ios, 'DailyVerseWidget/Info.plist'), 'utf8'));
    const entitlements = plist.parse(fs.readFileSync(path.join(ios, 'DailyVerseWidget/DailyVerseWidget.entitlements'), 'utf8'));
    assert.equal(info.BibleWidgetAppGroupIdentifier, 'group.test.bible.widgets');
    assert.deepEqual(entitlements['com.apple.security.application-groups'], ['group.test.bible.widgets']);
    assert.equal(fs.readFileSync(path.join(ios, 'DailyVerseWidget/SharedWidgetAppearance.swift'), 'utf8'),
      fs.readFileSync(path.join(root, 'modules/bible-widget-appearance/ios/SharedWidgetAppearance.swift'), 'utf8'));
    const generated = fs.readFileSync(path.join(ios, 'DailyVerseWidget/GeneratedDailyVerses.swift'), 'utf8');
    const base64 = generated.match(/base64Encoded: "([A-Za-z0-9+/=]+)"/)[1];
    assert.deepEqual(JSON.parse(Buffer.from(base64, 'base64').toString('utf8')), buildDailyVerseCatalog(root).verses);
    writeWidgetFiles(root, ios, 'group.test.bible.widgets');
    assert.equal(fs.readFileSync(path.join(ios, 'DailyVerseWidget/GeneratedDailyVerses.swift'), 'utf8'), generated);
  } finally {
    fs.rmSync(ios, { recursive: true, force: true });
  }
});
