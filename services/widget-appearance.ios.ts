import { requireOptionalNativeModule } from "expo";
import type { WidgetAppearancePayload } from "./widget-appearance";

const native = requireOptionalNativeModule<{
  setAppearance(json: string): Promise<void>;
}>("BibleWidgetAppearance");

let writes = Promise.resolve();

export function syncWidgetAppearance(payload: WidgetAppearancePayload): Promise<void> {
  // Older installed builds and Expo Go keep working without this module.
  if (!native) return Promise.resolve();
  const json = JSON.stringify(payload);
  // Rapid selections must reach the shared container in the same order.
  writes = writes.catch(() => {}).then(() => native.setAppearance(json));
  return writes;
}
