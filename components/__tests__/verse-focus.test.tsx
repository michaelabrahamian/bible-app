import { expect, jest, test } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";
import type { LayoutChangeEvent } from "react-native";
import { useScrollToSelection } from "@/hooks/use-scroll-to-selection";

test("ending verse focus stops later font or viewport changes from pulling the reader back", async () => {
  const { result, rerender } = await renderHook(useScrollToSelection, { initialProps: true });
  const scrollTo = jest.fn();
  const view = { scrollTo };
  const layout = (y: number, height: number) => ({ nativeEvent: { layout: { x: 0, y, width: 320, height } } }) as LayoutChangeEvent;
  await act(() => {
    result.current.attach(view);
    result.current.onLayout(layout(0, 300));
    result.current.onContentSizeChange(320, 2000);
    result.current.onSelectionLayout(layout(1000, 100));
  });
  expect(scrollTo).toHaveBeenCalledWith({ y: 900, animated: false });
  await rerender(false);
  scrollTo.mockClear();
  await act(() => {
    result.current.onLayout(layout(0, 500));
    result.current.onContentSizeChange(320, 3000);
  });
  expect(scrollTo).not.toHaveBeenCalled();
});
