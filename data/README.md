# Bible text sources and status

The repository bundles only `KJV.json` and `ArmEastern.json`. On 27 October 2026, both files were verified byte-for-byte against public downloads from Scrollmapper revision `ba07bc991644d82b24426b920245eb4422daa769`. The pinned download URLs and SHA-256 hashes are recorded in [sources.json](sources.json). The files are preserved exactly as distributed.

| File | Coverage | Source and rights record |
| --- | --- | --- |
| `KJV.json` | 66 populated books, 1,189 chapters, 31,102 nonempty verse entries. English KJV, not NKJV. | Scrollmapper export of the CrossWire KJV module, whose title includes Strong's numbers, morphology, and catchwords. CrossWire lists the module distribution licence as **GPL**. Do not describe this annotated module as unrestricted merely because the underlying KJV text is old. |
| `ArmEastern.json` | Genesis, Exodus, Matthew, Mark, Luke, and John only: 6,478 nonempty verse entries. Its 66-book structure contains empty placeholders for the other books. | CrossWire calls it “Eastern Armenian Bible”, records the text source as “Slavic Bible via http://unbound.biola.edu”, and lists its distribution licence as **Public Domain**. Its original translator, publication date, and edition are not identified. |

The app uses both datasets. It hides entirely empty Armenian books/chapters and **withholds all 17 partly populated Armenian chapters** without changing the downloaded source file. It does not drop blank verses from a partly populated chapter and present the remainder as reliable. The Armenian selector is labelled partial; it is not a complete Old or New Testament and is not verified as New Echmiadzin.

## Armenian content quarantine

The public export has incorrect references in some populated chapters. In Luke 1, the entry numbered 47 contains the passage corresponding to verse 56, and the entry numbered 59 contains verse 80; intervening passages are missing. A public download and its hash establish provenance, not correct verse numbering.

The reader withholds every chapter containing both populated and empty verse entries:

- Genesis: 21, 49.
- Exodus: 25, 40.
- Matthew: 12, 16, 17, 23.
- Mark: 9, 11.
- Luke: 1, 2, 3, 11.
- John: 7, 11, 14.

That leaves 162 readable chapters across the six books. This exclusion is a precaution, not verification of the remaining text. Do not repair missing passages or verse numbers by guessing from the KJV. Restore withheld chapters only from a verified source with correct references.

When Armenian is primary, navigation lists only readable chapters and restores a saved withheld position to the book's first readable chapter. In comparison mode, unavailable text shows a labelled “not available” message, while quarantined text shows a “withheld” explanation. English remains in its own KJV pane. No missing Armenian content is generated or substituted.

## Source and licence records

- [Pinned Scrollmapper snapshot](https://github.com/scrollmapper/bible_databases/tree/ba07bc991644d82b24426b920245eb4422daa769).
- [Scrollmapper repository licence](https://github.com/scrollmapper/bible_databases/blob/ba07bc991644d82b24426b920245eb4422daa769/LICENSE), included as [SCROLLMAPPER-LICENSE](SCROLLMAPPER-LICENSE).
- [CrossWire ArmEastern module](https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=ArmEastern) and [rights record](https://www.crosswire.org/sword/copyright/ModInfoCopyright.jsp?modName=ArmEastern).
- [CrossWire KJV rights record](https://www.crosswire.org/sword/copyright/ModInfoCopyright.jsp?modName=KJV) and [module source](https://gitlab.com/crosswire-bible-society/kjv).

For the plain KJV wording, US public-domain status does not establish unrestricted worldwide use. [Cambridge's notice](https://assets.cambridge.org/97805211/63347/copyright/9780521163347_copyright_info.pdf) records Crown rights and permission requirements in the United Kingdom. The digital module's licence record is a separate consideration.

Public download availability and a distributor's licence classification do not independently establish the original translation's identity or worldwide app distribution permission. Scrollmapper's repository licence does not replace any text-specific terms. Confirm the applicable notices and licence requirements before distributing the app.

## Excluded local research

Scrapers, scraped Bible Society/Classical outputs, logs, and the locally converted `ArmReformed` text and its raw inputs are excluded from this branch's commits. They have no sufficiently recorded source or permission to include here. The original local checkout retains the research files; `.gitignore` prevents accidentally adding them to this branch again.

For a complete modern Eastern Armenian edition, obtain an authoritative structured text and app/offline permission from its rights holder. For New Echmiadzin, the first contact is the Bible Society of Armenia: info@biblesociety.am ([website](https://biblesociety.am/eng/1/Main)).

## Validation

Run `npm run data:audit` for the two bundled datasets, or pass a specific file. The audit checks structure and reports empty ArmEastern placeholders separately from available text. It does not certify canon completeness, verse alignment, textual accuracy, edition identity, or reuse permission.
