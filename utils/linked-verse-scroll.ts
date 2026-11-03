type Pane = 0 | 1;
interface PaneLayout {
  verses: Map<number, number>;
  height: number;
  contentHeight: number;
  offset: number;
  scrollTo?: (y: number) => void;
}

// Use measured verse anchors rather than scroll percentages: translations can
// wrap very differently, and omitted verse numbers must not shift the match.
export function createLinkedVerseScroll() {
  const panes: PaneLayout[] = Array.from({ length: 2 }, () => ({
    verses: new Map(),
    height: 0,
    contentHeight: 0,
    offset: 0,
  }));
  let active: Pane | undefined;
  const maxOffset = (pane: PaneLayout) =>
    Math.max(0, pane.contentHeight - pane.height);

  return {
    attach(index: Pane, scrollTo?: (y: number) => void) {
      panes[index].scrollTo = scrollTo;
    },
    measureVerse(index: Pane, verse: number, y: number) {
      panes[index].verses.set(verse, y);
    },
    measureViewport(index: Pane, height: number) {
      panes[index].height = height;
    },
    measureContent(index: Pane, height: number) {
      panes[index].contentHeight = height;
    },
    activate(index: Pane) {
      if (active === index) return;
      active = index;
      // Stop the other pane's momentum when the reader takes control here.
      const other = panes[1 - index];
      other.scrollTo?.(other.offset);
    },
    scroll(index: Pane, y: number) {
      const source = panes[index];
      source.offset = Math.max(0, Math.min(y, maxOffset(source)));
      if (active !== index) return; // Ignore the follower's programmatic events.
      const target = panes[1 - index];
      if (
        !source.height ||
        !target.height ||
        !source.contentHeight ||
        !target.contentHeight
      )
        return;
      const shared = [...source.verses.keys()]
        .filter((verse) => target.verses.has(verse))
        .sort((a, b) => a - b);
      if (!shared.length) return; // An unavailable chapter scrolls independently.
      const sourceMax = maxOffset(source);
      const targetMax = maxOffset(target);
      if (!sourceMax) return;
      // Match every verse that can reach the top in both panes, then ease the
      // remaining tail towards their respective bottoms without a final jump.
      const anchors = [
        [0, 0],
        ...shared
          .map((verse) => [
            source.verses.get(verse)!,
            target.verses.get(verse)!,
          ])
          .filter(
            ([from, to]) =>
              from > 0 && from < sourceMax && to > 0 && to < targetMax,
          ),
        [sourceMax, targetMax],
      ];
      let destination = 0;
      for (let i = 1; i < anchors.length; i++) {
        const [start, targetStart] = anchors[i - 1];
        const [end, targetEnd] = anchors[i];
        if (source.offset > end || end <= start) continue;
        const fraction = (source.offset - start) / (end - start);
        destination = targetStart + fraction * (targetEnd - targetStart);
        break;
      }
      destination = Math.max(0, Math.min(destination, maxOffset(target)));
      target.offset = destination;
      target.scrollTo?.(destination);
    },
  };
}

export type LinkedVerseScroll = ReturnType<typeof createLinkedVerseScroll>;
