import { useCallback, useRef, type ComponentRef } from "react";
import type { LayoutChangeEvent, ScrollView } from "react-native";

type ScrollTarget = Pick<ComponentRef<typeof ScrollView>, "scrollTo">;

export function useScrollToSelection(enabled = true) {
  const node = useRef<ScrollTarget | null>(null);
  const lastNode = useRef<ScrollTarget | null>(null);
  const measurements = useRef({
    viewport: 0,
    content: 0,
    selection: null as { y: number; height: number } | null,
  });
  const reveal = useCallback(() => {
    const { viewport, content, selection } = measurements.current;
    // Native layout and content-size events can arrive in either order.
    if (!enabled || !node.current || !viewport || !content || !selection) return;
    const centered =
      selection.y - Math.max(0, (viewport - selection.height) / 2);
    node.current.scrollTo({
      y: Math.max(0, Math.min(centered, Math.max(0, content - viewport))),
      animated: false,
    });
  }, [enabled]);

  const attach = useCallback(
    (view: ScrollTarget | null) => {
      if (view && view !== lastNode.current) {
        measurements.current = { viewport: 0, content: 0, selection: null };
        lastNode.current = view;
      }
      node.current = view;
      if (view) reveal();
    },
    [reveal],
  );

  const onLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      const height = nativeEvent.layout.height;
      if (measurements.current.viewport === height) return;
      measurements.current.viewport = height;
      reveal();
    },
    [reveal],
  );

  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      if (measurements.current.content === height) return;
      measurements.current.content = height;
      reveal();
    },
    [reveal],
  );

  const onSelectionLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      const { y, height } = nativeEvent.layout;
      const previous = measurements.current.selection;
      if (previous?.y === y && previous.height === height) return;
      measurements.current.selection = { y, height };
      reveal();
    },
    [reveal],
  );

  return { attach, onLayout, onContentSizeChange, onSelectionLayout };
}
