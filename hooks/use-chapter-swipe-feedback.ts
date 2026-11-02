import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Platform } from "react-native";

export function useChapterSwipeFeedback({
  enabled,
  width,
  passage,
  canGoPrevious,
  canGoNext,
}: {
  enabled: boolean;
  width: number;
  passage: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
}) {
  // Late native animation completions from an outgoing chapter must never
  // update the incoming chapter's position.
  const { offset } = useMemo(
    () => ({ passage, offset: new Animated.Value(0) }),
    [passage],
  );
  const [reduceMotion, setReduceMotion] = useState(true);
  const displaced = useRef(false);
  const gestureOffset = useRef<Animated.Value | null>(null);

  useEffect(() => {
    let active = true;
    let changed = false;
    const apply = (value: boolean) => {
      if (!active) return;
      setReduceMotion(value);
      if (value) {
        offset.stopAnimation();
        offset.setValue(0);
        displaced.current = false;
        gestureOffset.current = null;
      }
    };
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (value) => {
        changed = true;
        apply(value);
      },
    );
    AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => {
        if (!changed) apply(value);
      },
      () => {
        if (!changed) apply(true);
      },
    );
    return () => {
      active = false;
      subscription.remove();
      offset.stopAnimation();
    };
  }, [offset]);

  useLayoutEffect(() => {
    // A chapter change can replace the gesture's content before finalization.
    // Reset before painting the incoming passage, even if that event is lost.
    offset.stopAnimation();
    offset.setValue(0);
    displaced.current = false;
    gestureOffset.current = null;
  }, [enabled, width, passage, offset]);

  return {
    offset,
    reduceMotion,
    reset: () => {
      gestureOffset.current = null;
      displaced.current = false;
      offset.stopAnimation();
      offset.setValue(0);
    },
    start: () => {
      offset.stopAnimation();
      offset.setValue(0);
      displaced.current = false;
      gestureOffset.current = enabled && !reduceMotion ? offset : null;
    },
    update: (x: number, y: number) => {
      if (
        gestureOffset.current !== offset ||
        !enabled ||
        reduceMotion ||
        Math.abs(x) < Math.abs(y) * 1.5
      )
        return;
      const available = x < 0 ? canGoNext : canGoPrevious;
      const limit = available ? 28 : 8;
      const distance = Math.max(-limit, Math.min(limit, x * 0.24));
      offset.setValue(distance);
      displaced.current = distance !== 0;
    },
    finish: () => {
      if (gestureOffset.current !== offset) return;
      // Release ownership before React can render the next chapter. A queued
      // update from this pan must not move that chapter's new animation node.
      gestureOffset.current = null;
      if (!displaced.current) return;
      displaced.current = false;
      if (reduceMotion) {
        offset.setValue(0);
        return;
      }
      Animated.timing(offset, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== "web",
      }).start();
    },
  };
}
