/**
 * Settings Screen
 *
 * Simple version selection for primary and secondary Bible
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useBible } from "@/contexts/bible-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const {
    primaryVersion,
    secondaryVersion,
    setPrimaryVersion,
    setSecondaryVersion,
    showDualView,
    toggleDualView,
    getVersions,
  } = useBible();

  const borderColor = useThemeColor({}, "tabIconDefault");
  const tintColor = useThemeColor({}, "tint");
  const insets = useSafeAreaInsets();

  const versions = getVersions();

  const handleVersionSelect = (type: "primary" | "secondary", id: string) => {
    if (type === "primary") {
      setPrimaryVersion(id);
    } else {
      setSecondaryVersion(id);
    }
  };

  const handleToggleSecondary = () => {
    if (secondaryVersion) {
      setSecondaryVersion(null);
    } else {
      // Enable with the other version
      const otherVersion = versions.find((v) => v.id !== primaryVersion);
      if (otherVersion) {
        setSecondaryVersion(otherVersion.id);
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={[styles.header, { paddingTop: 20 + insets.top }]}>
          <ThemedText type="title">Settings</ThemedText>
        </ThemedView>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Primary Version
          </ThemedText>
          {versions.map((version) => (
            <TouchableOpacity
              key={version.id}
              style={[styles.versionCard, { borderColor }]}
              onPress={() => handleVersionSelect("primary", version.id)}
            >
              <View style={styles.versionInfo}>
                <ThemedText type="defaultSemiBold" style={styles.versionName}>
                  {version.name}
                </ThemedText>
                <ThemedText style={styles.versionLang}>
                  {version.language}
                </ThemedText>
                {version.notice && (
                  <ThemedText style={styles.versionNotice}>
                    {version.notice}
                  </ThemedText>
                )}
              </View>
              {primaryVersion === version.id && (
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={24}
                  color={tintColor}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Compare With
            </ThemedText>
            <TouchableOpacity
              onPress={handleToggleSecondary}
              style={styles.toggleButton}
            >
              <ThemedText style={[styles.toggleText, { color: tintColor }]}>
                {secondaryVersion ? "Disable" : "Enable"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {secondaryVersion && (
            <>
              {versions.map((version) => (
                <TouchableOpacity
                  key={version.id}
                  style={[styles.versionCard, { borderColor }]}
                  onPress={() => handleVersionSelect("secondary", version.id)}
                  disabled={version.id === primaryVersion}
                >
                  <View style={styles.versionInfo}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={[
                        styles.versionName,
                        version.id === primaryVersion && styles.disabledText,
                      ]}
                    >
                      {version.name}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.versionLang,
                        version.id === primaryVersion && styles.disabledText,
                      ]}
                    >
                      {version.language}
                    </ThemedText>
                    {version.notice && (
                      <ThemedText style={styles.versionNotice}>
                        {version.notice}
                      </ThemedText>
                    )}
                  </View>
                  {secondaryVersion === version.id && (
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={24}
                      color={tintColor}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Display
          </ThemedText>
          <TouchableOpacity
            style={[styles.settingCard, { borderColor }]}
            onPress={toggleDualView}
            disabled={!secondaryVersion}
          >
            <View style={styles.settingInfo}>
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.settingName,
                  !secondaryVersion && styles.disabledText,
                ]}
              >
                Dual View
              </ThemedText>
              <ThemedText
                style={[
                  styles.settingDescription,
                  !secondaryVersion && styles.disabledText,
                ]}
              >
                Show both versions side-by-side
              </ThemedText>
            </View>
            <IconSymbol
              name={showDualView ? "checkmark.circle.fill" : "circle"}
              size={24}
              color={showDualView && secondaryVersion ? tintColor : borderColor}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  versionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  versionInfo: {
    flex: 1,
  },
  versionName: {
    fontSize: 16,
    marginBottom: 4,
  },
  versionLang: {
    fontSize: 14,
    opacity: 0.6,
  },
  versionNotice: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.3,
  },
});
