import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { TabBarBackground } from "@/components/tab-bar-background";
import {
  BOTTOM_TAB_BAR_HEIGHT,
  BOTTOM_TAB_BAR_MARGIN,
  supportsLiquidGlass,
} from "@/constants/navigation";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWindowDimensions } from "react-native";

export default function TabLayout() {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontalInset = Math.max(16, (width - 360) / 2);
  const glass = supportsLiquidGlass();

  return (
    <Tabs
      safeAreaInsets={glass ? { bottom: 0 } : undefined}
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarActiveBackgroundColor: colors.accentSoft,
        tabBarBackground: glass ? () => <TabBarBackground /> : undefined,
        tabBarStyle: glass
          ? {
              position: "absolute",
              left: horizontalInset,
              right: horizontalInset,
              bottom: Math.max(insets.bottom, BOTTOM_TAB_BAR_MARGIN),
              backgroundColor: "transparent",
              borderTopWidth: 0,
              borderRadius: 30,
              elevation: 0,
              height: BOTTOM_TAB_BAR_HEIGHT,
              paddingBottom: 4,
              paddingTop: 4,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.12)",
            }
          : {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              elevation: 0,
              height: 70 + insets.bottom,
              paddingBottom: insets.bottom + 6,
              paddingTop: 6,
            },
        tabBarItemStyle: glass
          ? {
              marginHorizontal: 4,
              borderRadius: 24,
            }
          : {
              marginHorizontal: 12,
              borderRadius: 16,
              overflow: "hidden",
            },
        tabBarLabelPosition: "below-icon",
        tabBarLabelStyle: {
          fontSize: 10,
          lineHeight: 14,
          fontWeight: "600",
          marginBottom: glass ? 0 : 5,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Bible",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={23} name="book" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={23} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
