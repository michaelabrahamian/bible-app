import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getVersions } from "@/services/bible-service";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function TranslationSelect({
  label,
  value,
  onChange,
  excludedVersion,
  swapVersion,
  compact = false,
}: {
  label: string;
  value: string | null;
  onChange: (id: string) => void;
  excludedVersion?: string;
  swapVersion?: string;
  compact?: boolean;
}) {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const versions = getVersions();
  const current = versions.find(({ id }) => id === value);
  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current?.name ?? "Choose a translation"}`}
        accessibilityHint="Opens translation choices"
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
        style={[
          compact ? styles.compact : styles.field,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.badge,
            compact && styles.compactBadge,
            { backgroundColor: colors.accentSoft },
          ]}
        >
          <ThemedText style={[styles.code, { color: colors.tint }]}>
            {current?.abbreviation ?? "—"}
          </ThemedText>
        </View>
        <View style={styles.copy}>
          <ThemedText style={[styles.name, compact && styles.compactName]}>
            {compact
              ? current?.id === "neb"
                ? "Հայերեն"
                : current?.language
              : (current?.name ?? "Choose a translation")}
          </ThemedText>
          {!compact && (
            <ThemedText
              style={[styles.description, { color: colors.secondaryText }]}
            >
              {current?.description}
            </ThemedText>
          )}
        </View>
        <IconSymbol
          name="chevron.down"
          size={17}
          color={colors.secondaryText}
        />
      </TouchableOpacity>
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss translation choices"
            onPress={() => setOpen(false)}
            style={styles.backdrop}
          />
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
                paddingBottom: Math.max(insets.bottom, 22),
              },
            ]}
          >
            <View style={styles.sheetHeader}>
              <ThemedText accessibilityRole="header" style={styles.sheetTitle}>
                {label}
              </ThemedText>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close translation choices"
                onPress={() => setOpen(false)}
                style={[styles.close, { backgroundColor: colors.surfaceMuted }]}
              >
                <IconSymbol name="xmark" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ThemedText
              style={[styles.sheetHint, { color: colors.secondaryText }]}
            >
              Choose one text for this reading pane.
            </ThemedText>
            <ScrollView>
              <View
                accessibilityRole="radiogroup"
                accessibilityLabel={label}
                style={styles.options}
              >
                {versions.map((version) => {
                  const selected = version.id === value;
                  const excluded = version.id === excludedVersion;
                  return (
                    <TouchableOpacity
                      key={version.id}
                      accessibilityRole="radio"
                      aria-checked={selected}
                      accessibilityLabel={`Choose ${version.name}`}
                      accessibilityState={{
                        checked: selected,
                        disabled: excluded,
                      }}
                      disabled={excluded}
                      onPress={() => {
                        onChange(version.id);
                        setOpen(false);
                      }}
                      style={[
                        styles.option,
                        {
                          borderColor: selected ? colors.tint : colors.border,
                          backgroundColor: selected
                            ? colors.accentSoft
                            : colors.surface,
                          opacity: excluded ? 0.5 : 1,
                        },
                      ]}
                    >
                      <View style={styles.copy}>
                        <ThemedText style={styles.optionName}>
                          {version.name}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.description,
                            { color: colors.secondaryText },
                          ]}
                        >
                          {version.description}
                        </ThemedText>
                        {version.id === swapVersion && !selected && (
                          <ThemedText
                            style={[
                              styles.excluded,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Currently compared · selecting swaps panes
                          </ThemedText>
                        )}
                        {excluded && (
                          <ThemedText
                            style={[
                              styles.excluded,
                              { color: colors.secondaryText },
                            ]}
                          >
                            Already selected in the other pane
                          </ThemedText>
                        )}
                      </View>
                      {selected && (
                        <IconSymbol
                          name="checkmark.circle.fill"
                          size={22}
                          color={colors.tint}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 17,
    borderWidth: 1,
    borderRadius: 18,
    minHeight: 78,
  },
  compact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    minWidth: 42,
    minHeight: 40,
    borderRadius: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  compactBadge: {
    minWidth: 29,
    minHeight: 24,
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  code: { fontSize: 10, lineHeight: 16, fontWeight: "600" },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  name: { fontSize: 16, lineHeight: 23, fontWeight: "600" },
  compactName: { fontSize: 11, lineHeight: 16, fontWeight: "500" },
  description: { fontSize: 12, lineHeight: 18 },
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 20,
    width: "100%",
    maxWidth: 640,
    maxHeight: "85%",
    alignSelf: "center",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  sheetTitle: { fontSize: 23, lineHeight: 30, fontWeight: "600", flex: 1 },
  sheetHint: { fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 20 },
  close: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  options: { gap: 10, paddingBottom: 8 },
  option: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionName: { fontSize: 16, lineHeight: 23, fontWeight: "600" },
  excluded: { fontSize: 11, lineHeight: 17, marginTop: 3 },
});
