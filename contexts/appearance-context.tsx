import { ThemePalettes, type ThemeId } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const APPEARANCE_STORAGE_KEY = "bible-app:appearance:v1";
export type AppearanceMode = "system" | "light" | "dark";
interface AppearancePreferences {
  themeId: ThemeId;
  appearance: AppearanceMode;
}
interface AppearanceState extends AppearancePreferences {
  isReady: boolean;
  setThemeId: (themeId: ThemeId) => void;
  setAppearance: (appearance: AppearanceMode) => void;
}
const defaults: AppearancePreferences = {
  themeId: "forest",
  appearance: "system",
};
const AppearanceContext = createContext<AppearanceState>({
  ...defaults,
  isReady: true,
  setThemeId: () => {},
  setAppearance: () => {},
});

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] =
    useState<AppearancePreferences>(defaults);
  const [isReady, setIsReady] = useState(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(APPEARANCE_STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const value = JSON.parse(raw);
        if (!value || typeof value !== "object") return;
        setPreferences({
          themeId:
            typeof value.themeId === "string" &&
            Object.hasOwn(ThemePalettes, value.themeId)
              ? value.themeId
              : defaults.themeId,
          appearance: ["system", "light", "dark"].includes(value.appearance)
            ? value.appearance
            : defaults.appearance,
        });
      })
      .catch((error: unknown) =>
        console.warn("Unable to restore appearance preferences", error),
      )
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!isReady) return;
    writes.current = writes.current
      .then(() =>
        AsyncStorage.setItem(
          APPEARANCE_STORAGE_KEY,
          JSON.stringify(preferences),
        ),
      )
      .catch((error: unknown) =>
        console.warn("Unable to save appearance preferences", error),
      );
  }, [preferences, isReady]);
  return (
    <AppearanceContext.Provider
      value={{
        ...preferences,
        isReady,
        setThemeId: (themeId) => {
          if (Object.hasOwn(ThemePalettes, themeId))
            setPreferences((previous) => ({ ...previous, themeId }));
        },
        setAppearance: (appearance) => {
          if (["system", "light", "dark"].includes(appearance))
            setPreferences((previous) => ({ ...previous, appearance }));
        },
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
