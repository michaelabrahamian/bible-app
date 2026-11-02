import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { TranslationLicenses } from "@/constants/translation-licenses";
import { useAppTheme } from "@/hooks/use-app-theme";
import { router, Stack } from "expo-router";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TextLicencesScreen() {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28 },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back to Settings"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/explore")
          }
          style={styles.back}
        >
          <IconSymbol name="arrow.left" size={20} color={colors.tint} />
          <ThemedText style={{ color: colors.tint }}>Settings</ThemedText>
        </TouchableOpacity>
        <ThemedText
          accessibilityRole="header"
          type="title"
          style={styles.title}
        >
          Text sources & licences
        </ThemedText>
        <ThemedText
          style={[styles.introduction, { color: colors.secondaryText }]}
        >
          Each translation has its own terms. A public download or repository
          licence does not replace the rights holder’s permission. These notes
          document the sources; they do not grant additional rights.
        </ThemedText>
        <View style={styles.section}>
          <ThemedText accessibilityRole="header" style={styles.sectionTitle}>
            Bundled texts
          </ThemedText>
          {TranslationLicenses.map((record) => (
            <View
              key={record.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <ThemedText accessibilityRole="header" style={styles.name}>
                {record.name}
              </ThemedText>
              <ThemedText style={[styles.provider, { color: colors.tint }]}>
                {record.provider}
              </ThemedText>
              <ThemedText style={styles.body}>{record.summary}</ThemedText>
              <ThemedText
                style={[styles.body, { color: colors.secondaryText }]}
              >
                {record.coverage}
              </ThemedText>
              {record.links.map((link) => (
                <TouchableOpacity
                  key={link.url}
                  accessibilityRole="link"
                  onPress={() => {
                    void Linking.openURL(link.url).catch(() => {});
                  }}
                  style={styles.link}
                >
                  <ThemedText style={[styles.linkText, { color: colors.tint }]}>
                    {link.label}
                  </ThemedText>
                  <IconSymbol
                    name="arrow.right"
                    size={16}
                    color={colors.tint}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        <ThemedText style={[styles.footer, { color: colors.secondaryText }]}>
          Source and permission records checked 27 October 2026. Terms and
          availability may change.
        </ThemedText>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 22,
    gap: 20,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 44,
    alignSelf: "flex-start",
  },
  title: { fontSize: 29, lineHeight: 37, letterSpacing: -0.8 },
  introduction: { fontSize: 14, lineHeight: 23 },
  section: { gap: 13, marginTop: 10 },
  sectionTitle: { fontSize: 19, lineHeight: 26, fontWeight: "600" },
  card: { padding: 20, borderWidth: 1, borderRadius: 20, gap: 11 },
  name: { fontSize: 18, lineHeight: 25, fontWeight: "600" },
  provider: { fontSize: 12, lineHeight: 18 },
  body: { fontSize: 13, lineHeight: 22 },
  link: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44 },
  linkText: { fontSize: 13, lineHeight: 20, flex: 1, fontWeight: "500" },
  footer: { fontSize: 11, lineHeight: 19, marginTop: 8 },
});
