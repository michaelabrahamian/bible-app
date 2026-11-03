import { requireNativeView, requireOptionalNativeModule } from "expo";
import type { DisplayRegionsObserverProps } from "./display-regions-observer";

// Expo Go and builds made before this local module was installed still work.
const Observer = requireOptionalNativeModule("BibleDisplayRegions")
  ? requireNativeView<DisplayRegionsObserverProps>("BibleDisplayRegions")
  : null;

export function DisplayRegionsObserver(props: DisplayRegionsObserverProps) {
  return Observer ? <Observer {...props} /> : null;
}
