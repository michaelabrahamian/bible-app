import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { StyleSheet, View } from "react-native";

export function ContentNotice({
  text,
  compact = false,
}: {
  text: string;
  compact?: boolean;
}) {
  const colors = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceMuted }]}>
      <IconSymbol name="info.circle" size={19} color={colors.tint} />
      <View style={styles.copy}>
        <ThemedText style={styles.title}>About the Armenian text</ThemedText>
        <ThemedText style={[styles.body, { color: colors.secondaryText }]}>
          {compact
            ? "Incomplete New Etchmiadzin copy. Missing books and uncertain references; see Settings for coverage and licensing."
            : text}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 12, padding: 18, borderRadius: 18 },
  copy: { flex: 1 },
  title: { fontSize: 14, lineHeight: 20, fontWeight: "600", marginBottom: 4 },
  body: { fontSize: 13, lineHeight: 20 },
});
