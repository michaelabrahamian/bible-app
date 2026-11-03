import { ThemePalettes } from "@/constants/theme";
import { useAppearance } from "@/contexts/appearance-context";
import { syncWidgetAppearance } from "@/services/widget-appearance";
import { useEffect } from "react";
import { AppState } from "react-native";

export function WidgetAppearanceSync() {
  const { isReady, themeId, appearance } = useAppearance();
  useEffect(() => {
    // Do not overwrite the saved widget theme with the app's startup defaults.
    if (!isReady) return;
    const palette = ThemePalettes[themeId].colors;
    const sync = () => {
      void syncWidgetAppearance({
        themeId,
        appearance,
        light: { background: palette.light.background, foreground: palette.light.text },
        dark: { background: palette.dark.background, foreground: palette.dark.text },
      }).catch((error: unknown) => console.warn("Unable to sync widget appearance", error));
    };
    sync();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") sync();
    });
    return () => subscription.remove();
  }, [isReady, themeId, appearance]);
  return null;
}
