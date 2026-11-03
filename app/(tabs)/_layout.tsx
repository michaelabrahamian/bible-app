import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { supportsLiquidGlass } from "@/constants/navigation";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();

  if (supportsLiquidGlass()) {
    // UIKit owns the glass, selection shape, sizing, safe areas and adaptation.
    // A GlassView behind a JavaScript tab bar does not provide those behaviors.
    return (
      <NativeTabs tintColor={colors.tint}>
        <NativeTabs.Trigger
          name="index"
          contentStyle={{ backgroundColor: colors.background }}
        >
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "house", selected: "house.fill" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="bible"
          disableAutomaticContentInsets
          contentStyle={{ backgroundColor: colors.background }}
        >
          <NativeTabs.Trigger.Label>Bible</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "book", selected: "book.fill" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="explore"
          contentStyle={{ backgroundColor: colors.background }}
        >
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="gearshape.fill" />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

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
        tabBarLabelPosition: "below-icon",
        tabBarLabelStyle: {
          fontSize: 10,
          lineHeight: 14,
          fontWeight: "600",
          marginBottom: 5,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={23} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bible"
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
