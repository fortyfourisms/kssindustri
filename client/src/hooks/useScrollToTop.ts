import { useEffect } from "react";

export function useScrollToTop(dependency?: unknown) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [dependency]);
}
