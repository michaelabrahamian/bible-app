import { beforeEach, expect, jest, test } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { BibleProvider, READER_STORAGE_KEY, useBible } from "../bible-context";
import * as BibleService from "@/services/bible-service";

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
        primaryVersion: "armenian",
        secondaryVersion: "kjv",
        currentBookIndex: 5,
        currentChapter: 3,
        showDualView: false,
      }),
    ),
  );
  await waitFor(() => expect(result.current.isReady).toBe(true));
  expect(result.current.primaryVersion).toBe("armenian");
  expect(result.current.currentChapter).toBe(3);
  expect(result.current.showDualView).toBe(false);
});

test("persists translation choices and position across provider remounts", async () => {
  const first = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(first.result.current.isReady).toBe(true));
  await act(async () => {
    first.result.current.setCurrentBook(42);
    first.result.current.setCurrentChapter(3);
    first.result.current.setPrimaryVersion("armenian");
    first.result.current.toggleDualView();
  });
  await waitFor(() =>
    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
      READER_STORAGE_KEY,
      JSON.stringify({
        primaryVersion: "armenian",
        secondaryVersion: "kjv",
        currentBookIndex: 5,
        currentChapter: 3,
        showDualView: false,
      }),
    ),
  );
  await first.unmount();
  const second = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(second.result.current.isReady).toBe(true));
  expect(second.result.current.getCurrentBookName()).toBe("John");
  expect(second.result.current.currentChapter).toBe(3);
  expect(second.result.current.primaryVersion).toBe("armenian");
  expect(second.result.current.secondaryVersion).toBe("kjv");
  expect(second.result.current.showDualView).toBe(false);
});

test("falls back to an available book when switching to the partial Armenian version", async () => {
  const { result } = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(result.current.isReady).toBe(true));
  const psalms = BibleService.getBooks("kjv").findIndex(
    ({ name }) => name === "Psalms",
  );
  await act(async () => result.current.setCurrentBook(psalms));
  expect(result.current.getSecondaryChapter()).toBeNull();
  await act(async () => result.current.setPrimaryVersion("armenian"));
  expect(result.current.getCurrentBookName()).toBe("Genesis");
  expect(result.current.currentChapter).toBe(1);
  expect(result.current.getPrimaryChapter()).not.toBeNull();
});

test("only offers Armenian books and chapters with available text", () => {
  const books = BibleService.getBooks("armenian");
  expect(books.map(({ name }) => name)).toEqual([
    "Genesis",
    "Exodus",
    "Matthew",
    "Mark",
    "Luke",
    "John",
  ]);
  for (const book of books) {
    for (const chapter of book.chapters) {
      expect(chapter.verses.length).toBeGreaterThan(0);
      expect(chapter.verses.every(({ text }) => text.trim().length > 0)).toBe(
        true,
      );
    }
  }
  expect(BibleService.getChapterByName("armenian", "Acts", 1)).toBeNull();
});

test("withholds partly populated Armenian chapters instead of displaying shifted verse numbers", () => {
  const withheld: Record<string, number[]> = {
    Genesis: [21, 49],
    Exodus: [25, 40],
    Matthew: [12, 16, 17, 23],
    Mark: [9, 11],
    Luke: [1, 2, 3, 11],
    John: [7, 11, 14],
  };
  for (const [book, chapters] of Object.entries(withheld)) {
    for (const chapter of chapters) {
      expect(
        BibleService.getChapterByName("armenian", book, chapter),
      ).toBeNull();
      expect(
        BibleService.getChapterAvailability("armenian", book, chapter),
      ).toBe("withheld");
    }
  }
  expect(BibleService.getChapterAvailability("armenian", "Acts", 1)).toBe(
    "missing",
  );
  expect(BibleService.getChapterAvailability("armenian", "John", 3)).toBe(
    "available",
  );
  expect(
    BibleService.getChapterByName("armenian", "John", 3)?.verses.find(
      ({ verse }) => verse === 16,
    )?.text,
  ).toContain("Աստուած այնքան սիրեց աշխարհը");
});

test("restores reading positions away from withheld chapters and navigates actual remaining chapter numbers", async () => {
  await AsyncStorage.setItem(
    READER_STORAGE_KEY,
    JSON.stringify({
      primaryVersion: "armenian",
      secondaryVersion: "kjv",
      currentBookIndex: 4,
      currentChapter: 1,
      showDualView: true,
    }),
  );
  const { result } = await renderHook(useBible, { wrapper: BibleProvider });
  await waitFor(() => expect(result.current.isReady).toBe(true));
  expect(result.current.getCurrentBookName()).toBe("Luke");
  expect(result.current.currentChapter).toBe(4);
  for (const chapter of [1, 2, 3, 11]) {
    expect(result.current.getChapterNumbers()).not.toContain(chapter);
  }
  expect(result.current.getChapterNumbers()).toHaveLength(20);
  expect(result.current.getPrimaryChapter()).not.toBeNull();
  await act(async () => result.current.setCurrentChapter(10));
  const chapters = result.current.getChapterNumbers();
  expect(chapters[chapters.indexOf(result.current.currentChapter) + 1]).toBe(
    12,
  );
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
