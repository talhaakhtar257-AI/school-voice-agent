"use client";

import { useCall } from "./call-provider";

/**
 * Every Talk button on the page. They all open the same call window, so a
 * parent can never start two calls at once.
 */
export function CallButton({ className, children }: { className: string; children: React.ReactNode }) {
  const { openCall } = useCall();
  return (
    <button type="button" className={className} onClick={openCall} aria-haspopup="dialog">
      {children}
    </button>
  );
}
