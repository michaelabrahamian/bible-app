import { expect, jest, test } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";
import type { LayoutChangeEvent, ScrollView } from "react-native";
import type { ComponentRef } from "react";
import { useScrollToSelection } from "@/hooks/use-scroll-to-selection";

const layout = (y: number, height: number) =>
  ({
    nativeEvent: { layout: { x: 0, y, width: 320, height } },
  }) as LayoutChangeEvent;

async function setup() {
  const { result } = await renderHook(useScrollToSelection);
  const scrollTo = jest.fn<ComponentRef<typeof ScrollView>["scrollTo"]>();
  result.current.attach({ scrollTo });
  return { scroll: result.current, scrollTo };
}

test.each([
  ["selection", "viewport", "content"],
  ["selection", "content", "viewport"],
  ["viewport", "selection", "content"],
  ["viewport", "content", "selection"],
  ["content", "selection", "viewport"],
  ["content", "viewport", "selection"],
] as const)(
  "reveals the selection after all measurements arrive: %s, %s, %s",
  async (...order) => {
    const { scroll, scrollTo } = await setup();
    const events = {
      selection: () => scroll.onSelectionLayout(layout(500, 52)),
      viewport: () => scroll.onLayout(layout(0, 300)),
      content: () => scroll.onContentSizeChange(320, 2000),
    };
    await act(() => {
      events[order[0]]();
      events[order[1]]();
    });
    expect(scrollTo).not.toHaveBeenCalled();
    await act(() => events[order[2]]());
    expect(scrollTo).toHaveBeenLastCalledWith({ y: 376, animated: false });
  },
);

test("keeps the first and last options within the scrollable bounds", async () => {
  const { scroll, scrollTo } = await setup();
  await act(() => {
    scroll.onLayout(layout(0, 300));
    scroll.onContentSizeChange(320, 1688);
    scroll.onSelectionLayout(layout(0, 72));
  });
  expect(scrollTo).toHaveBeenLastCalledWith({ y: 0, animated: false });
  await act(() => scroll.onSelectionLayout(layout(1600, 72)));
  expect(scrollTo).toHaveBeenLastCalledWith({ y: 1388, animated: false });
});

test("retries when native content sizing finishes after an initially clamped scroll", async () => {
  const { scroll, scrollTo } = await setup();
  await act(() => {
    scroll.onLayout(layout(0, 300));
    scroll.onSelectionLayout(layout(1000, 48));
    scroll.onContentSizeChange(320, 100);
  });
  expect(scrollTo).toHaveBeenLastCalledWith({ y: 0, animated: false });
  await act(() => scroll.onContentSizeChange(320, 2000));
  expect(scrollTo).toHaveBeenLastCalledWith({ y: 874, animated: false });
});

test("unchanged layout reports do not fight the user's subsequent scrolling", async () => {
  const { scroll, scrollTo } = await setup();
  const measure = () => {
    scroll.onLayout(layout(0, 300));
    scroll.onContentSizeChange(320, 2000);
    scroll.onSelectionLayout(layout(500, 52));
  };
  await act(measure);
  scrollTo.mockClear();
  await act(measure);
  expect(scrollTo).not.toHaveBeenCalled();
});

test("new book or search results use fresh measurements when their list mounts", async () => {
  const { scroll } = await setup();
  await act(() => {
    scroll.onLayout(layout(0, 300));
    scroll.onContentSizeChange(320, 2000);
    scroll.onSelectionLayout(layout(1500, 52));
  });
  const nextScroll = jest.fn<ComponentRef<typeof ScrollView>["scrollTo"]>();
  await act(() => {
    scroll.attach(null);
    scroll.attach({ scrollTo: nextScroll });
  });
  expect(nextScroll).not.toHaveBeenCalled();
  await act(() => {
    scroll.onSelectionLayout(layout(400, 52));
    scroll.onLayout(layout(0, 300));
  });
  expect(nextScroll).not.toHaveBeenCalled();
  await act(() => scroll.onContentSizeChange(320, 900));
  expect(nextScroll).toHaveBeenLastCalledWith({ y: 276, animated: false });
});

test("large-text and viewport changes keep the selected option visible", async () => {
  const { scroll, scrollTo } = await setup();
  await act(() => {
    scroll.onLayout(layout(0, 300));
    scroll.onContentSizeChange(320, 2000);
    scroll.onSelectionLayout(layout(500, 52));
  });
  await act(() => {
    scroll.onSelectionLayout(layout(700, 180));
    scroll.onLayout(layout(0, 100));
  });
  expect(scrollTo).toHaveBeenLastCalledWith({ y: 700, animated: false });
});
