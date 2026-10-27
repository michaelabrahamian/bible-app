import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarActiveBackgroundColor: colors.accentSoft,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          elevation: 0,
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
        tabBarItemStyle: {
          marginHorizontal: 12,
          borderRadius: 16,
          overflow: "hidden",
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginBottom: 5 },
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
