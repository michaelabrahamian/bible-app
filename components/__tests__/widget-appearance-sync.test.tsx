import { beforeEach, expect, jest, test } from "@jest/globals";
import { act, render } from "@testing-library/react-native";
import { AppState, type AppStateStatus } from "react-native";
import { WidgetAppearanceSync } from "@/components/widget-appearance-sync";
import { useAppearance } from "@/contexts/appearance-context";
import { ThemePalettes } from "@/constants/theme";
import { syncWidgetAppearance } from "@/services/widget-appearance";

jest.mock("@/contexts/appearance-context", () => ({ useAppearance: jest.fn() }));
jest.mock("@/services/widget-appearance", () => ({ syncWidgetAppearance: jest.fn<() => Promise<void>>(() => Promise.resolve()) }));

const remove = jest.fn();
let onStateChange: (state: AppStateStatus) => void;
const state = (overrides: Partial<ReturnType<typeof useAppearance>> = {}) => {
  jest.mocked(useAppearance).mockReturnValue({
    isReady: true, themeId: "forest", appearance: "system", readingTextSize: 100,
    setThemeId: jest.fn(), setAppearance: jest.fn(), setReadingTextSize: jest.fn(), ...overrides,
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  state();
  jest.spyOn(AppState, "addEventListener").mockImplementation((_event, callback) => {
    onStateChange = callback;
    return { remove };
  });
});

test("waits for restored preferences before sharing both palette variants and appearance", async () => {
  state({ isReady: false, themeId: "ocean", appearance: "dark" });
  const screen = await render(<WidgetAppearanceSync />);
  expect(syncWidgetAppearance).not.toHaveBeenCalled();
  state({ themeId: "ocean", appearance: "dark" });
  await screen.rerender(<WidgetAppearanceSync />);
  expect(syncWidgetAppearance).toHaveBeenLastCalledWith({
    themeId: "ocean", appearance: "dark",
    light: { background: ThemePalettes.ocean.colors.light.background, foreground: ThemePalettes.ocean.colors.light.text },
    dark: { background: ThemePalettes.ocean.colors.dark.background, foreground: ThemePalettes.ocean.colors.dark.text },
  });
});

test("theme and appearance changes sync while font-size changes do not request widget reloads", async () => {
  const screen = await render(<WidgetAppearanceSync />);
  state({ themeId: "cream", appearance: "light" });
  await screen.rerender(<WidgetAppearanceSync />);
  expect(syncWidgetAppearance).toHaveBeenCalledTimes(2);
  expect(syncWidgetAppearance).toHaveBeenLastCalledWith(expect.objectContaining({ themeId: "cream", appearance: "light" }));
  state({ themeId: "cream", appearance: "light", readingTextSize: 150 });
  await screen.rerender(<WidgetAppearanceSync />);
  expect(syncWidgetAppearance).toHaveBeenCalledTimes(2);
});

test("foreground retries the current theme and unsubscribes on unmount", async () => {
  const screen = await render(<WidgetAppearanceSync />);
  await act(() => onStateChange("background"));
  expect(syncWidgetAppearance).toHaveBeenCalledTimes(1);
  await act(() => onStateChange("active"));
  expect(syncWidgetAppearance).toHaveBeenCalledTimes(2);
  await screen.unmount();
  expect(remove).toHaveBeenCalled();
});
