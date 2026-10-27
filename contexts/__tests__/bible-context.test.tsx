import { beforeEach, expect, jest, test } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { BibleProvider, READER_STORAGE_KEY, useBible } from "../bible-context";
import * as BibleService from "@/services/bible-service";
import { TranslationLicenses } from "@/constants/translation-licenses";
import nebSource from "@/data/NEB.json";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual(
    "@react-native-async-storage/async-storage/jest/async-storage-mock",
  ),
);

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

test("waits for stored preferences before saving defaults", async () => {
  let restore!: (value: string | null) => void;
  jest.spyOn(AsyncStorage, "getItem").mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        restore = resolve;
      }),
  );
  const { result } = await renderHook(useBible, { wrapper: BibleProvider });
  expect(result.current.isReady).toBe(false);
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();

  await act(async () =>
    restore(
      JSON.stringify({
        primaryVersion: "neb",
        secondaryVersion: "kjv",
        currentBookIndex: BibleService.getBooks("neb").findIndex(
          ({ name }) => name === "John",
        ),
        currentChapter: 3,
        showDualView: false,
        comparisonLayout: "side-by-side",
        singlePane: "primary",
      }),
    ),
  );
  await waitFor(() => expect(result.current.isReady).toBe(true));
  expect(result.current.primaryVersion).toBe("neb");
  expect(result.current.currentChapter).toBe(3);
  expect(result.current.showDualView).toBe(false);
});

test("persists translation choices and position across provider remounts", async () => {
  const first = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(first.result.current.isReady).toBe(true));
  await act(async () => {
    first.result.current.setCurrentBook(42);
    first.result.current.setCurrentChapter(3);
    first.result.current.setPrimaryVersion("neb");
    first.result.current.toggleDualView();
  });
  await waitFor(() =>
    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
      READER_STORAGE_KEY,
      JSON.stringify({
        primaryVersion: "neb",
        secondaryVersion: "kjv",
        currentBookIndex: BibleService.getBooks("neb").findIndex(
          ({ name }) => name === "John",
        ),
        currentChapter: 3,
        showDualView: false,
        comparisonLayout: "side-by-side",
        singlePane: "primary",
      }),
    ),
  );
  await first.unmount();
  const second = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(second.result.current.isReady).toBe(true));
  expect(second.result.current.getCurrentBookName()).toBe("John");
  expect(second.result.current.currentChapter).toBe(3);
  expect(second.result.current.primaryVersion).toBe("neb");
  expect(second.result.current.secondaryVersion).toBe("kjv");
  expect(second.result.current.showDualView).toBe(false);
});

test("preserves book identity when switching around missing NEB books", async () => {
  const { result } = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(result.current.isReady).toBe(true));
  await act(async () =>
    result.current.setCurrentBook(
      BibleService.getBooks("kjv").findIndex(({ name }) => name === "Daniel"),
    ),
  );
  expect(result.current.getSecondaryChapter()).toBeNull();
  await act(async () => result.current.setPrimaryVersion("neb"));
  expect(result.current.getCurrentBookName()).toBe("Genesis");
  await act(async () =>
    result.current.setCurrentBook(
      BibleService.getBooks("neb").findIndex(({ name }) => name === "Acts"),
    ),
  );
  await act(async () => result.current.setPrimaryVersion("web"));
  expect(result.current.getCurrentBookName()).toBe("Acts");
});

test("NEB has all 27 NT books and explicitly missing or withheld OT books", () => {
  const names = BibleService.getBooks("neb").map(({ name }) => name);
  expect(names).toHaveLength(63);
  const nt = BibleService.getBooks("neb").slice(names.indexOf("Matthew"));
  expect(nt.map(({ name }) => name)).toEqual(
    BibleService.getBooks("kjv")
      .slice(39)
      .map(({ name }) => name),
  );
  expect(nt.reduce((sum, book) => sum + book.chapters.length, 0)).toBe(260);
  for (const name of ["Esther", "Daniel"]) {
    expect(BibleService.getChapterByName("neb", name, 1)).toBeNull();
    expect(BibleService.getChapterAvailability("neb", name, 1)).toBe("missing");
  }
  expect(BibleService.getChapterByName("neb", "Psalms", 1)).toBeNull();
  expect(BibleService.getChapterAvailability("neb", "Psalms", 1)).toBe(
    "withheld",
  );
  expect(BibleService.getChapterByName("neb", "Luke", 1)?.verses).toHaveLength(
    80,
  );
  expect(BibleService.getVersions().some(({ id }) => id === "armenian")).toBe(
    false,
  );
});

test("migrates legacy Armenian book indices by identity to NEB", async () => {
  await AsyncStorage.setItem(
    READER_STORAGE_KEY,
    JSON.stringify({
      primaryVersion: "armenian",
      secondaryVersion: "kjv",
      currentBookIndex: 4,
      currentChapter: 1,
      showDualView: true,
      comparisonLayout: "stacked",
    }),
  );
  const { result } = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(result.current.isReady).toBe(true));
  expect(result.current.primaryVersion).toBe("neb");
  expect(result.current.getCurrentBookName()).toBe("Luke");
  expect(result.current.currentChapter).toBe(1);
  expect(result.current.comparisonLayout).toBe("stacked");
  expect(result.current.getPrimaryChapter()?.verses).toHaveLength(80);
});

test("NEB adaptation preserves every available source string and maps canonical book identities", () => {
  const books = BibleService.getBooks("neb");
  const source = nebSource.filter(({ abbrev }) => abbrev !== "sl");
  const canonicalNames = BibleService.getBooks("kjv").map(({ name }) => name);
  books.forEach((book, index) => {
    expect(canonicalNames).toContain(book.name);
    expect(
      book.chapters.map(({ verses }) => verses.map(({ text }) => text)),
    ).toEqual(source[index].chapters);
  });
});

test("validates unavailable versions and reading positions on restoration", async () => {
  await AsyncStorage.setItem(
    READER_STORAGE_KEY,
    JSON.stringify({
      primaryVersion: "removed",
      secondaryVersion: "removed",
      currentBookIndex: 1000,
      currentChapter: -10,
      showDualView: "yes",
    }),
  );
  const { result } = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(result.current.isReady).toBe(true));
  expect(result.current.primaryVersion).toBe("kjv");
  expect(result.current.currentBookIndex).toBe(0);
  expect(result.current.currentChapter).toBe(1);
  expect(result.current.showDualView).toBe(true);
});

test("recovers from corrupt storage without blocking the reader", async () => {
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  await AsyncStorage.setItem(READER_STORAGE_KEY, "{invalid json");
  const { result } = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(result.current.isReady).toBe(true));
  expect(result.current.getPrimaryChapter()).not.toBeNull();
  expect(warn).toHaveBeenCalledWith(
    "Unable to restore reader preferences",
    expect.any(Error),
  );
  warn.mockRestore();
});

test("recovers from a device storage read failure", async () => {
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  jest
    .spyOn(AsyncStorage, "getItem")
    .mockRejectedValueOnce(new Error("Storage unavailable"));
  const { result } = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(result.current.isReady).toBe(true));
  expect(result.current.primaryVersion).toBe("kjv");
  warn.mockRestore();
});

test("switches among three translations without losing book identity or duplicating panes", async () => {
  const { result } = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(result.current.isReady).toBe(true));
  expect(result.current.getVersions().map(({ id }) => id)).toEqual([
    "kjv",
    "web",
    "neb",
  ]);
  await act(async () => {
    result.current.setCurrentBook(42);
    result.current.setCurrentChapter(3);
    result.current.setPrimaryVersion("web");
  });
  expect(result.current.getCurrentBookName()).toBe("John");
  expect(result.current.currentChapter).toBe(3);
  expect(result.current.secondaryVersion).toBe("neb");
  await act(async () => result.current.setSecondaryVersion("kjv"));
  expect(result.current.primaryVersion).toBe("web");
  expect(result.current.secondaryVersion).toBe("kjv");
  await act(async () => result.current.setPrimaryVersion("kjv"));
  expect(result.current.secondaryVersion).toBe("web");
  expect(result.current.getCurrentBookName()).toBe("John");
  expect(result.current.currentChapter).toBe(3);
});

test("saves comparison layout and migrates old saved settings to side by side", async () => {
  const first = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(first.result.current.isReady).toBe(true));
  expect(first.result.current.comparisonLayout).toBe("side-by-side");
  await act(async () => first.result.current.setComparisonLayout("stacked"));
  await waitFor(() =>
    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
      READER_STORAGE_KEY,
      expect.stringContaining('"comparisonLayout":"stacked"'),
    ),
  );
  await first.unmount();
  const second = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(second.result.current.isReady).toBe(true));
  expect(second.result.current.comparisonLayout).toBe("stacked");
});

test("WEB retains correct Luke references and explicit publisher omissions", () => {
  expect(BibleService.getBooks("web")).toHaveLength(66);
  const luke = BibleService.getChapterByName("web", "Luke", 1)!;
  expect(luke.verses.find(({ verse }) => verse === 46)?.text).toContain(
    "My soul magnifies the Lord",
  );
  expect(luke.verses.find(({ verse }) => verse === 56)?.text).toContain(
    "Mary stayed with her about three months",
  );
  expect(luke.verses.find(({ verse }) => verse === 80)?.text).toContain(
    "The child was growing",
  );
  const acts = BibleService.getChapterByName("web", "Acts", 8)!;
  expect(acts.verses.find(({ verse }) => verse === 37)?.text).toBe("");
  expect(BibleService.getChapterAvailability("web", "Acts", 8)).toBe(
    "available",
  );
});

test("only exposes included texts as reading options and records the four remaining candidates separately", () => {
  const included = TranslationLicenses.filter(
    (record: { included: boolean }) => record.included,
  )
    .map((record: { id: string }) => record.id)
    .sort();
  expect(included).toEqual(
    BibleService.getVersions()
      .map(({ id }) => id)
      .sort(),
  );
  const candidates = TranslationLicenses.filter(
    (record: { included: boolean }) => !record.included,
  ).map((record: { id: string }) => record.id);
  expect(candidates).toEqual(["nkjv", "niv", "nlt", "esv"]);
  for (const id of candidates)
    expect(
      BibleService.getVersions().some((version) => version.id === id),
    ).toBe(false);
});

test("persists secondary-only reading without swapping translation roles", async () => {
  const first = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(first.result.current.isReady).toBe(true));
  await act(async () => {
    first.result.current.setSinglePane("secondary");
    first.result.current.toggleDualView();
  });
  await waitFor(() =>
    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
      READER_STORAGE_KEY,
      expect.stringContaining('"singlePane":"secondary"'),
    ),
  );
  await first.unmount();
  const second = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(second.result.current.isReady).toBe(true));
  expect(second.result.current.singlePane).toBe("secondary");
  expect(second.result.current.showDualView).toBe(false);
  expect(second.result.current.primaryVersion).toBe("kjv");
  expect(second.result.current.secondaryVersion).toBe("neb");
  expect(second.result.current.getSecondaryChapter()).not.toBeNull();
});
