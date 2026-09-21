"use client";

import { useEffect } from "react";

/**
 * Keeps the screen on while `active` is true. Testers found that a phone or
 * laptop screensaver switched the screen off mid-call and the call dropped.
 * The browser drops the lock itself whenever the tab is hidden, so it is asked
 * for again when the parent comes back. Browsers without the Screen Wake Lock
 * API simply behave as before.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      if (cancelled || document.visibilityState !== "visible") return;
      try {
        lock = await navigator.wakeLock.request("screen");
        if (cancelled) void lock.release();
      } catch (error) {
        // Refused (battery saver, permissions policy): the call still works,
        // the screen may just sleep as it did before.
        console.warn(`[call/wake-lock] ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") void request();
    };

    void request();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void lock?.release().catch(() => undefined); // already released by the browser
    };
  }, [active]);
}
