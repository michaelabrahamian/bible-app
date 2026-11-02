import {
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { Platform } from "react-native";

export const supportsLiquidGlass = () =>
  Platform.OS === "ios" &&
  isLiquidGlassAvailable() &&
  isGlassEffectAPIAvailable();

export const BOTTOM_TAB_BAR_HEIGHT = 64;
export const BOTTOM_TAB_BAR_MARGIN = 12;

export const getTabContentBottomInset = (safeAreaBottom: number) =>
  supportsLiquidGlass()
    ? BOTTOM_TAB_BAR_HEIGHT +
      Math.max(safeAreaBottom, BOTTOM_TAB_BAR_MARGIN) +
      16
    : undefined;
