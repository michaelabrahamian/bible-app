import { beforeEach, expect, jest, test } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import {
  AppearanceProvider,
  APPEARANCE_STORAGE_KEY,
  useAppearance,
} from "../appearance-context";
import { ThemePalettes } from "@/constants/theme";
import { useAppTheme, useAppColorScheme } from "@/hooks/use-app-theme";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual(
    "@react-native-async-storage/async-storage/jest/async-storage-mock",
  ),
);
beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

test("restores appearance before persisting defaults", async () => {
  let restore!: (value: string | null) => void;
  jest.spyOn(AsyncStorage, "getItem").mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        restore = resolve;
      }),
  );
  const { result } = await renderHook(useAppearance, {
    wrapper: AppearanceProvider,
  });
  expect(result.current.isReady).toBe(false);
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  await act(async () =>
    restore(JSON.stringify({ themeId: "ocean", appearance: "dark" })),
  );
  await waitFor(() => expect(result.current.isReady).toBe(true));
  expect(result.current.themeId).toBe("ocean");
  expect(result.current.appearance).toBe("dark");
});

test("persists theme and appearance across remounts and applies the selected palette", async () => {
  const usePreferences = () => ({
    appearance: useAppearance(),
    colors: useAppTheme(),
    scheme: useAppColorScheme(),
  });
  const first = await renderHook(usePreferences, {
    wrapper: AppearanceProvider,
  });
  await waitFor(() =>
    expect(first.result.current.appearance.isReady).toBe(true),
  );
  await act(async () => {
    first.result.current.appearance.setThemeId("plum");
    first.result.current.appearance.setAppearance("dark");
  });
  await waitFor(() =>
    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
      APPEARANCE_STORAGE_KEY,
      JSON.stringify({ themeId: "plum", appearance: "dark" }),
    ),
  );
  await first.unmount();
  const second = await renderHook(usePreferences, {
    wrapper: AppearanceProvider,
  });
  await waitFor(() =>
    expect(second.result.current.appearance.isReady).toBe(true),
  );
  expect(second.result.current.scheme).toBe("dark");
  expect(second.result.current.colors.background).toBe(
    ThemePalettes.plum.colors.dark.background,
  );
  await act(async () =>
    second.result.current.appearance.setAppearance("light"),
  );
  expect(second.result.current.colors.background).toBe(
    ThemePalettes.plum.colors.light.background,
  );
});

test("recovers from corrupt or unsupported appearance settings", async () => {
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  for (const stored of [
    "{broken",
    JSON.stringify({ themeId: "__proto__", appearance: "sepia" }),
  ]) {
    await AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, stored);
    const { result, unmount } = await renderHook(useAppearance, {
      wrapper: AppearanceProvider,
    });
    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.themeId).toBe("forest");
    expect(result.current.appearance).toBe("system");
    await unmount();
  }
  warn.mockRestore();
});

const luminance = (hex: string) => {
  const channels = hex
    .match(/[a-f\d]{2}/gi)!
    .map((c) => parseInt(c, 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};
const contrast = (a: string, b: string) =>
  (Math.max(luminance(a), luminance(b)) + 0.05) /
  (Math.min(luminance(a), luminance(b)) + 0.05);

test("all theme presets keep normal reading and control text above AA contrast", () => {
  for (const palette of Object.values(ThemePalettes)) {
    for (const colors of Object.values(palette.colors)) {
      for (const [foreground, background] of [
        [colors.text, colors.background],
        [colors.text, colors.surface],
        [colors.secondaryText, colors.background],
        [colors.secondaryText, colors.surface],
        [colors.secondaryText, colors.surfaceMuted],
        [colors.onAccent, colors.tint],
        [colors.heroText, colors.hero],
        [colors.heroMuted, colors.hero],
      ]) {
        expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
      }
    }
  }
});
