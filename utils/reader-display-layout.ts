export interface DisplayRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ReaderDisplayRegions {
  width: number;
  height: number;
  divisions: DisplayRegion[];
  safeAreaInsets?: { left: number; right: number };
}

export function getReaderHorizontalPadding(
  insets: { left: number; right: number },
  besideNativeDock: boolean,
) {
  // The native dock already reserves its own clearance. Keep only a small
  // additional margin on that edge, while retaining normal outer spacing.
  return {
    left: insets.left + (besideNativeDock && insets.left > 0 ? 4 : 16),
    right: insets.right + (besideNativeDock && insets.right > 0 ? 4 : 16),
  };
}

export interface ReaderDisplaySplit {
  axis: "vertical" | "horizontal";
  primary: number;
  secondary: number;
  gap: number;
}

// UIKit supplies frames in the observer's local coordinates, including the
// system's fold margins. Keep inactive, zero-width folds when fully opened.
export function getReaderDisplaySplit(
  display: ReaderDisplayRegions | null,
  padding: { left: number; right: number },
): ReaderDisplaySplit | null {
  if (
    !display ||
    ![display.width, display.height].every(Number.isFinite) ||
    display.width <= 0 ||
    display.height <= 0
  )
    return null;
  for (const region of display.divisions) {
    if (
      ![region.x, region.y, region.width, region.height].every(
        Number.isFinite,
      ) ||
      region.width < 0 ||
      region.height < 0
    )
      continue;
    const vertical = region.height > region.width;
    if (
      vertical &&
      (region.y > 1 || region.y + region.height < display.height - 1)
    )
      continue;
    if (
      !vertical &&
      (region.x > 1 || region.x + region.width < display.width - 1)
    )
      continue;
    const size = vertical ? display.width : display.height;
    const extent = vertical ? region.width : region.height;
    const center = (vertical ? region.x : region.y) + extent / 2;
    const gap = Math.max(24, extent);
    const primary = center - gap / 2 - (vertical ? padding.left : 0);
    const secondary = size - center - gap / 2 - (vertical ? padding.right : 0);
    const minimum = vertical ? 160 : 120;
    // A fold at the edge of a Split View window does not divide this reader.
    if (primary < minimum || secondary < minimum) continue;
    return {
      axis: vertical ? "vertical" : "horizontal",
      primary,
      secondary,
      gap,
    };
  }
  return null;
}
