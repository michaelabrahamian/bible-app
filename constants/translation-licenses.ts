export interface TranslationLicense {
  id: string;
  name: string;
  provider: string;
  summary: string;
  coverage: string;
  links: { label: string; url: string }[];
}

export const TranslationLicenses: TranslationLicense[] = [
  {
    id: "web",
    name: "World English Bible",
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
];
