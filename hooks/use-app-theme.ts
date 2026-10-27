import { ThemePalettes } from "@/constants/theme";
import { useAppearance } from "@/contexts/appearance-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useAppColorScheme() {
  const { appearance } = useAppearance();
  const system = useColorScheme() ?? "light";
  return appearance === "system" ? system : appearance;
}

export function useAppTheme() {
  const { themeId } = useAppearance();
  return ThemePalettes[themeId].colors[useAppColorScheme()];
}
