import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts, ThemePalettes, type ThemeId } from "@/constants/theme";
import {
  DEFAULT_READING_TEXT_SIZE,
  MAX_READING_TEXT_SIZE,
  MIN_READING_TEXT_SIZE,
  READING_TEXT_SIZE_STEP,
  useAppearance,
  type AppearanceMode,
} from "@/contexts/appearance-context";
import { useAppColorScheme, useAppTheme } from "@/hooks/use-app-theme";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const appearanceModes: { id: AppearanceMode; name: string }[] = [
  { id: "system", name: "System" },
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
];

export function ReadingAppearanceControls() {
  const {
    themeId,
    appearance,
    readingTextSize,
    setThemeId,
    setAppearance,
    setReadingTextSize,
  } = useAppearance();
  const colors = useAppTheme();
  const scheme = useAppColorScheme();
  const scale = readingTextSize / 100;
  return (
    <View style={styles.sections}>
      <View style={styles.section}>
        <ThemedText
          accessibilityRole="header"
          style={[styles.sectionLabel, { color: colors.secondaryText }]}
        >
          READING TEXT SIZE
        </ThemedText>
        <View
          style={[
            styles.sizeCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.sizeRow}>
            {([-1, 1] as const).map((direction) => {
              const smaller = direction === -1;
              const disabled = smaller
                ? readingTextSize <= MIN_READING_TEXT_SIZE
                : readingTextSize >= MAX_READING_TEXT_SIZE;
              return (
                <View key={direction} style={styles.sizeGroup}>
                  {!smaller && (
                    <ThemedText
                      accessibilityLabel={`Reading text size: ${readingTextSize}%`}
                      style={styles.sizeValue}
                    >
                      {readingTextSize}%
                    </ThemedText>
                  )}
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={
                      smaller
                        ? "Decrease reading text size"
                        : "Increase reading text size"
                    }
                    accessibilityState={{ disabled }}
                    disabled={disabled}
                    onPress={() =>
                      setReadingTextSize(
                        (previous) =>
                          previous + direction * READING_TEXT_SIZE_STEP,
                      )
                    }
                    style={[
                      styles.sizeButton,
                      {
                        backgroundColor: colors.accentSoft,
                        opacity: disabled ? 0.4 : 1,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[styles.sizeButtonText, { color: colors.tint }]}
                    >
                      {smaller ? "A−" : "A+"}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              );
            })}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Reset reading text size"
              accessibilityState={{
                disabled: readingTextSize === DEFAULT_READING_TEXT_SIZE,
              }}
              disabled={readingTextSize === DEFAULT_READING_TEXT_SIZE}
              onPress={() => setReadingTextSize(DEFAULT_READING_TEXT_SIZE)}
              style={styles.reset}
            >
              <ThemedText
                style={[styles.resetText, { color: colors.secondaryText }]}
              >
                Reset
              </ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText
            accessibilityLabel="Reading text preview"
            style={{
              fontFamily: Fonts.serif,
              fontSize: 19 * scale,
              lineHeight: 32 * scale,
            }}
          >
            Read at a size that feels comfortable.
          </ThemedText>
        </View>
      </View>
      <View style={styles.section}>
        <ThemedText
          accessibilityRole="header"
          style={[styles.sectionLabel, { color: colors.secondaryText }]}
        >
          COLOUR THEME
        </ThemedText>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Colour theme"
          style={styles.themeOptions}
        >
          {(Object.keys(ThemePalettes) as ThemeId[]).map((id) => {
            const palette = ThemePalettes[id];
            const selected = id === themeId;
            return (
              <TouchableOpacity
                key={id}
                accessibilityRole="radio"
                aria-checked={selected}
                accessibilityLabel={`${palette.name} theme`}
                accessibilityState={{ checked: selected }}
                onPress={() => setThemeId(id)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: colors.surface,
                    borderColor: selected ? colors.tint : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: palette.colors[scheme].hero },
                  ]}
                >
                  {selected && (
                    <IconSymbol
                      name="checkmark"
                      size={16}
                      color={palette.colors[scheme].heroText}
                    />
                  )}
                </View>
                <ThemedText style={styles.themeName}>{palette.name}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.section}>
        <ThemedText
          accessibilityRole="header"
          style={[styles.sectionLabel, { color: colors.secondaryText }]}
        >
          APPEARANCE
        </ThemedText>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Appearance"
          style={[
            styles.appearanceOptions,
            { backgroundColor: colors.surfaceMuted },
          ]}
        >
          {appearanceModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              accessibilityRole="radio"
              aria-checked={appearance === mode.id}
              accessibilityLabel={`${mode.name} appearance`}
              accessibilityState={{ checked: appearance === mode.id }}
              onPress={() => setAppearance(mode.id)}
              style={[
                styles.appearanceOption,
                appearance === mode.id && { backgroundColor: colors.surface },
              ]}
            >
              <ThemedText
                style={[
                  styles.appearanceName,
                  {
                    color:
                      appearance === mode.id
                        ? colors.text
                        : colors.secondaryText,
                  },
                ]}
              >
                {mode.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sections: { gap: 24 },
  section: { gap: 12 },
  sectionLabel: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.6,
    fontWeight: "600",
  },
  sizeCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 16 },
  sizeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  sizeButton: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  sizeButtonText: { fontSize: 19, lineHeight: 28, fontWeight: "600" },
  sizeValue: {
    fontSize: 15,
    lineHeight: 24,
    minWidth: 48,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  reset: {
    marginLeft: "auto",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  resetText: { fontSize: 12, lineHeight: 20 },
  themeOptions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  themeOption: {
    flexGrow: 1,
    flexBasis: "22%",
    minWidth: 56,
    paddingVertical: 12,
    paddingHorizontal: 5,
    gap: 8,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  themeName: { fontSize: 11, lineHeight: 18 },
  appearanceOptions: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 15,
    gap: 4,
    flexWrap: "wrap",
  },
  appearanceOption: {
    flex: 1,
    minWidth: 64,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  appearanceName: { fontSize: 13, lineHeight: 20, fontWeight: "500" },
});
