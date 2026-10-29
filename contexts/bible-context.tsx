import * as BibleService from "@/services/bible-service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export const READER_STORAGE_KEY = "bible-app:reader:v1";

interface ReaderState {
  primaryVersion: string;
  secondaryVersion: string | null;
  currentBookIndex: number;
  currentBookName: string;
  currentChapter: number;
  showDualView: boolean;
  comparisonLayout: "side-by-side" | "stacked";
  singlePane: "primary" | "secondary";
}

interface BibleContextType extends ReaderState {
  navigationVersion: string;
  isReady: boolean;
  setPrimaryVersion: (versionId: string) => void;
  setSecondaryVersion: (versionId: string | null) => void;
  setCurrentBook: (bookIndex: number) => void;
  setCurrentChapter: (chapter: number) => void;
  toggleDualView: () => void;
  setComparisonLayout: (layout: ReaderState["comparisonLayout"]) => void;
  setSinglePane: (pane: ReaderState["singlePane"]) => void;
  getVersions: () => BibleService.BibleVersion[];
  getBooks: () => BibleService.Book[];
  getChapterNumbers: () => number[];
  getPrimaryChapter: () => BibleService.Chapter | null;
  getSecondaryChapter: () => BibleService.Chapter | null;
  getCurrentBookName: () => string;
}

const DEFAULT_STATE: ReaderState = {
  primaryVersion: "kjv",
  secondaryVersion: "neb",
  currentBookIndex: 0,
  currentBookName: "Genesis",
  currentChapter: 1,
  showDualView: true,
  comparisonLayout: "side-by-side",
  singlePane: "primary",
};

// Parallel reading follows the primary edition; single-pane reading follows
// the visible edition. Translation roles remain unchanged.
function navigationVersion(
  state: Pick<
    ReaderState,
    "primaryVersion" | "secondaryVersion" | "showDualView" | "singlePane"
  >,
): string {
  return !state.showDualView &&
    state.singlePane === "secondary" &&
    state.secondaryVersion
    ? state.secondaryVersion
    : state.primaryVersion;
}

function normalizeState(value: unknown): ReaderState {
  const saved =
    value && typeof value === "object" ? (value as Partial<ReaderState>) : {};
  const versions = BibleService.getVersions().map(({ id }) => id);
  const savedPrimary =
    saved.primaryVersion === "armenian" ? "neb" : saved.primaryVersion;
  const savedSecondary =
    saved.secondaryVersion === "armenian" ? "neb" : saved.secondaryVersion;
  const primaryVersion = versions.includes(savedPrimary ?? "")
    ? savedPrimary!
    : DEFAULT_STATE.primaryVersion;
  const candidateSecondary =
    savedSecondary === null
      ? null
      : versions.includes(savedSecondary ?? "")
        ? savedSecondary!
        : DEFAULT_STATE.secondaryVersion;
  const secondaryVersion =
    candidateSecondary === primaryVersion ? null : candidateSecondary;
  const showDualView =
    typeof saved.showDualView === "boolean"
      ? saved.showDualView
      : DEFAULT_STATE.showDualView;
  const singlePane = saved.singlePane === "secondary" ? "secondary" : "primary";
  const activeVersion = navigationVersion({
    primaryVersion,
    secondaryVersion,
    showDualView,
    singlePane,
  });
  const books = BibleService.getBooks(activeVersion);

  // Older v1 preferences stored an index into the primary catalogue even in
  // secondary-only mode. Resolve that legacy position once, then persist a name.
  const oldArmenianBooks = [
    "Genesis",
    "Exodus",
    "Matthew",
    "Mark",
    "Luke",
    "John",
  ];
  const legacyIndex = Number.isInteger(saved.currentBookIndex)
    ? saved.currentBookIndex!
    : 0;
  const legacyBookName =
    saved.primaryVersion === "armenian"
      ? oldArmenianBooks[legacyIndex]
      : BibleService.getBookName(primaryVersion, legacyIndex);
  const requestedBookName =
    typeof saved.currentBookName === "string"
      ? saved.currentBookName
      : legacyBookName;
  const currentBookIndex = Math.max(
    0,
    books.findIndex(({ name }) => name === requestedBookName),
  );
  const currentBookName = books[currentBookIndex].name;
  const chapters = BibleService.getChapterNumbers(
    activeVersion,
    currentBookIndex,
  );
  return {
    primaryVersion,
    secondaryVersion,
    currentBookIndex,
    currentBookName,
    currentChapter: chapters.includes(saved.currentChapter ?? -1)
      ? saved.currentChapter!
      : (chapters[0] ?? 1),
    showDualView,
    comparisonLayout:
      saved.comparisonLayout === "stacked" ? "stacked" : "side-by-side",
    singlePane,
  };
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export function BibleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReaderState>(DEFAULT_STATE);
  const [isReady, setIsReady] = useState(false);
  const writes = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(READER_STORAGE_KEY)
      .then((stored) => {
        if (active && stored) setState(normalizeState(JSON.parse(stored)));
      })
      .catch((error: unknown) =>
        console.warn("Unable to restore reader preferences", error),
      )
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    // Serialize writes so a slower earlier save cannot overwrite a later selection.
    writes.current = writes.current
      .then(() =>
        AsyncStorage.setItem(READER_STORAGE_KEY, JSON.stringify(state)),
      )
      .catch((error: unknown) =>
        console.warn("Unable to save reader preferences", error),
      );
  }, [isReady, state]);

  const setPrimaryVersion = (primaryVersion: string) => {
    if (!BibleService.getVersions().some(({ id }) => id === primaryVersion))
      return;
    setState((previous) =>
      normalizeState({
        ...previous,
        primaryVersion,
        secondaryVersion:
          previous.secondaryVersion === primaryVersion
            ? previous.primaryVersion
            : previous.secondaryVersion,
      }),
    );
  };

  const setSecondaryVersion = (secondaryVersion: string | null) => {
    if (
      secondaryVersion !== null &&
      !BibleService.getVersions().some(({ id }) => id === secondaryVersion)
    )
      return;
    setState((previous) =>
      normalizeState({
        ...previous,
        secondaryVersion:
          secondaryVersion === previous.primaryVersion
            ? null
            : secondaryVersion,
      }),
    );
  };

  const activeVersion = navigationVersion(state);
  const getCurrentBookName = () => state.currentBookName;

  return (
    <BibleContext.Provider
      value={{
        ...state,
        navigationVersion: activeVersion,
        isReady,
        setPrimaryVersion,
        setSecondaryVersion,
        setCurrentBook: (currentBookIndex) =>
          setState((previous) =>
            normalizeState({
              ...previous,
              currentBookIndex,
              currentBookName: BibleService.getBookName(
                navigationVersion(previous),
                currentBookIndex,
              ),
              currentChapter: undefined,
            }),
          ),
        setCurrentChapter: (currentChapter) =>
          setState((previous) =>
            normalizeState({ ...previous, currentChapter }),
          ),
        toggleDualView: () =>
          setState((previous) =>
            normalizeState({
              ...previous,
              showDualView: !previous.showDualView,
            }),
          ),
        setComparisonLayout: (comparisonLayout) => {
          if (
            comparisonLayout === "side-by-side" ||
            comparisonLayout === "stacked"
          )
            setState((previous) => ({ ...previous, comparisonLayout }));
        },
        setSinglePane: (singlePane) => {
          if (singlePane === "primary" || singlePane === "secondary")
            setState((previous) => normalizeState({ ...previous, singlePane }));
        },
        getVersions: BibleService.getVersions,
        getBooks: () => BibleService.getBooks(activeVersion),
        getChapterNumbers: () =>
          BibleService.getChapterNumbers(activeVersion, state.currentBookIndex),
        getPrimaryChapter: () =>
          BibleService.getChapterByName(
            state.primaryVersion,
            state.currentBookName,
            state.currentChapter,
          ),
        getSecondaryChapter: () =>
          state.secondaryVersion
            ? BibleService.getChapterByName(
                state.secondaryVersion,
                getCurrentBookName(),
                state.currentChapter,
              )
            : null,
        getCurrentBookName,
      }}
    >
      {children}
    </BibleContext.Provider>
  );
}

export function useBible() {
  const context = useContext(BibleContext);
  if (context === undefined)
    throw new Error("useBible must be used within a BibleProvider");
  return context;
}
