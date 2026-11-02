import { ReaderSheet } from "@/components/reader-sheet";
import { ReadingAppearanceControls } from "@/components/reading-appearance-controls";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const layoutOptions = [
  { id: "primary", name: "Primary only", icon: "text.alignleft" },
  { id: "secondary", name: "Secondary only", icon: "text.alignleft" },
  { id: "side-by-side", name: "Side by side", icon: "rectangle.split.2x1" },
  { id: "stacked", name: "Stacked", icon: "rectangle.split.1x2" },
] as const;
export type ReaderLayout = (typeof layoutOptions)[number]["id"];

export function ReaderOptionsMenu({
  selectedLayout,
  displayLayout,
  onSelectLayout,
  onClose,
}: {
  selectedLayout: ReaderLayout;
  displayLayout?: "side-by-side" | "stacked";
  onSelectLayout: (layout: ReaderLayout) => void;
  onClose: () => void;
}) {
  const colors = useAppTheme();
  return (
    <ReaderSheet
      title="Reading options"
      closeLabel="Close reading options"
      dismissLabel="Dismiss reading options"
      onClose={onClose}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <ThemedText
            accessibilityRole="header"
            style={[styles.sectionLabel, { color: colors.secondaryText }]}
          >
            READING LAYOUT
          </ThemedText>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Reading layout"
            style={styles.layouts}
          >
            {layoutOptions.map((option) => {
              const selected = selectedLayout === option.id;
              const disabled = Boolean(
                displayLayout &&
                  (option.id === "side-by-side" || option.id === "stacked") &&
                  option.id !== displayLayout,
              );
              return (
                <TouchableOpacity
                  key={option.id}
                  accessibilityRole="radio"
                  aria-checked={selected}
                  accessibilityState={{ checked: selected, disabled }}
                  disabled={disabled}
                  accessibilityLabel={option.name}
                  onPress={() => onSelectLayout(option.id)}
                  style={[
                    styles.layout,
                    {
                      backgroundColor: selected
                        ? colors.accentSoft
                        : colors.surface,
                      borderColor: selected ? colors.tint : colors.border,
                      opacity: disabled ? 0.45 : 1,
                    },
                  ]}
                >
                  <IconSymbol
                    name={option.icon}
                    size={21}
                    color={colors.tint}
                  />
                  <ThemedText style={styles.layoutName}>
                    {option.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
          {displayLayout && (
            <ThemedText
              style={{
                fontSize: 12,
                lineHeight: 20,
                color: colors.secondaryText,
              }}
            >
              Comparison follows the fold while this display is open. Your
              preferred layout returns when it closes.
            </ThemedText>
          )}
        </View>
        <ReadingAppearanceControls />
      </ScrollView>
    </ReaderSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 20, gap: 24 },
  section: { gap: 12 },
  sectionLabel: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.6,
    fontWeight: "600",
  },
  layouts: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  layout: {
    flexGrow: 1,
    flexBasis: "45%",
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  layoutName: { flex: 1, fontSize: 13, lineHeight: 20 },
});
