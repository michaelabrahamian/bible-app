export interface TranslationLicense {
  id: string;
  name: string;
  included: boolean;
  provider: string;
  summary: string;
  coverage: string;
  links: { label: string; url: string }[];
}

export const TranslationLicenses: TranslationLicense[] = [
  {
    id: "web",
    name: "World English Bible",
    included: true,
    provider: "eBible.org",
    summary:
      "The publisher dedicates this translation to the public domain and permits redistribution. The World English Bible name is a trademark for faithful copies. This app preserves the publisher's verse text and references.",
    coverage:
      "British spelling, 66-book edition (engwebpb). Publisher blank verse entries are identified rather than filled from another translation.",
    links: [
      {
        label: "Publisher's text and permission notice",
        url: "https://ebible.org/Scriptures/details.php?id=engwebpb",
      },
    ],
  },
  {
    id: "kjv",
    name: "King James Version",
    included: true,
    provider: "Scrollmapper / CrossWire",
    summary:
      "CrossWire lists this digital module's distribution licence as GPL. The underlying KJV wording is public domain in the US; Crown rights apply in the UK. The distributor's licence record is not a worldwide clearance for every use.",
    coverage:
      "66 books. Digital export labelled with Strong's numbers, morphology and catchwords; source-specific terms need review before release.",
    links: [
      {
        label: "CrossWire licence record",
        url: "https://www.crosswire.org/sword/copyright/ModInfoCopyright.jsp?modName=KJV",
      },
      {
        label: "Cambridge KJV rights notice",
        url: "https://assets.cambridge.org/97805211/63347/copyright/9780521163347_copyright_info.pdf",
      },
    ],
  },
  {
    id: "neb",
    name: "New Etchmiadzin Bible",
    included: true,
    provider: "thiagobodruk/bible · publisher: Bible Society of Armenia",
    summary:
      "Included from the GitHub collection for this prototype. The repository is MIT-licensed but expressly reserves Bible owners' rights. The exact publisher edition and offline app redistribution permission have not been verified. Inclusion is not clearance for a public release.",
    coverage:
      "64 source books, including all 27 New Testament books. Esther, Daniel and the publisher's additional canonical books are absent. Psalms is withheld because only 149 chapter arrays are present. Reference numbers follow source array positions and are not independently verified.",
    links: [
      {
        label: "Publisher and edition information",
        url: "https://biblesociety.am/eng/1/Main",
      },
      {
        label: "Pinned GitHub source",
        url: "https://github.com/thiagobodruk/bible/blob/df0860fe0921b5b899d1b554041900ab072cd4c4/json/hy_neb.json",
      },
      {
        label: "Repository licensing note",
        url: "https://github.com/thiagobodruk/bible",
      },
    ],
  },
  {
    id: "nkjv",
    name: "New King James Version",
    included: false,
    provider: "Thomas Nelson / HarperCollins Christian Publishing",
    summary:
      "A copyrighted translation. Full-text use in an app requires an appropriate publisher or provider licence. The limited quotation policy is not a full offline Bible licence. No NKJV text is bundled.",
    coverage: "Candidate for a licensed integration.",
    links: [
      {
        label: "Publisher permissions and digital products",
        url: "https://www.harpercollinschristian.com/sales-and-rights/permissions/",
      },
      { label: "Licensed API provider", url: "https://www.api.bible/" },
    ],
  },
  {
    id: "niv",
    name: "New International Version",
    included: false,
    provider: "Biblica",
    summary:
      "A copyrighted translation. Biblica offers qualifying non-commercial apps express licensing through designated partners, subject to their terms and any platform fees. That does not authorize bundling the GitHub copy. No NIV text is bundled.",
    coverage: "Candidate for a licensed integration.",
    links: [
      {
        label: "Biblica permissions and express licensing",
        url: "https://www.biblica.com/permissions/",
      },
    ],
  },
  {
    id: "nlt",
    name: "New Living Translation",
    included: false,
    provider: "Tyndale",
    summary:
      "A copyrighted translation. App and offline redistribution terms must be confirmed with Tyndale or an authorized provider. No NLT text is bundled.",
    coverage: "Candidate for a licensed integration.",
    links: [
      { label: "Tyndale permissions FAQ", url: "https://www.tyndale.com/faq" },
      { label: "Licensed API provider", url: "https://www.api.bible/" },
    ],
  },
  {
    id: "esv",
    name: "English Standard Version",
    included: false,
    provider: "Crossway",
    summary:
      "A copyrighted translation. Crossway permits qualifying non-commercial mobile use through its official API, with attribution, display, rate and caching limits. This is not permission to bundle a complete offline ESV file. No ESV text is bundled.",
    coverage:
      "Candidate for an online API integration; broader use needs a licence.",
    links: [
      { label: "Official ESV API terms", url: "https://www.esv.org/api/" },
    ],
  },
];
