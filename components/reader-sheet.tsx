import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useEffect, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ReaderSheet({
  title,
  closeLabel,
  dismissLabel,
  onClose,
  children,
}: {
  title: string;
  closeLabel: string;
  dismissLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [offset] = useState(() => new Animated.Value(height));
  useEffect(() => {
    let active = true;
    const animation = Animated.timing(offset, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
    });
    const show = (reduceMotion: boolean) => {
      if (!active) return;
      if (reduceMotion) offset.setValue(0);
      else animation.start();
    };
    AccessibilityInfo.isReduceMotionEnabled().then(show, () => show(false));
    return () => {
      active = false;
      animation.stop();
    };
  }, [offset]);

  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={dismissLabel}
          onPress={onClose}
          style={styles.backdrop}
        />
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              marginTop: insets.top + 16,
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateY: offset }],
            },
          ]}
        >
          <View style={styles.header}>
            <ThemedText accessibilityRole="header" style={styles.title}>
              {title}
            </ThemedText>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
              onPress={onClose}
              style={[styles.close, { backgroundColor: colors.surfaceMuted }]}
            >
              <IconSymbol name="xmark" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", alignItems: "center" },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "88%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
  },
  header: { flexDirection: "row", alignItems: "center", padding: 20, gap: 12 },
  title: { flex: 1, fontSize: 22, lineHeight: 30, fontWeight: "600" },
  close: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
