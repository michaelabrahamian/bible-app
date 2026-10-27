# Bible data audit

```sh
npm run data:audit
npm run data:audit -- data/ArmEastern.json
```

The default audit reads `KJV.json` and `ArmEastern.json`. It reports populated books, chapter entries, nonempty verses, empty slots, duplicate identities, malformed entries, and gaps in chapter numbering. It exits nonzero on structural issues. ArmEastern's empty placeholders are counted separately and allowed; they are not available Bible text.

The audit does not certify verse accuracy, canon completeness, cross-version numbering, or reuse permission. Public download URLs, pinned revision, hashes, and licence records are in [../data/README.md](../data/README.md).

Scrapers, collection logs, and the converter for unverified local research are excluded from the published branch. Obtain publisher-approved structured text before adding another translation.
