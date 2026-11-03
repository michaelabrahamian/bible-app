import { beforeEach, expect, jest, test } from "@jest/globals";
import { waitFor } from "@testing-library/react-native";
import { requireOptionalNativeModule } from "expo";
import { syncWidgetAppearance } from "@/services/widget-appearance.ios";

jest.mock("expo", () => ({
  requireOptionalNativeModule: jest.fn(() => ({ setAppearance: jest.fn<() => Promise<void>>(() => Promise.resolve()) })),
}));

const native = jest.mocked(requireOptionalNativeModule).mock.results[0].value as { setAppearance: jest.Mock<(json: string) => Promise<void>> };
const payload = {
  themeId: "ocean", appearance: "dark" as const,
  light: { background: "#F3F6F8", foreground: "#253B4C" },
  dark: { background: "#141E28", foreground: "#E5EDF5" },
};

beforeEach(() => { native.setAppearance.mockClear(); });

test("rapid appearance changes are written in order rather than racing the shared file", async () => {
  let finish!: () => void;
  native.setAppearance.mockImplementationOnce(() => new Promise<void>((resolve) => { finish = resolve; }));
  const first = syncWidgetAppearance(payload);
  const second = syncWidgetAppearance({ ...payload, appearance: "light" });
  await waitFor(() => expect(native.setAppearance).toHaveBeenCalledTimes(1));
  finish();
  await Promise.all([first, second]);
  expect(native.setAppearance.mock.calls.map(([json]) => JSON.parse(json).appearance)).toEqual(["dark", "light"]);
});

test("a failed write does not block a later preference update", async () => {
  native.setAppearance.mockRejectedValueOnce(new Error("Unavailable shared container"));
  const first = syncWidgetAppearance(payload);
  const second = syncWidgetAppearance({ ...payload, themeId: "forest" });
  await expect(first).rejects.toThrow("Unavailable shared container");
  await expect(second).resolves.toBeUndefined();
  expect(JSON.parse(native.setAppearance.mock.calls.at(-1)![0]).themeId).toBe("forest");
});
