# Bible text data

The current app bundles KJV, WEB and an incomplete New Etchmiadzin GitHub edition. ArmEastern has been removed from the current tree and app bundle. [sources.json](sources.json) records pinned URLs, revisions and SHA-256 hashes. [TEXT_LICENSES.md](../TEXT_LICENSES.md) records licensing and remaining publisher/provider work.

| File | Coverage | Provenance and rights |
| --- | --- | --- |
| `KJV.json` | 66 books, 1,189 chapters, 31,102 verses. | Unchanged public Scrollmapper export. CrossWire lists the digital module as GPL. Plain KJV US public-domain status does not establish unrestricted worldwide use; UK Crown rights and edition-specific terms need review. |
| `WEB.json` | British 66-book edition, 1,189 chapters, 31,098 nonempty verses and five explicitly blank publisher entries. | Official eBible.org public-domain download. Exact verse strings and explicit reference IDs preserved. Publisher notice: [WEB-NOTICE.html](WEB-NOTICE.html). |
| `NEB.json` | 64 source books, 1,165 chapter arrays, 30,572 verse strings. All 27 NT books/260 NT chapters are present. | Unchanged `hy_neb.json` from thiagobodruk/bible at `df0860fe0921b5b899d1b554041900ab072cd4c4`. The repository's MIT licence is preserved in [THIAGOBODRUK-LICENSE](THIAGOBODRUK-LICENSE); its README expressly reserves Bible owners' rights. Exact publisher edition, accuracy and redistribution permission are not verified. Prototype inclusion is not clearance for public release. |

## New Etchmiadzin limitations

The [Bible Society of Armenia](https://biblesociety.am/eng/1/Main) describes a New Etchmiadzin edition with 48 Old Testament and 27 New Testament books. The GitHub file lacks Esther, Daniel and those additional canonical books. It must not be described as a complete copy of that publisher's edition.

The source supplies arrays without explicit chapter or verse IDs. The service maps book abbreviations explicitly to stable English book identities, preserving every verse string. Matthew 23 and Mark 9 use explicit verse-number mappings in [NEB-REFERENCES.json](NEB-REFERENCES.json), checked against the Bible Society of Armenia edition on YouVersion. These preserve the omitted verse numbers instead of shifting subsequent entries. The record is tied to the exact source SHA-256 and retains reference URLs and verification notes. Other displayed chapter and verse numbers follow source array positions and remain unverified; this is a format adaptation, not authoritative reference verification. Numbering can differ between editions, so comparison is by book/chapter and side-by-side verses align by numeric reference in a shared scroll area; stacked panes scroll independently.

Psalms has only **149 chapter arrays**. Without an authoritative reference mapping, the missing/combined chapter cannot be safely identified. The entire Psalms book is withheld from NEB reading options and shows an explicit withheld message when compared from an English edition. The other 63 books are available; that is not independent verification of their text. Missing books show an unavailable message, never substituted English.

Saved `armenian` preferences from the removed six-book ArmEastern edition migrate to `neb` by original book name, preserving the chapter when available. Earlier v1 positions are interpreted using their primary-edition index; new positions persist the book name. Single-pane navigation follows the visible edition, so secondary-only English reading retains its complete book/chapter catalogue. Primary and secondary roles do not swap.

## WEB import

The official archive is `https://ebible.org/Scriptures/engwebpb_vpl.zip`. Its hash, source entry hash, generated JSON hash and download date are in sources.json. Regenerate with:

```sh
node scripts/import-web-vpl.js /path/to/engwebpb_vpl.txt data/WEB.json
```

The importer normalizes book names to existing reader identities, preserves the publisher's explicit verse numbers and strings, and rejects duplicate or invalid references. WEB's five blank entries display “Not included in this edition.”

## Audit and notices

Run `npm run data:audit`. It checks shape, duplicate identities, malformed entries, empty text and numbering gaps. NEB arrays are adapted for structural inspection; a passing result does not certify reference accuracy, completeness or permission.

[SCROLLMAPPER-LICENSE](SCROLLMAPPER-LICENSE) and [CrossWire's KJV record](https://www.crosswire.org/sword/copyright/ModInfoCopyright.jsp?modName=KJV) document KJV provenance. [Cambridge's notice](https://assets.cambridge.org/97805211/63347/copyright/9780521163347_copyright_info.pdf) documents UK Crown rights. Repository licences do not replace translation-specific terms. Confirm publisher rights, territories and notices before distributing this app.
