import { Redirect, useLocalSearchParams } from "expo-router";

// Keep existing reader links working after moving reading into its own tab.
export default function ReaderRedirect() {
  const { book, chapter, verse } = useLocalSearchParams<{
    book?: string;
    chapter?: string;
    verse?: string;
  }>();
  return (
    <Redirect
      href={{
        pathname: "/bible",
        params: typeof book === "string" ? { book, chapter, verse } : {},
      }}
    />
  );
}
