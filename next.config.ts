import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the project root. Without this, Turbopack walks up the folder tree and
  // finds an unrelated package-lock.json in the user's home directory, then warns
  // about it on every build. Naming the root explicitly makes builds deterministic
  // wherever the project is checked out.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
