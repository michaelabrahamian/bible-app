import { ReadingAppearanceControls } from "@/components/reading-appearance-controls";
import { ContentNotice } from "@/components/content-notice";
import { ThemedText } from "@/components/themed-text";
import { TranslationSelect } from "@/components/translation-select";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { supportsLiquidGlass } from "@/constants/navigation";
import { useBible } from "@/contexts/bible-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  ScrollView,
  Platform,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router } from "expo-router";

export default function SettingsScreen() {
  const {
    primaryVersion,
    secondaryVersion,
    setPrimaryVersion,
    setSecondaryVersion,
    showDualView,
    toggleDualView,
    comparisonLayout,
    setComparisonLayout,
    getVersions,
  } = useBible();
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();
  const nativeTabs = supportsLiquidGlass();
  const versions = getVersions();
  const notice = versions.find(({ notice }) => Boolean(notice))?.notice;
  const parallelEnabled = Boolean(secondaryVersion) && showDualView;
  const setParallelReading = (enabled: boolean) => {
    if (enabled && !secondaryVersion) {
      const other = versions.find(({ id }) => id !== primaryVersion);
      if (other) setSecondaryVersion(other.id);
    }
    if (enabled !== showDualView) toggleDualView();
  };

  return (
    <SafeAreaView
      edges={nativeTabs ? [] : ["left", "right"]}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: (nativeTabs ? 0 : insets.top) + 28,
            paddingBottom: 32,
          },
        ]}
        contentInsetAdjustmentBehavior={nativeTabs ? "automatic" : "never"}
      >
        <View style={styles.header}>
          <ThemedText style={[styles.eyebrow, { color: colors.tint }]}>
            MAKE ROOM FOR THE WORD
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            Settings
          </ThemedText>
          <ThemedText
            style={[styles.subtitle, { color: colors.secondaryText }]}
          >
            A reading experience that feels like yours.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText
            style={[styles.sectionLabel, { color: colors.secondaryText }]}
          >
            PRIMARY TRANSLATION
          </ThemedText>
          <TranslationSelect
            label="Primary translation"
            value={primaryVersion}
            swapVersion={secondaryVersion ?? undefined}
            onChange={setPrimaryVersion}
          />
        </View>

        <View style={styles.section}>
          <ThemedText
            style={[styles.sectionLabel, { color: colors.secondaryText }]}
          >
            READING LAYOUT
          </ThemedText>
          <View
            style={[
              styles.layoutCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.settingRow}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: colors.accentSoft },
                ]}
              >
                <IconSymbol
                  name="rectangle.split.2x1"
                  size={21}
                  color={colors.tint}
                />
              </View>
              <View style={styles.settingCopy}>
                <ThemedText style={styles.settingTitle}>
                  Parallel reading
                </ThemedText>
                <ThemedText
                  style={[
                    styles.settingDescription,
                    { color: colors.secondaryText },
                  ]}
                >
                  Read two translations together.
                </ThemedText>
              </View>
              <Switch
                accessibilityLabel="Parallel reading"
                value={parallelEnabled}
                onValueChange={setParallelReading}
                trackColor={{ false: colors.border, true: colors.tint }}
                thumbColor={colors.onAccent}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                {...(Platform.OS === "web"
                  ? {
                      activeThumbColor: colors.onAccent,
                      style: { height: 26, width: 52 },
                    }
                  : {})}
              />
            </View>
          </View>
          {parallelEnabled && (
            <>
              <TranslationSelect
                label="Comparison translation"
                value={secondaryVersion}
                excludedVersion={primaryVersion}
                onChange={setSecondaryVersion}
              />
              <View
                accessibilityRole="radiogroup"
                accessibilityLabel="Comparison layout"
                style={styles.layoutOptions}
              >
                {(["side-by-side", "stacked"] as const).map((layout) => {
                  const selected = layout === comparisonLayout;
                  return (
                    <TouchableOpacity
                      key={layout}
                      accessibilityRole="radio"
                      aria-checked={selected}
                      accessibilityLabel={
                        layout === "side-by-side" ? "Side by side" : "Stacked"
                      }
                      accessibilityState={{ checked: selected }}
                      onPress={() => setComparisonLayout(layout)}
                      style={[
                        styles.layoutOption,
                        {
                          backgroundColor: selected
                            ? colors.accentSoft
                            : colors.surface,
                          borderColor: selected ? colors.tint : colors.border,
                        },
                      ]}
                    >
                      <IconSymbol
                        name={
                          layout === "side-by-side"
                            ? "rectangle.split.2x1"
                            : "rectangle.split.1x2"
                        }
                        size={23}
                        color={colors.tint}
                      />
                      <ThemedText style={styles.layoutOptionTitle}>
                        {layout === "side-by-side" ? "Side by side" : "Stacked"}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>

        <ReadingAppearanceControls />
        {notice && <ContentNotice text={notice} />}
        <View
          style={[
            styles.licensingCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <ThemedText style={styles.settingTitle}>
            Bible text licensing
          </ThemedText>
          <ThemedText
            style={[styles.licensingText, { color: colors.secondaryText }]}
          >
            Each translation has separate terms. World English Bible is public
            domain; other texts and digital editions have their own rights and
            attribution requirements.
          </ThemedText>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="View text sources and licences"
            onPress={() => router.push("/licences")}
            style={styles.licensingLink}
          >
            <ThemedText
              style={[styles.licensingLinkText, { color: colors.tint }]}
            >
              Text sources & licences
            </ThemedText>
            <IconSymbol name="arrow.right" size={18} color={colors.tint} />
          </TouchableOpacity>
        </View>
        <View style={styles.privacyRow}>
          <IconSymbol name="lock" size={15} color={colors.secondaryText} />
          <ThemedText
            style={[styles.privacyText, { color: colors.secondaryText }]}
          >
            Your reading choices, text size and theme are saved on this device.
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 32,
    gap: 28,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  header: { gap: 9, marginBottom: 2 },
  eyebrow: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.7,
    fontWeight: "600",
  },
  title: { fontSize: 34, lineHeight: 42, letterSpacing: -1 },
  subtitle: { fontSize: 14, lineHeight: 22 },
  section: { gap: 12 },
  sectionLabel: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.6,
    fontWeight: "600",
  },
  layoutCard: { borderWidth: 1, borderRadius: 20, overflow: "hidden" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 18,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  settingCopy: { flex: 1, gap: 3 },
  settingTitle: { fontSize: 15, lineHeight: 22, fontWeight: "600" },
  settingDescription: { fontSize: 12, lineHeight: 18 },
  layoutOptions: { flexDirection: "row", gap: 10 },
  layoutOption: {
    flex: 1,
    padding: 17,
    borderWidth: 1,
    borderRadius: 17,
    alignItems: "center",
    gap: 8,
  },
  layoutOptionTitle: { fontSize: 13, lineHeight: 20, fontWeight: "500" },
  licensingCard: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 10 },
  licensingText: { fontSize: 13, lineHeight: 21 },
  licensingLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 44,
  },
  licensingLinkText: { flex: 1, fontSize: 13, fontWeight: "600" },
  privacyRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  privacyText: { fontSize: 11, lineHeight: 18, flexShrink: 1 },
});
