import { expect, jest, test } from "@jest/globals";
import { createLinkedVerseScroll } from "@/utils/linked-verse-scroll";

function setup(omitSecond = false) {
  const link = createLinkedVerseScroll();
  const primary = jest.fn<(y: number) => void>();
  const secondary = jest.fn<(y: number) => void>();
  link.attach(0, primary);
  link.attach(1, secondary);
  link.measureViewport(0, 200);
  link.measureViewport(1, 200);
  link.measureContent(0, 1000);
  link.measureContent(1, 1200);
  [20, 120, 320, 620].forEach((y, i) => link.measureVerse(0, i + 1, y));
  [20, 220, 420, 720].forEach((y, i) => {
    if (!omitSecond || i !== 1) link.measureVerse(1, i + 1, y);
  });
  return { link, primary, secondary };
}

test("matches verse starts and fractional verse positions despite different text lengths", () => {
  const { link, secondary } = setup();
  link.activate(0);
  link.scroll(0, 120);
  expect(secondary).toHaveBeenLastCalledWith(220);
  link.scroll(0, 220);
  expect(secondary).toHaveBeenLastCalledWith(320);
});

test("scrolling either pane takes control and follower events never feed back", () => {
  const { link, primary, secondary } = setup();
  link.activate(0);
  link.scroll(0, 220);
  primary.mockClear();
  link.scroll(1, 320);
  expect(primary).not.toHaveBeenCalled();
  link.activate(1);
  secondary.mockClear();
  link.scroll(1, 320);
  expect(primary).toHaveBeenLastCalledWith(220);
  link.scroll(0, 220);
  expect(secondary).not.toHaveBeenCalled();
});

test("omitted verses interpolate between shared verse numbers without shifting references", () => {
  const { link, secondary } = setup(true);
  link.activate(0);
  link.scroll(0, 220);
  expect(secondary.mock.lastCall![0]).toBeCloseTo(286.6667);
  link.scroll(0, 320);
  expect(secondary).toHaveBeenLastCalledWith(420);
});

test("clamps bounce and moves smoothly to both chapter ends", () => {
  const { link, secondary } = setup();
  link.activate(0);
  link.scroll(0, -30);
  expect(secondary).toHaveBeenLastCalledWith(0);
  link.scroll(0, 710);
  expect(secondary).toHaveBeenLastCalledWith(860);
  link.scroll(0, 900);
  expect(secondary).toHaveBeenLastCalledWith(1000);
});

test("new font/width measurements replace old verse anchors and viewport limits", () => {
  const { link, secondary } = setup();
  link.activate(0);
  link.measureVerse(1, 2, 320);
  link.scroll(0, 120);
  expect(secondary).toHaveBeenLastCalledWith(320);
  link.measureViewport(1, 600);
  link.scroll(0, 800);
  expect(secondary).toHaveBeenLastCalledWith(600);
});

test("missing chapters and unmeasured panes do not move the other translation", () => {
  const link = createLinkedVerseScroll();
  const secondary = jest.fn<(y: number) => void>();
  link.attach(1, secondary);
  link.activate(0);
  secondary.mockClear();
  link.scroll(0, 200);
  expect(secondary).not.toHaveBeenCalled();
  link.measureViewport(0, 200);
  link.measureViewport(1, 200);
  link.measureContent(0, 1000);
  link.measureContent(1, 1000);
  link.measureVerse(0, 1, 20);
  link.scroll(0, 200);
  expect(secondary).not.toHaveBeenCalled();
});
