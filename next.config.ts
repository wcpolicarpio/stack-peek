import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Browsers often hit 127.0.0.1 while `next dev` advertises localhost.
  // Without this, Next blocks /_next/* and the client never hydrates.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
