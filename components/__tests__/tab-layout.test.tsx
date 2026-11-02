import { expect, jest, test } from "@jest/globals";
import { render } from "@testing-library/react-native";
import type { ReactNode } from "react";
import TabLayout from "@/app/(tabs)/_layout";
import { supportsLiquidGlass } from "@/constants/navigation";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual(
    "@react-native-async-storage/async-storage/jest/async-storage-mock",
  ),
);

jest.mock("@/constants/navigation", () => ({ supportsLiquidGlass: jest.fn() }));
jest.mock("@/components/haptic-tab", () => ({ HapticTab: () => null }));
jest.mock("@/components/ui/icon-symbol", () => ({ IconSymbol: () => null }));
jest.mock(
  "react-native-safe-area-context",
  () =>
    jest.requireActual<{ default: unknown }>(
      "react-native-safe-area-context/jest/mock",
    ).default,
);
jest.mock("expo-router", () => {
  const { View, Text } =
    jest.requireActual<typeof import("react-native")>("react-native");
  return {
    Tabs: Object.assign(
      ({ children }: { children: ReactNode }) => (
        <View testID="standard-tabs">{children}</View>
      ),
      {
        Screen: ({ options }: { options: { title: string } }) => (
          <Text>{options.title}</Text>
        ),
      },
    ),
  };
});
jest.mock("expo-router/native-tabs", () => {
  const { View, Text } =
    jest.requireActual<typeof import("react-native")>("react-native");
  const Trigger = Object.assign(
    ({ children, name }: { children: ReactNode; name: string }) => (
      <View testID={`native-route-${name}`}>{children}</View>
    ),
    {
      Label: ({ children }: { children: ReactNode }) => <Text>{children}</Text>,
      Icon: () => null,
    },
  );
  return {
    NativeTabs: Object.assign(
      ({ children }: { children: ReactNode }) => (
        <View testID="native-tabs">{children}</View>
      ),
      { Trigger },
    ),
  };
});

test("supported iPhones use the system tab navigator with both existing routes", async () => {
  jest.mocked(supportsLiquidGlass).mockReturnValue(true);
  const screen = await render(<TabLayout />);
  expect(screen.getByTestId("native-tabs")).toBeTruthy();
  expect(screen.getByTestId("native-route-index")).toBeTruthy();
  expect(screen.getByTestId("native-route-explore")).toBeTruthy();
  expect(screen.queryByTestId("standard-tabs")).toBeNull();
  expect(screen.getByText("Bible")).toBeTruthy();
  expect(screen.getByText("Settings")).toBeTruthy();
});

test("unsupported devices keep the previous standard tab navigator", async () => {
  jest.mocked(supportsLiquidGlass).mockReturnValue(false);
  const screen = await render(<TabLayout />);
  expect(screen.getByTestId("standard-tabs")).toBeTruthy();
  expect(screen.queryByTestId("native-tabs")).toBeNull();
  expect(screen.getByText("Bible")).toBeTruthy();
  expect(screen.getByText("Settings")).toBeTruthy();
});
