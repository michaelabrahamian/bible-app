export interface WidgetAppearancePayload {
  themeId: string;
  appearance: "system" | "light" | "dark";
  light: { background: string; foreground: string };
  dark: { background: string; foreground: string };
}

// Android and web do not yet have a native daily-verse widget.
export async function syncWidgetAppearance(_payload: WidgetAppearancePayload): Promise<void> {}
