import type { NextConfig } from "next";

/**
 * Security headers on every response.
 * - nosniff: the browser must not guess a file's type and run it as script.
 * - frame-ancestors / X-Frame-Options: no other site may frame the login or
 *   dashboard to trick staff into clicking (clickjacking).
 * - Referrer-Policy: other sites never see full dashboard addresses.
 * - Permissions-Policy: the microphone is allowed for this site only (the
 *   voice call needs it); camera, location and payments are switched off.
 * - HSTS: once visited over HTTPS, the browser refuses plain HTTP.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Pins the project root. Without this, Turbopack walks up the folder tree and
  // finds an unrelated package-lock.json in the user's home directory, then warns
  // about it on every build. Naming the root explicitly makes builds deterministic
  // wherever the project is checked out.
  turbopack: {
    root: __dirname,
  },
  // Don't advertise the framework to anyone probing the site.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
