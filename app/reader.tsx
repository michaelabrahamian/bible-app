import { Redirect, useLocalSearchParams } from "expo-router";

// Keep existing reader links working after moving reading into its own tab.
export default function ReaderRedirect() {
  const { book } = useLocalSearchParams<{ book?: string }>();
  return (
    <Redirect
      href={{
        pathname: "/bible",
        params: typeof book === "string" ? { book } : {},
      }}
    />
  );
}
