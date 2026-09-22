"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Re-reads the page's server data every `seconds` while the tab is visible
 * (FR-019). A plain timer and router.refresh(): no realtime connection to
 * set up, and a hidden tab costs nothing. Renders nothing.
 */
export function AutoRefresh({ seconds = 10, paused = false }: { seconds?: number; paused?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(timer);
  }, [router, seconds, paused]);
  return null;
}
