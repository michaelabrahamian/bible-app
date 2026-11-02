# Bible data audit

```sh
npm run data:audit
npm run data:audit -- data/NEB.json
```

The default audit reads `KJV.json`, `NEB.json`, and `WEB.json`. It reports populated books, chapter entries, nonempty verses, empty slots, duplicate identities, malformed entries, and gaps in chapter numbering. It exits nonzero on structural issues. NEB source arrays are adapted for structural checks using their existing positions; this cannot verify the missing Psalms chapter or reference alignment. WEB's five publisher blank entries are counted separately and allowed.

The audit does not certify verse accuracy, canon completeness, cross-version numbering, or reuse permission. Public download URLs, pinned revision, hashes, and licence records are in [../data/README.md](../data/README.md).

Scrapers, collection logs, and the converter for unverified local research are excluded from the published branch. Obtain publisher-approved structured text before adding another translation.

## Official WEB import

```sh
node scripts/import-web-vpl.js /path/to/engwebpb_vpl.txt data/WEB.json
```

Use the publisher download and hashes documented in [../data/README.md](../data/README.md). The importer preserves explicit references and exact verse strings, and refuses duplicate references or invalid input. This is a structured publisher download, not a scraper.
