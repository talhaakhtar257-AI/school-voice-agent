import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Al-Noor Public School — Admissions",
    template: "%s · Al-Noor Public School",
  },
  description:
    "Ask Al-Noor Public School's AI admissions assistant about classes, fees, documents and the admission process — in English or Urdu.",
};

/**
 * `width=device-width` at scale 1 is what makes FR-003 hold: without it a phone
 * renders the page at a pretend desktop width and then shrinks it, which is how
 * a 360px screen ends up scrolling sideways.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
