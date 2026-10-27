import type { AppColors } from "@/constants/theme";
import { useAppColorScheme, useAppTheme } from "@/hooks/use-app-theme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof AppColors,
) {
  const mode = useAppColorScheme();
  const colors = useAppTheme();
  return props[mode] ?? colors[colorName];
}
