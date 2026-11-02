import { afterEach, expect, jest, test } from "@jest/globals";
import { Platform } from "react-native";
import {
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import {
  getTabContentBottomInset,
  supportsLiquidGlass,
} from "@/constants/navigation";

jest.mock("expo-glass-effect", () => ({
  isLiquidGlassAvailable: jest.fn(),
  isGlassEffectAPIAvailable: jest.fn(),
}));

afterEach(() => {
  jest.restoreAllMocks();
});

test.each(["android", "web"] as const)(
  "%s keeps docked tabs without querying native glass APIs",
  (os) => {
    jest.replaceProperty(Platform, "OS", os);
    expect(supportsLiquidGlass()).toBe(false);
    expect(getTabContentBottomInset(34)).toBeUndefined();
    expect(isLiquidGlassAvailable).not.toHaveBeenCalled();
    expect(isGlassEffectAPIAvailable).not.toHaveBeenCalled();
  },
);

test.each([
  [false, true],
  [true, false],
  [false, false],
])(
  "iOS keeps docked tabs if either glass capability is unavailable (%s, %s)",
  (liquid, api) => {
    jest.replaceProperty(Platform, "OS", "ios");
    jest.mocked(isLiquidGlassAvailable).mockReturnValue(liquid);
    jest.mocked(isGlassEffectAPIAvailable).mockReturnValue(api);
    expect(supportsLiquidGlass()).toBe(false);
    expect(getTabContentBottomInset(34)).toBeUndefined();
  },
);

test("supported iOS reserves scroll clearance for the floating bar and safe area", () => {
  jest.replaceProperty(Platform, "OS", "ios");
  jest.mocked(isLiquidGlassAvailable).mockReturnValue(true);
  jest.mocked(isGlassEffectAPIAvailable).mockReturnValue(true);
  expect(supportsLiquidGlass()).toBe(true);
  expect(getTabContentBottomInset(34)).toBeGreaterThan(
    getTabContentBottomInset(0)!,
  );
  expect(getTabContentBottomInset(0)).toBeGreaterThan(64);
});
