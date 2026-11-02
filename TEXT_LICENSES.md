# Bible text sources, licensing and candidate translations

Application code and Bible texts have separate rights. This document records source evidence and permission status; it does not grant rights held by a translation's publisher. A public GitHub download, MIT licence for a repository, or attribution note does not independently authorize redistribution of a modern translation.

## Included texts

| Text | Source / licence evidence | Scope and outstanding work |
| --- | --- | --- |
| World English Bible, British 66-book edition | Official eBible.org `engwebpb` download; publisher explicitly dedicates the text to the Public Domain. | All 66 books. Verse strings and references are preserved unchanged, including five blank publisher entries. The World English Bible name is a trademark for faithful copies. See [publisher permission notice](https://ebible.org/Scriptures/details.php?id=engwebpb) and the preserved [archive notice](data/WEB-NOTICE.html). |
| King James Version | Scrollmapper JSON export; [CrossWire module record](https://www.crosswire.org/sword/copyright/ModInfoCopyright.jsp?modName=KJV) lists GPL. | The plain KJV is public domain in the US, while [Cambridge records Crown rights in the UK](https://assets.cambridge.org/97805211/63347/copyright/9780521163347_copyright_info.pdf). Review the exact digital edition's terms and intended distribution countries before release. |
| New Etchmiadzin Bible (incomplete GitHub edition) | Byte-for-byte `hy_neb.json` from [thiagobodruk/bible at df0860f](https://github.com/thiagobodruk/bible/blob/df0860fe0921b5b899d1b554041900ab072cd4c4/json/hy_neb.json). Repository MIT notice preserved; README expressly reserves Bible owners' rights. | Included for this prototype. Exact publisher edition and redistribution permission remain unverified; **not cleared for public release**. Source has 64 books/all 27 NT headings and 260 NT chapters, but lacks Esther, Daniel and the publisher's additional canonical books. Psalms is withheld because only 149 chapter arrays are present. Matthew 23 and Mark 9 use verified reference mappings recorded in [data/NEB-REFERENCES.json](data/NEB-REFERENCES.json); other references remain unverified. This does not change the permission status. |

See [data/sources.json](data/sources.json) for download URLs, immutable Scrollmapper revision, hashes, WEB archive entry, and conversion details. The Scrollmapper repository notice is preserved in [data/SCROLLMAPPER-LICENSE](data/SCROLLMAPPER-LICENSE); it does not replace translation-specific terms.

## Requested candidates — no text bundled

These are the four remaining candidates for future integration. Their names and permission links are catalogued; their full Bible files are not included in the repository or app bundle.

| Candidate | Publisher / route | Current status |
| --- | --- | --- |
| NKJV | [Thomas Nelson / HarperCollins permissions](https://www.harpercollinschristian.com/sales-and-rights/permissions/) | Copyrighted. Full-text app use needs an appropriate publisher/provider licence; limited quotation permission is not permission for a full offline Bible. |
| NIV | [Biblica permissions](https://www.biblica.com/permissions/) | Copyrighted. Biblica offers express licensing through designated partners for qualifying non-commercial apps. Provider terms and possible platform fees apply; this does not authorize bundling a GitHub copy. |
| NLT | [Tyndale permissions FAQ](https://www.tyndale.com/faq) | Copyrighted. Obtain app and offline redistribution terms from Tyndale or an authorized provider before inclusion. |
| ESV | [Crossway official API](https://www.esv.org/api/) | Copyrighted. Qualifying non-commercial apps may use the API subject to its attribution, display, rate and cache limits; the published cache limit is 500 verses. Full offline bundling needs a separate licence. |

The GitHub collection itself says its Bible versions remain the property of their respective owners. Its catalogue is useful for discovery and format research, but is not evidence that each publisher approved redistribution.

## Licensed access investigation

[GitHub backlog issue #2](https://github.com/michaelabrahamian/bible-app/issues/2) tracks NKJV integration. The practical route for **NKJV, NIV and NLT** is [API.Bible](https://www.api.bible/), which advertises all three translations. Its current homepage advertises a free non-commercial Starter plan with up to three licensed Bibles and 5,000 calls per month. Its catalogue also refers to paid plans for protected texts, so confirm the exact translations, territories and licence entitlements in the account dashboard before promising free access. [Biblica explicitly identifies API.Bible and YouVersion as express-licensing partners](https://www.biblica.com/permissions/) for qualifying non-commercial apps without AI functionality.

1. Create an API.Bible account, register this app, and check whether NKJV, NIV and NLT can be selected under the applicable plan. No account or licence has been created for this project.
2. Record the approved Bible IDs, edition, territory restrictions and required notices. The [provider terms](https://www.api.bible/terms-and-conditions) require attribution and refreshing cached content at least every 30 days; this is not permission to publish permanent full-text JSON files.
3. Integrate chapter requests through a small server endpoint that keeps the provider key private. Add loading, offline, expired-cache and permission-error states to both reader panes. Keep the current bundled texts available offline. Widgets also need an explicit cache/update policy that follows the chosen licence.

For **ESV**, the [official API](https://www.esv.org/api/) permits qualifying non-commercial mobile use without a separate formal permission request, provided its general conditions are met. It requires registration/an access key, attribution and a link to ESV.org. Its storage and display limits include 500 verses or half a book, whichever is less, with the stated exceptions for very short books. Requests also have rate limits. Use a server endpoint to protect its key; do not download or bundle the complete GitHub text. No ESV account/key has been configured.

For **New Etchmiadzin**, ask the Bible Society of Armenia at info@biblesociety.am for permission covering an iOS/Android app, home-screen widgets, offline storage and intended distribution countries. Request an authoritative digital edition with stable book/chapter/verse references, its full canon, required attribution and any fees/update obligations. The incomplete GitHub file does not establish these terms. No request has been sent and no permission has been obtained. Inclusion in this prototype does not resolve that requirement.

These findings establish possible access routes, not active integrations. The four English candidates remain unavailable for reading until the relevant account/grant and technical integration are in place. New Etchmiadzin is included as a local prototype text; its redistribution clearance is still outstanding.

## App disclosure and release checks

Settings includes a Bible text licensing note and a **Text sources & licences** page. The page lists only the three bundled texts and links to their source and publisher records. Future translation research stays in this document and the GitHub backlog. This information is driven by `constants/translation-licenses.ts`.

Before adding a candidate, record the exact source/edition, applicable licence or written grant, attribution, commercial-use and offline/cache conditions, territories, and any expiry/update requirements. Validate references against the authoritative text. Do not treat book counts or a passing structural audit as textual verification.

Source and permission records checked 27 October 2026. Publisher terms can change. The app source code does not yet have a separately selected project-wide licence.
