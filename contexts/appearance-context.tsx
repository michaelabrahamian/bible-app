import { ThemePalettes, type ThemeId } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SetStateAction,
} from "react";

export const APPEARANCE_STORAGE_KEY = "bible-app:appearance:v1";
export type AppearanceMode = "system" | "light" | "dark";
export const MIN_READING_TEXT_SIZE = 80;
export const MAX_READING_TEXT_SIZE = 180;
export const DEFAULT_READING_TEXT_SIZE = 100;
export const READING_TEXT_SIZE_STEP = 10;

const validReadingTextSize = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= MIN_READING_TEXT_SIZE &&
  value <= MAX_READING_TEXT_SIZE &&
  value % READING_TEXT_SIZE_STEP === 0;

interface AppearancePreferences {
  themeId: ThemeId;
  appearance: AppearanceMode;
  readingTextSize: number;
}
interface AppearanceState extends AppearancePreferences {
  isReady: boolean;
  setThemeId: (themeId: ThemeId) => void;
  setAppearance: (appearance: AppearanceMode) => void;
  setReadingTextSize: (size: SetStateAction<number>) => void;
}
const defaults: AppearancePreferences = {
  themeId: "forest",
  appearance: "system",
  readingTextSize: DEFAULT_READING_TEXT_SIZE,
};
const AppearanceContext = createContext<AppearanceState>({
  ...defaults,
  isReady: true,
  setThemeId: () => {},
  setAppearance: () => {},
  setReadingTextSize: () => {},
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
          readingTextSize: validReadingTextSize(value.readingTextSize)
            ? value.readingTextSize
            : defaults.readingTextSize,
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
        setReadingTextSize: (next) => {
          setPreferences((previous) => {
            const size =
              typeof next === "function"
                ? next(previous.readingTextSize)
                : next;
            return validReadingTextSize(size)
              ? { ...previous, readingTextSize: size }
              : previous;
          });
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
