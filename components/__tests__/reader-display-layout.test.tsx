import { expect, test } from "@jest/globals";
import {
  getReaderDisplaySplit,
  getReaderHorizontalPadding,
  type DisplayRegion,
} from "@/utils/reader-display-layout";

const layout = (
  divisions: DisplayRegion[],
  padding = { left: 16, right: 16 },
) => getReaderDisplaySplit({ width: 800, height: 600, divisions }, padding);

test("fully opened displays keep two panes around an inactive zero-width fold", () => {
  expect(layout([{ x: 400, y: 0, width: 0, height: 600 }])).toEqual({
    axis: "vertical",
    primary: 372,
    secondary: 372,
    gap: 24,
  });
});

test("uses the actual off-center fold frame, not the center of the window", () => {
  expect(layout([{ x: 300, y: -100, width: 40, height: 800 }])).toEqual({
    axis: "vertical",
    primary: 284,
    secondary: 444,
    gap: 40,
  });
});

test("honours asymmetric safe-area padding on each side independently", () => {
  expect(
    layout([{ x: 400, y: 0, width: 0, height: 600 }], { left: 76, right: 24 }),
  ).toEqual({ axis: "vertical", primary: 312, secondary: 364, gap: 24 });
});

test("the native side dock gets less extra spacing without entering its reserved area", () => {
  expect(getReaderHorizontalPadding({ left: 0, right: 84 }, true)).toEqual({
    left: 16,
    right: 88,
  });
  expect(getReaderHorizontalPadding({ left: 84, right: 0 }, true)).toEqual({
    left: 88,
    right: 16,
  });
  expect(getReaderHorizontalPadding({ left: 0, right: 84 }, false)).toEqual({
    left: 16,
    right: 100,
  });
});

test("a rotated horizontal fold divides the local reading height around its gutter", () => {
  expect(layout([{ x: 0, y: 260, width: 800, height: 40 }])).toEqual({
    axis: "horizontal",
    primary: 260,
    secondary: 300,
    gap: 40,
  });
});

test("closed, unsupported, and single-half multitasking windows keep their preferred layout", () => {
  expect(getReaderDisplaySplit(null, { left: 16, right: 16 })).toBeNull();
  expect(layout([])).toBeNull();
  expect(layout([{ x: 0, y: 0, width: 0, height: 600 }])).toBeNull();
  expect(layout([{ x: 790, y: 0, width: 10, height: 600 }])).toBeNull();
});

test("ignores malformed and non-dividing frames", () => {
  expect(layout([{ x: 400, y: 200, width: 10, height: 100 }])).toBeNull();
  expect(layout([{ x: NaN, y: 0, width: 10, height: 600 }])).toBeNull();
  expect(layout([{ x: 400, y: 0, width: -20, height: 600 }])).toBeNull();
});
