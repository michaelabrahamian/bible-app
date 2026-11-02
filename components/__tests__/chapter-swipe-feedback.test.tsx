import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AccessibilityInfo, Platform } from "react-native";
import { useChapterSwipeFeedback } from "@/hooks/use-chapter-swipe-feedback";

beforeEach(() => {
  jest.useFakeTimers();
  // Run the same timing animation with the JS driver so its frames are observable.
  jest.replaceProperty(Platform, "OS", "web");
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(false);
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

async function feedback() {
  const hook = await renderHook(useChapterSwipeFeedback, {
    initialProps: {
      enabled: true,
      width: 400,
      passage: "Genesis:1",
      canGoPrevious: true,
      canGoNext: true,
    },
  });
  await waitFor(() => expect(hook.result.current.reduceMotion).toBe(false));
  await act(() => hook.result.current.start());
  const changes = jest.fn<(state: { value: number }) => void>();
  hook.result.current.offset.addListener(changes);
  return { ...hook, changes };
}

test("the preview follows both drag directions and stays much shorter than the swipe", async () => {
  const { result, changes } = await feedback();
  await act(() => result.current.update(-50, 0));
  expect(changes).toHaveBeenLastCalledWith({ value: -12 });
  await act(() => result.current.update(-400, 0));
  expect(changes).toHaveBeenLastCalledWith({ value: -28 });
  await act(() => result.current.update(400, 0));
  expect(changes).toHaveBeenLastCalledWith({ value: 28 });
});

test("finishing or cancelling settles displaced text back to its original position", async () => {
  const { result, changes } = await feedback();
  await act(() => result.current.update(-80, 0));
  expect(changes.mock.lastCall![0].value).toBeLessThan(0);
  await act(() => result.current.finish());
  await act(() => jest.advanceTimersByTime(250));
  expect(changes.mock.lastCall![0].value).toBeCloseTo(0);
});

test("vertical scrolling does not displace text, and Bible edges have more resistance", async () => {
  const { result, rerender, changes } = await feedback();
  await act(() => result.current.update(20, 150));
  expect(changes).not.toHaveBeenCalled();
  await rerender({
    enabled: true,
    width: 400,
    passage: "Genesis:1",
    canGoPrevious: false,
    canGoNext: true,
  });
  await act(() => result.current.update(200, 0));
  expect(changes).toHaveBeenLastCalledWith({ value: 8 });
  await act(() => result.current.update(-200, 0));
  expect(changes).toHaveBeenLastCalledWith({ value: -28 });
});

test("opening a menu or resizing clears the preview immediately", async () => {
  const { result, rerender, changes } = await feedback();
  await act(() => result.current.update(-100, 0));
  await rerender({
    enabled: false,
    width: 400,
    passage: "Genesis:1",
    canGoPrevious: true,
    canGoNext: true,
  });
  expect(changes).toHaveBeenLastCalledWith({ value: 0 });
  changes.mockClear();
  await act(() => result.current.update(-100, 0));
  expect(changes).not.toHaveBeenCalled();
  await rerender({
    enabled: true,
    width: 800,
    passage: "Genesis:1",
    canGoPrevious: true,
    canGoNext: true,
  });
  expect(changes).toHaveBeenLastCalledWith({ value: 0 });
});

test("Reduce Motion changes take effect immediately and stop further displacement", async () => {
  const subscription = jest.spyOn(AccessibilityInfo, "addEventListener");
  const { result, changes } = await feedback();
  await act(() => result.current.update(-100, 0));
  const updatePreference = subscription.mock.calls.find(
    ([event]) => event === "reduceMotionChanged",
  )![1];
  await act(() => updatePreference(true));
  expect(result.current.reduceMotion).toBe(true);
  expect(changes).toHaveBeenLastCalledWith({ value: 0 });
  changes.mockClear();
  await act(() => result.current.update(-100, 0));
  expect(changes).not.toHaveBeenCalled();
});

test("a new chapter clears a stuck preview even when gesture finalization is missing", async () => {
  const { result, rerender, changes } = await feedback();
  const outgoingOffset = result.current.offset;
  await act(() => result.current.update(-120, 0));
  expect(changes).toHaveBeenLastCalledWith({ value: -28 });
  // The chapter renders before the recognizer delivers its final event.
  await rerender({
    enabled: true,
    width: 400,
    passage: "Genesis:2",
    canGoPrevious: true,
    canGoNext: true,
  });
  expect(result.current.offset).not.toBe(outgoingOffset);
  let currentOffset: number | undefined;
  await act(() =>
    result.current.offset.stopAnimation((value) => {
      currentOffset = value;
    }),
  );
  expect(currentOffset).toBe(0);
  // Simulate a delayed completion from the previous chapter's animation.
  await act(() => outgoingOffset.setValue(-28));
  await act(() => jest.advanceTimersByTime(250));
  await act(() =>
    result.current.offset.stopAnimation((value) => {
      currentOffset = value;
    }),
  );
  expect(currentOffset).toBe(0);
  result.current.offset.addListener(changes);
  await act(() => result.current.start());
  await act(() => result.current.update(50, 0));
  expect(changes).toHaveBeenLastCalledWith({ value: 12 });
});

test("starting another swipe cancels the previous settling animation", async () => {
  const { result, changes } = await feedback();
  await act(() => result.current.update(-100, 0));
  await act(() => result.current.finish());
  await act(() => jest.advanceTimersByTime(60));
  await act(() => {
    result.current.start();
    result.current.update(100, 0);
  });
  await act(() => jest.advanceTimersByTime(250));
  expect(changes).toHaveBeenLastCalledWith({ value: 24 });
  await act(() => result.current.finish());
  await act(() => jest.advanceTimersByTime(250));
  expect(changes.mock.lastCall![0].value).toBeCloseTo(0);
});

test("late pan updates after a chapter change cannot shift the incoming text", async () => {
  const { result, rerender } = await feedback();
  await act(() => result.current.update(-120, 0));
  await act(() => result.current.finish());
  await rerender({
    enabled: true,
    width: 400,
    passage: "Genesis:2",
    canGoPrevious: true,
    canGoNext: true,
  });
  await act(() => result.current.update(-120, 0));
  let position: number | undefined;
  await act(() =>
    result.current.offset.stopAnimation((value) => {
      position = value;
    }),
  );
  expect(position).toBe(0);
});

test("committing a swipe clears its native offset before chapter views are replaced", async () => {
  const { result, changes } = await feedback();
  await act(() => result.current.update(-120, 0));
  expect(changes).toHaveBeenLastCalledWith({ value: -28 });
  await act(() => result.current.reset());
  expect(changes).toHaveBeenLastCalledWith({ value: 0 });
  changes.mockClear();
  await act(() => result.current.update(-120, 0));
  expect(changes).not.toHaveBeenCalled();
  await act(() => jest.advanceTimersByTime(250));
  let position: number | undefined;
  await act(() =>
    result.current.offset.stopAnimation((value) => {
      position = value;
    }),
  );
  expect(position).toBe(0);
});
