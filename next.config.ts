import type { NextConfig } from "next";

const config: NextConfig = {
  // Build estático: sem servidor, sem banco (SPEC C1).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default config;
