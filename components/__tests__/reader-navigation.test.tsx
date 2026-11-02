import { beforeEach, expect, jest, test } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { GestureHandlerRootView, State } from "react-native-gesture-handler";
import {
  fireGestureHandler,
  getByGestureTestId,
} from "react-native-gesture-handler/jest-utils";
import ReaderScreen from "@/app/reader";
import {
  BibleProvider,
  READER_STORAGE_KEY,
  useBible,
} from "@/contexts/bible-context";
import { getAdjacentPassage } from "@/utils/reader-navigation";
import type { Book } from "@/services/bible-service";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual(
    "@react-native-async-storage/async-storage/jest/async-storage-mock",
  ),
);
jest.mock(
  "react-native-safe-area-context",
  () =>
    jest.requireActual<{ default: unknown }>(
      "react-native-safe-area-context/jest/mock",
    ).default,
);
jest.mock("@/components/ui/icon-symbol", () => ({ IconSymbol: () => null }));
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  router: { canGoBack: () => false, back: jest.fn(), replace: jest.fn() },
}));

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

function ReadyReader() {
  return useBible().isReady ? <ReaderScreen /> : null;
}

async function reader(saved: Record<string, unknown> = {}) {
  await AsyncStorage.setItem(
    READER_STORAGE_KEY,
    JSON.stringify({
      primaryVersion: "kjv",
      secondaryVersion: "neb",
      currentBookName: "Genesis",
      currentChapter: 1,
      showDualView: false,
      singlePane: "primary",
      ...saved,
    }),
  );
  const result = await render(
    <GestureHandlerRootView>
      <BibleProvider>
        <ReadyReader />
      </BibleProvider>
    </GestureHandlerRootView>,
  );
  await waitFor(() =>
    expect(
      result.getByRole("button", { name: /^Choose passage:/ }),
    ).toBeTruthy(),
  );
  return result;
}

async function swipe(
  x: number,
  y = 0,
  end: typeof State.END | typeof State.CANCELLED = State.END,
) {
  await act(() =>
    fireGestureHandler(getByGestureTestId("chapter-swipe"), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX: x, translationY: y },
      { state: end, translationX: x, translationY: y },
    ]),
  );
}

test("the reader heading opens the current book's chapters and selects a chapter", async () => {
  const screen = await reader();
  await fireEvent.press(
    screen.getByRole("button", { name: "Choose passage: Genesis 1" }),
  );
  expect(
    screen.getByRole("button", { name: "Genesis chapter 1" }).props
      .accessibilityState.selected,
  ).toBe(true);
  await fireEvent.press(
    screen.getByRole("button", { name: "Genesis chapter 3" }),
  );
  expect(
    screen.getByRole("button", { name: "Choose passage: Genesis 3" }),
  ).toBeTruthy();
  expect(screen.queryByText("Go to passage")).toBeNull();
});

test("searching and choosing a new book and chapter commits one passage", async () => {
  const screen = await reader();
  await fireEvent.press(
    screen.getByRole("button", { name: /^Choose passage:/ }),
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Choose book: Genesis" }),
  );
  await fireEvent.changeText(screen.getByLabelText("Search books"), "john");
  expect(screen.queryByRole("button", { name: "Choose Genesis" })).toBeNull();
  await fireEvent.press(screen.getByRole("button", { name: "Choose John" }));
  await fireEvent.press(
    screen.getByRole("button", { name: "John chapter 16" }),
  );
  expect(
    screen.getByRole("button", { name: "Choose passage: John 16" }),
  ).toBeTruthy();
  await waitFor(() => {
    const saved = JSON.parse(
      String(jest.mocked(AsyncStorage.setItem).mock.calls.at(-1)?.[1]),
    );
    expect(saved.currentBookName).toBe("John");
    expect(saved.currentChapter).toBe(16);
  });
});

test.each(["Close passage picker", "Dismiss passage picker"])(
  "%s leaves the reading position unchanged after choosing a book",
  async (dismiss) => {
    const screen = await reader();
    await fireEvent.press(
      screen.getByRole("button", { name: /^Choose passage:/ }),
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Choose book: Genesis" }),
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Choose Exodus" }),
    );
    await fireEvent.press(
      screen.getByRole("button", {
        name: dismiss,
        includeHiddenElements: true,
      }),
    );
    expect(
      screen.getByRole("button", { name: "Choose passage: Genesis 1" }),
    ).toBeTruthy();
  },
);

test.each([
  { showDualView: false, singlePane: "primary" },
  { showDualView: false, singlePane: "secondary" },
  { showDualView: true, comparisonLayout: "side-by-side" },
  { showDualView: true, comparisonLayout: "stacked" },
])("swipes chapters in both directions in layout %j", async (layout) => {
  const screen = await reader(layout);
  await swipe(-120);
  expect(
    screen.getByRole("button", { name: "Choose passage: Genesis 2" }),
  ).toBeTruthy();
  await swipe(120);
  expect(
    screen.getByRole("button", { name: "Choose passage: Genesis 1" }),
  ).toBeTruthy();
});

test("short, vertical, diagonal and cancelled drags do not change chapter", async () => {
  const screen = await reader();
  await swipe(-10);
  await swipe(-20, -150);
  await swipe(-100, 150);
  await swipe(-120, 0, State.CANCELLED);
  expect(
    screen.getByRole("button", { name: "Choose passage: Genesis 1" }),
  ).toBeTruthy();
});

test("buttons and swipes cross book boundaries without wrapping at Bible edges", async () => {
  const screen = await reader({ currentChapter: 50 });
  await fireEvent.press(screen.getByRole("button", { name: "Next chapter" }));
  expect(
    screen.getByRole("button", { name: "Choose passage: Exodus 1" }),
  ).toBeTruthy();
  await swipe(120);
  expect(
    screen.getByRole("button", { name: "Choose passage: Genesis 50" }),
  ).toBeTruthy();
  await screen.unmount();
  const beginning = await reader();
  expect(
    beginning.getByRole("button", { name: "Previous chapter" }).props
      .accessibilityState.disabled,
  ).toBe(true);
  await swipe(120);
  expect(
    beginning.getByRole("button", { name: "Choose passage: Genesis 1" }),
  ).toBeTruthy();
  await beginning.unmount();
  const end = await reader({
    currentBookName: "Revelation of John",
    currentChapter: 22,
  });
  expect(
    end.getByRole("button", { name: "Next chapter" }).props.accessibilityState
      .disabled,
  ).toBe(true);
  await swipe(-120);
  expect(
    end.getByRole("button", { name: "Choose passage: Revelation of John 22" }),
  ).toBeTruthy();
});

test("secondary-only navigation offers the visible KJV catalogue, including Psalms", async () => {
  const screen = await reader({
    primaryVersion: "neb",
    secondaryVersion: "kjv",
    singlePane: "secondary",
    currentBookName: "Malachi",
    currentChapter: 4,
  });
  await fireEvent.press(
    screen.getByRole("button", { name: "Choose passage: Malachi 4" }),
  );
  expect(
    screen.getByRole("button", { name: "Malachi chapter 4" }),
  ).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("button", { name: "Choose book: Malachi" }),
  );
  await fireEvent.changeText(screen.getByLabelText("Search books"), "Psalms");
  await fireEvent.press(screen.getByRole("button", { name: "Choose Psalms" }));
  await fireEvent.press(
    screen.getByRole("button", { name: "Psalms chapter 150" }),
  );
  expect(
    screen.getByRole("button", { name: "Choose passage: Psalms 150" }),
  ).toBeTruthy();
  await swipe(-120);
  expect(
    screen.getByRole("button", { name: "Choose passage: Proverbs 1" }),
  ).toBeTruthy();
});

test("an Armenian-only picker excludes withheld books", async () => {
  const screen = await reader({ primaryVersion: "neb" });
  await fireEvent.press(
    screen.getByRole("button", { name: /^Choose passage:/ }),
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Choose book: Genesis" }),
  );
  await fireEvent.changeText(screen.getByLabelText("Search books"), "Psalms");
  expect(screen.getByText("No matching books")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Choose Psalms" })).toBeNull();
});

test("navigation skips missing chapter numbers and empty books", () => {
  const book = (name: string, numbers: number[]): Book => ({
    name,
    chapters: numbers.map((chapter) => ({ chapter, verses: [] })),
  });
  const books = [
    book("First", [1, 3]),
    book("Unavailable", []),
    book("Second", [2, 5]),
  ];
  expect(getAdjacentPassage(books, "First", 1, 1)).toEqual({
    bookName: "First",
    chapter: 3,
  });
  expect(getAdjacentPassage(books, "First", 3, 1)).toEqual({
    bookName: "Second",
    chapter: 2,
  });
  expect(getAdjacentPassage(books, "Second", 2, -1)).toEqual({
    bookName: "First",
    chapter: 3,
  });
  expect(getAdjacentPassage(books, "First", 1, -1)).toBeUndefined();
  expect(getAdjacentPassage(books, "Second", 5, 1)).toBeUndefined();
});
