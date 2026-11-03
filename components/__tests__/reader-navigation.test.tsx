import { beforeEach, expect, jest, test } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";
import type { ReactNode } from "react";
import { GestureHandlerRootView, State } from "react-native-gesture-handler";
import {
  fireGestureHandler,
  getByGestureTestId,
} from "react-native-gesture-handler/jest-utils";
import ReaderScreen from "@/app/(tabs)/bible";
import SettingsScreen from "@/app/(tabs)/explore";
import HomeScreen from "@/app/(tabs)/index";
import { router, useLocalSearchParams } from "expo-router";
import { useIsFocused } from "expo-router/react-navigation";
import {
  AppearanceProvider,
  useAppearance,
} from "@/contexts/appearance-context";
import { getChapterByName } from "@/services/bible-service";
import {
  BibleProvider,
  READER_STORAGE_KEY,
  useBible,
} from "@/contexts/bible-context";
import { getAdjacentPassage } from "@/utils/reader-navigation";
import * as scrollLinks from "@/utils/linked-verse-scroll";
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
jest.mock("@/components/display-regions-observer", () => {
  const { View } =
    jest.requireActual<typeof import("react-native")>("react-native");
  return {
    DisplayRegionsObserver: (props: Record<string, unknown>) => (
      <View {...props} testID="display-regions" />
    ),
  };
});
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: jest.fn(() => ({})),
  router: {
    canGoBack: () => false,
    back: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
    navigate: jest.fn(),
    setParams: jest.fn(),
  },
}));
jest.mock("expo-router/react-navigation", () => ({
  useIsFocused: jest.fn(() => true),
}));

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  jest.mocked(useIsFocused).mockReturnValue(true);
  jest.mocked(useLocalSearchParams).mockReturnValue({});
});

function ReadyReader() {
  const { isReady } = useBible();
  const { isReady: appearanceReady } = useAppearance();
  return isReady && appearanceReady ? <ReaderScreen /> : null;
}

function TestProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView>
      <AppearanceProvider>
        <BibleProvider>{children}</BibleProvider>
      </AppearanceProvider>
    </GestureHandlerRootView>
  );
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
    <TestProviders>
      <ReadyReader />
    </TestProviders>,
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

test("choosing a library book leaves the continue card and stored passage unchanged until the reader opens", async () => {
  const screen = await reader({ currentBookName: "John", currentChapter: 3 });
  await screen.rerender(
    <TestProviders>
      <HomeScreen />
    </TestProviders>,
  );
  const previousVerse = getChapterByName("kjv", "John", 3)!.verses[0].text;
  await fireEvent.press(
    screen.getByRole("button", { name: "Read Exodus, 40 chapters" }),
  );
  expect(router.navigate).toHaveBeenCalledWith({
    pathname: "/bible",
    params: { book: "Exodus" },
  });
  expect(
    screen.getByRole("button", { name: "Continue reading John chapter 3" }),
  ).toBeTruthy();
  expect(screen.getByText(previousVerse)).toBeTruthy();
  expect(
    JSON.parse((await AsyncStorage.getItem(READER_STORAGE_KEY))!),
  ).toMatchObject({ currentBookName: "John", currentChapter: 3 });
});

test("the reader applies a requested book only when focused, and never replays it on return", async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ book: "Exodus" });
  jest.mocked(useIsFocused).mockReturnValue(false);
  const screen = await reader({ currentBookName: "John", currentChapter: 3 });
  expect(
    screen.getByRole("button", { name: "Choose passage: John 3" }),
  ).toBeTruthy();
  expect(
    JSON.parse((await AsyncStorage.getItem(READER_STORAGE_KEY))!),
  ).toMatchObject({ currentBookName: "John", currentChapter: 3 });
  jest.mocked(useIsFocused).mockReturnValue(true);
  await screen.rerender(
    <TestProviders>
      <ReadyReader />
    </TestProviders>,
  );
  expect(
    screen.getByRole("button", { name: "Choose passage: Exodus 1" }),
  ).toBeTruthy();
  await waitFor(async () =>
    expect(
      JSON.parse((await AsyncStorage.getItem(READER_STORAGE_KEY))!),
    ).toMatchObject({ currentBookName: "Exodus", currentChapter: 1 }),
  );
  expect(router.setParams).toHaveBeenCalledWith({ book: undefined });
  await swipe(-120);
  jest.mocked(useIsFocused).mockReturnValue(false);
  await screen.rerender(
    <TestProviders>
      <ReadyReader />
    </TestProviders>,
  );
  jest.mocked(useIsFocused).mockReturnValue(true);
  await screen.rerender(
    <TestProviders>
      <ReadyReader />
    </TestProviders>,
  );
  expect(
    screen.getByRole("button", { name: "Choose passage: Exodus 2" }),
  ).toBeTruthy();
});

test("the persistent Bible tab can reopen the same library book at its first chapter", async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ book: "Exodus" });
  const screen = await reader();
  await swipe(-120);
  expect(
    screen.getByRole("button", { name: "Choose passage: Exodus 2" }),
  ).toBeTruthy();
  jest.mocked(useLocalSearchParams).mockReturnValue({});
  await screen.rerender(
    <TestProviders>
      <ReadyReader />
    </TestProviders>,
  );
  jest.mocked(useLocalSearchParams).mockReturnValue({ book: "Exodus" });
  await screen.rerender(
    <TestProviders>
      <ReadyReader />
    </TestProviders>,
  );
  expect(
    screen.getByRole("button", { name: "Choose passage: Exodus 1" }),
  ).toBeTruthy();
});

test("Continue reading selects the Bible tab without changing the saved passage", async () => {
  const screen = await reader({ currentBookName: "John", currentChapter: 3 });
  await screen.rerender(
    <TestProviders>
      <HomeScreen />
    </TestProviders>,
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Continue reading John chapter 3" }),
  );
  expect(router.navigate).toHaveBeenCalledWith("/bible");
  expect(
    JSON.parse((await AsyncStorage.getItem(READER_STORAGE_KEY))!),
  ).toMatchObject({ currentBookName: "John", currentChapter: 3 });
});

function UpdateReadingPlace() {
  const { setPassage } = useBible();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Update reading place"
      onPress={() => setPassage("Exodus", 2)}
    >
      <Text>Update</Text>
    </TouchableOpacity>
  );
}

test("the outgoing home preview stays frozen as the reader changes passage and refreshes on return", async () => {
  const screen = await reader({ currentBookName: "John", currentChapter: 3 });
  const home = (
    <TestProviders>
      <HomeScreen />
      <UpdateReadingPlace />
    </TestProviders>
  );
  await screen.rerender(home);
  await fireEvent.press(
    screen.getByRole("button", { name: "Read Exodus, 40 chapters" }),
  );
  jest.mocked(useIsFocused).mockReturnValue(false);
  await screen.rerender(home);
  await fireEvent.press(
    screen.getByRole("button", { name: "Update reading place" }),
  );
  expect(
    screen.getByRole("button", { name: "Continue reading John chapter 3" }),
  ).toBeTruthy();
  expect(
    screen.getByText(getChapterByName("kjv", "John", 3)!.verses[0].text),
  ).toBeTruthy();
  jest.mocked(useIsFocused).mockReturnValue(true);
  // A new element models the navigation focus update even though context is unchanged.
  await screen.rerender(
    <TestProviders>
      <HomeScreen />
      <UpdateReadingPlace />
    </TestProviders>,
  );
  expect(
    screen.getByRole("button", { name: "Continue reading Exodus chapter 2" }),
  ).toBeTruthy();
  expect(
    screen.getByText(getChapterByName("kjv", "Exodus", 2)!.verses[0].text),
  ).toBeTruthy();
});

test("a requested book missing from the visible edition preserves the saved passage", async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ book: "Esther" });
  const screen = await reader({
    primaryVersion: "neb",
    secondaryVersion: "kjv",
    currentBookName: "John",
    currentChapter: 3,
  });
  expect(
    screen.getByRole("button", { name: "Choose passage: John 3" }),
  ).toBeTruthy();
});

test("an opened dual display puts translations on opposite sides of the fold without replacing the saved layout", async () => {
  const original = Dimensions.get("window");
  await act(() =>
    Dimensions.set({ window: { ...original, width: 750, height: 850 } }),
  );
  try {
    const screen = await reader({
      showDualView: true,
      comparisonLayout: "stacked",
    });
    const width = 750;
    const report = {
      width,
      height: 600,
      divisions: [{ x: 350, y: 0, width: 50, height: 600 }],
    };
    await fireEvent(screen.getByTestId("display-regions"), "regionsChange", {
      nativeEvent: report,
    });
    const primary = StyleSheet.flatten(
      screen.getByTestId("parallel-header-kjv").props.style,
    );
    const secondary = StyleSheet.flatten(
      screen.getByTestId("parallel-header-neb").props.style,
    );
    expect(primary.width).toBe(333);
    expect(secondary.width).toBe(333);
    expect(
      StyleSheet.flatten(screen.getByTestId("parallel-verse-1").props.style)
        .gap,
    ).toBe(50);
    await fireEvent.press(
      screen.getByRole("button", { name: "Reading options" }),
    );
    expect(
      screen.getByRole("radio", { name: "Side by side" }).props
        .accessibilityState.checked,
    ).toBe(true);
    expect(
      screen.getByRole("radio", { name: "Stacked" }).props.accessibilityState
        .disabled,
    ).toBe(true);
    await fireEvent.press(screen.getByRole("radio", { name: "Side by side" }));
    expect(
      JSON.parse((await AsyncStorage.getItem(READER_STORAGE_KEY))!)
        .comparisonLayout,
    ).toBe("stacked");
    await fireEvent.press(
      screen.getByRole("button", { name: "Close reading options" }),
    );
    await fireEvent(screen.getByTestId("display-regions"), "regionsChange", {
      nativeEvent: { width, height: 600, divisions: [] },
    });
    expect(screen.getByTestId("chapter-scroll-kjv")).toBeTruthy();
    expect(screen.getByTestId("chapter-scroll-neb")).toBeTruthy();
    expect(screen.queryByTestId("parallel-verse-1")).toBeNull();
    await screen.unmount();
  } finally {
    await act(() => Dimensions.set({ window: original }));
  }
});

test("closing the Duo reflows both translations immediately using the reader size, without changing chapter", async () => {
  const screen = await reader({
    showDualView: true,
    comparisonLayout: "side-by-side",
    currentBookName: "John",
    currentChapter: 4,
  });
  const resize = (width: number, height: number) =>
    fireEvent(screen.getByTestId("reader-viewport"), "layout", {
      nativeEvent: { layout: { x: 0, y: 0, width, height } },
    });
  const columnWidth = (version: string) =>
    StyleSheet.flatten(screen.getByTestId(`parallel-header-${version}`).props.style)
      .width;

  // Neither the dock-reduced reader nor the new front screen need match the
  // global Dimensions value. Native fold events may arrive after layout.
  await resize(800, 600);
  await fireEvent(screen.getByTestId("display-regions"), "regionsChange", {
    nativeEvent: {
      width: 800,
      height: 600,
      divisions: [{ x: 400, y: 0, width: 0, height: 600 }],
    },
  });
  expect(columnWidth("kjv")).toBe(371);
  expect(columnWidth("neb")).toBe(371);
  expect(screen.queryByTestId("parallel-divider", { includeHiddenElements: true })).toBeNull();

  await resize(466, 520);
  expect(columnWidth("kjv")).toBe(216);
  expect(columnWidth("neb")).toBe(216);
  expect(
    StyleSheet.flatten(screen.getByTestId("parallel-neb-verse-1").props.style)
      .width,
  ).toBe(216);
  expect(screen.getByTestId("parallel-divider", { includeHiddenElements: true })).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Choose passage: John 4" }),
  ).toBeTruthy();

  await fireEvent(screen.getByTestId("display-regions"), "regionsChange", {
    nativeEvent: { width: 466, height: 520, divisions: [] },
  });
  expect(columnWidth("kjv")).toBe(216);

  // Reopening reinstates the fold only when its geometry matches this reader.
  await resize(800, 600);
  expect(screen.getByTestId("parallel-divider", { includeHiddenElements: true })).toBeTruthy();
  await fireEvent(screen.getByTestId("display-regions"), "regionsChange", {
    nativeEvent: {
      width: 800,
      height: 600,
      divisions: [{ x: 400, y: 0, width: 0, height: 600 }],
    },
  });
  expect(columnWidth("kjv")).toBe(371);
  expect(screen.queryByTestId("parallel-divider", { includeHiddenElements: true })).toBeNull();
});

test("a rotated fold uses two linked panes while single-translation reading remains available", async () => {
  const screen = await reader({
    showDualView: true,
    comparisonLayout: "side-by-side",
    currentChapter: 3,
  });
  await fireEvent(screen.getByTestId("display-regions"), "regionsChange", {
    nativeEvent: {
      width: Dimensions.get("window").width,
      height: 600,
      divisions: [
        { x: 0, y: 200, width: Dimensions.get("window").width, height: 40 },
      ],
    },
  });
  expect(
    StyleSheet.flatten(screen.getByTestId("comparison-pane-kjv").props.style)
      .height,
  ).toBe(200);
  expect(
    StyleSheet.flatten(screen.getByTestId("comparison-pane-neb").props.style)
      .height,
  ).toBe(360);
  expect(
    screen.getByRole("button", { name: "Choose passage: Genesis 3" }),
  ).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("button", { name: "Reading options" }),
  );
  await fireEvent.press(screen.getByRole("radio", { name: "Primary only" }));
  await fireEvent.press(
    screen.getByRole("button", { name: "Close reading options" }),
  );
  expect(screen.getByTestId("chapter-scroll-kjv")).toBeTruthy();
  expect(screen.queryByTestId("chapter-scroll-neb")).toBeNull();
  expect(
    JSON.parse((await AsyncStorage.getItem(READER_STORAGE_KEY))!)
      .comparisonLayout,
  ).toBe("side-by-side");
});

test("stacked panes measure verses and scrolling either translation moves its companion", async () => {
  const link = scrollLinks.createLinkedVerseScroll();
  const moves = [
    jest.fn<(y: number) => void>(),
    jest.fn<(y: number) => void>(),
  ];
  const attach = link.attach;
  jest.spyOn(link, "attach").mockImplementation((index, scrollTo) => {
    attach(
      index,
      scrollTo
        ? (y) => {
            moves[index](y);
            scrollTo(y);
          }
        : undefined,
    );
  });
  const factory = jest
    .spyOn(scrollLinks, "createLinkedVerseScroll")
    .mockReturnValueOnce(link);
  try {
    const screen = await reader({
      showDualView: true,
      comparisonLayout: "stacked",
    });
    const primary = screen.getByTestId("chapter-scroll-kjv");
    const secondary = screen.getByTestId("chapter-scroll-neb");
    for (const pane of [primary, secondary]) {
      await fireEvent(pane, "layout", {
        nativeEvent: { layout: { height: 200 } },
      });
    }
    await fireEvent(primary, "contentSizeChange", 300, 1000);
    await fireEvent(secondary, "contentSizeChange", 300, 1200);
    for (const [version, offsets] of [
      ["kjv", [20, 120, 320]],
      ["neb", [20, 220, 420]],
    ] as const) {
      for (const [index, y] of offsets.entries()) {
        await fireEvent(
          screen.getByTestId(`chapter-${version}-verse-${index + 1}`),
          "layout",
          { nativeEvent: { layout: { y } } },
        );
      }
    }
    await fireEvent(primary, "scrollBeginDrag");
    await fireEvent.scroll(primary, {
      nativeEvent: { contentOffset: { y: 120 } },
    });
    expect(moves[1]).toHaveBeenLastCalledWith(220);
    moves[0].mockClear();
    await fireEvent.scroll(secondary, {
      nativeEvent: { contentOffset: { y: 220 } },
    });
    expect(moves[0]).not.toHaveBeenCalled();
    await fireEvent(secondary, "scrollBeginDrag");
    await fireEvent.scroll(secondary, {
      nativeEvent: { contentOffset: { y: 320 } },
    });
    expect(moves[0]).toHaveBeenLastCalledWith(220);
    await screen.unmount();
  } finally {
    factory.mockRestore();
  }
});

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
      String(
        jest
          .mocked(AsyncStorage.setItem)
          .mock.calls.filter(([key]) => key === READER_STORAGE_KEY)
          .at(-1)?.[1],
      ),
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

test("chapter swipes cross book boundaries and stop at Bible edges without reader back/footer controls", async () => {
  const screen = await reader({ currentChapter: 50 });
  expect(screen.queryByRole("button", { name: "Back to library" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Next chapter" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Previous chapter" })).toBeNull();
  await swipe(-120);
  expect(
    screen.getByRole("button", { name: "Choose passage: Exodus 1" }),
  ).toBeTruthy();
  await swipe(120);
  expect(
    screen.getByRole("button", { name: "Choose passage: Genesis 50" }),
  ).toBeTruthy();
  await screen.unmount();
  const beginning = await reader();
  await swipe(120);
  expect(
    beginning.getByRole("button", { name: "Choose passage: Genesis 1" }),
  ).toBeTruthy();
  await beginning.unmount();
  const end = await reader({
    currentBookName: "Revelation of John",
    currentChapter: 22,
  });
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

test("reader and Settings share live text size, theme and appearance controls", async () => {
  const screen = await reader();
  const verse = getChapterByName("kjv", "Genesis", 1)!.verses[0].text;
  const fontSize = () =>
    StyleSheet.flatten(screen.getByText(verse).props.style).fontSize;
  expect(fontSize()).toBe(19);
  await fireEvent.press(
    screen.getByRole("button", { name: "Reading options" }),
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Increase reading text size" }),
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Increase reading text size" }),
  );
  expect(screen.getByLabelText("Reading text size: 120%")).toBeTruthy();
  await fireEvent.press(screen.getByRole("radio", { name: "Cream theme" }));
  await fireEvent.press(screen.getByRole("radio", { name: "Dark appearance" }));
  expect(
    screen.getByRole("radio", { name: "Cream theme" }).props.accessibilityState
      .checked,
  ).toBe(true);
  expect(
    screen.getByRole("radio", { name: "Dark appearance" }).props
      .accessibilityState.checked,
  ).toBe(true);
  await fireEvent.press(
    screen.getByRole("button", { name: "Close reading options" }),
  );
  expect(fontSize()).toBeCloseTo(22.8);

  await screen.rerender(
    <TestProviders>
      <SettingsScreen />
    </TestProviders>,
  );
  expect(screen.getByLabelText("Reading text size: 120%")).toBeTruthy();
  expect(
    screen.getByRole("radio", { name: "Cream theme" }).props.accessibilityState
      .checked,
  ).toBe(true);
  expect(
    screen.getByRole("radio", { name: "Dark appearance" }).props
      .accessibilityState.checked,
  ).toBe(true);
  await fireEvent.press(
    screen.getByRole("button", { name: "Increase reading text size" }),
  );
  await fireEvent.press(screen.getByRole("radio", { name: "Ocean theme" }));
  await fireEvent.press(
    screen.getByRole("radio", { name: "Light appearance" }),
  );

  await screen.rerender(
    <TestProviders>
      <ReadyReader />
    </TestProviders>,
  );
  expect(fontSize()).toBeCloseTo(24.7);
  await fireEvent.press(
    screen.getByRole("button", { name: "Reading options" }),
  );
  expect(
    screen.getByRole("radio", { name: "Ocean theme" }).props.accessibilityState
      .checked,
  ).toBe(true);
  expect(
    screen.getByRole("radio", { name: "Light appearance" }).props
      .accessibilityState.checked,
  ).toBe(true);
  await fireEvent.press(
    screen.getByRole("button", { name: "Reset reading text size" }),
  );
  expect(screen.getByLabelText("Reading text size: 100%")).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("button", { name: "Close reading options" }),
  );
  expect(fontSize()).toBe(19);
});

test("text size is bounded and both reading panes scale together", async () => {
  const screen = await reader({ showDualView: true });
  await fireEvent.press(
    screen.getByRole("button", { name: "Reading options" }),
  );
  for (let n = 0; n < 8; n++)
    await fireEvent.press(
      screen.getByRole("button", { name: "Increase reading text size" }),
    );
  expect(screen.getByLabelText("Reading text size: 180%")).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Increase reading text size" }).props
      .accessibilityState.disabled,
  ).toBe(true);
  await fireEvent.press(
    screen.getByRole("button", { name: "Close reading options" }),
  );
  for (const version of ["kjv", "neb"]) {
    const verse = getChapterByName(version, "Genesis", 1)!.verses[0].text;
    expect(
      StyleSheet.flatten(screen.getByText(verse).props.style).fontSize,
    ).toBeCloseTo(34.2);
    expect(
      StyleSheet.flatten(screen.getByText(verse).props.style).lineHeight,
    ).toBeCloseTo(57.6);
  }
  expect(
    screen.getByTestId("parallel-divider", { includeHiddenElements: true }),
  ).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("button", { name: "Reading options" }),
  );
  for (let n = 0; n < 10; n++)
    await fireEvent.press(
      screen.getByRole("button", { name: "Decrease reading text size" }),
    );
  expect(screen.getByLabelText("Reading text size: 80%")).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Decrease reading text size" }).props
      .accessibilityState.disabled,
  ).toBe(true);
});

test("reading options retains the four layouts without changing the passage", async () => {
  const screen = await reader({ currentBookName: "John", currentChapter: 3 });
  await fireEvent.press(
    screen.getByRole("button", { name: "Reading options" }),
  );
  for (const layout of [
    "Secondary only",
    "Side by side",
    "Stacked",
    "Primary only",
  ]) {
    await fireEvent.press(screen.getByRole("radio", { name: layout }));
    expect(
      screen.getByRole("radio", { name: layout }).props.accessibilityState
        .checked,
    ).toBe(true);
    expect(screen.getByText("Reading options")).toBeTruthy();
  }
  await fireEvent.press(
    screen.getByRole("button", { name: "Close reading options" }),
  );
  expect(
    screen.getByRole("button", { name: "Choose passage: John 3" }),
  ).toBeTruthy();
});
