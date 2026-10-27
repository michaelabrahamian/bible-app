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
  currentChapter: number;
  showDualView: boolean;
}

interface BibleContextType extends ReaderState {
  isReady: boolean;
  setPrimaryVersion: (versionId: string) => void;
  setSecondaryVersion: (versionId: string | null) => void;
  setCurrentBook: (bookIndex: number) => void;
  setCurrentChapter: (chapter: number) => void;
  toggleDualView: () => void;
  getVersions: () => BibleService.BibleVersion[];
  getBooks: () => BibleService.Book[];
  getChapterNumbers: () => number[];
  getPrimaryChapter: () => BibleService.Chapter | null;
  getSecondaryChapter: () => BibleService.Chapter | null;
  getCurrentBookName: () => string;
}

const DEFAULT_STATE: ReaderState = {
  primaryVersion: "kjv",
  secondaryVersion: "armenian",
  currentBookIndex: 0,
  currentChapter: 1,
  showDualView: true,
};

function normalizeState(value: unknown): ReaderState {
  const saved =
    value && typeof value === "object" ? (value as Partial<ReaderState>) : {};
  const versions = BibleService.getVersions().map(({ id }) => id);
  const primaryVersion = versions.includes(saved.primaryVersion ?? "")
    ? saved.primaryVersion!
    : DEFAULT_STATE.primaryVersion;
  const secondaryVersion =
    saved.secondaryVersion === null
      ? null
      : versions.includes(saved.secondaryVersion ?? "")
        ? saved.secondaryVersion!
        : DEFAULT_STATE.secondaryVersion;
  const books = BibleService.getBooks(primaryVersion);
  const currentBookIndex =
    Number.isInteger(saved.currentBookIndex) && books[saved.currentBookIndex!]
      ? saved.currentBookIndex!
      : 0;
  const chapters = BibleService.getChapterNumbers(
    primaryVersion,
    currentBookIndex,
  );

  return {
    primaryVersion,
    secondaryVersion:
      secondaryVersion === primaryVersion ? null : secondaryVersion,
    currentBookIndex,
    currentChapter: chapters.includes(saved.currentChapter ?? -1)
      ? saved.currentChapter!
      : (chapters[0] ?? 1),
    showDualView:
      typeof saved.showDualView === "boolean"
        ? saved.showDualView
        : DEFAULT_STATE.showDualView,
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
    setState((previous) => {
      const bookName = BibleService.getBookName(
        previous.primaryVersion,
        previous.currentBookIndex,
      );
      const bookIndex = BibleService.getBooks(primaryVersion).findIndex(
        ({ name }) => name === bookName,
      );
      return normalizeState({
        ...previous,
        primaryVersion,
        currentBookIndex: Math.max(0, bookIndex),
        secondaryVersion:
          previous.secondaryVersion === primaryVersion
            ? previous.primaryVersion
            : previous.secondaryVersion,
      });
    });
  };

  const setSecondaryVersion = (secondaryVersion: string | null) => {
    if (
      secondaryVersion !== null &&
      !BibleService.getVersions().some(({ id }) => id === secondaryVersion)
    )
      return;
    setState((previous) => ({
      ...previous,
      secondaryVersion:
        secondaryVersion === previous.primaryVersion ? null : secondaryVersion,
    }));
  };

  const getCurrentBookName = () =>
    BibleService.getBookName(state.primaryVersion, state.currentBookIndex);

  return (
    <BibleContext.Provider
      value={{
        ...state,
        isReady,
        setPrimaryVersion,
        setSecondaryVersion,
        setCurrentBook: (currentBookIndex) =>
          setState((previous) =>
            normalizeState({
              ...previous,
              currentBookIndex,
              currentChapter: undefined,
            }),
          ),
        setCurrentChapter: (currentChapter) =>
          setState((previous) =>
            normalizeState({ ...previous, currentChapter }),
          ),
        toggleDualView: () =>
          setState((previous) => ({
            ...previous,
            showDualView: !previous.showDualView,
          })),
        getVersions: BibleService.getVersions,
        getBooks: () => BibleService.getBooks(state.primaryVersion),
        getChapterNumbers: () =>
          BibleService.getChapterNumbers(
            state.primaryVersion,
            state.currentBookIndex,
          ),
        getPrimaryChapter: () =>
          BibleService.getChapter(
            state.primaryVersion,
            state.currentBookIndex,
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
