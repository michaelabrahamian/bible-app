import type { NativeSyntheticEvent, ViewProps } from "react-native";
import type { ReaderDisplayRegions } from "@/utils/reader-display-layout";

export interface DisplayRegionsObserverProps extends ViewProps {
  onRegionsChange: (event: NativeSyntheticEvent<ReaderDisplayRegions>) => void;
}

// Other platforms retain the responsive reader and its chosen layout.
export function DisplayRegionsObserver(_props: DisplayRegionsObserverProps) {
  return null;
}
