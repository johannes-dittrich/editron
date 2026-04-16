const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@editron/shared"],

  // Scope build-trace collection to just this app, not the whole
  // monorepo. Without this, Next.js scans every node_modules/ in /app
  // and runs out of memory on Azin's builder during "Collecting build
  // traces".
  outputFileTracingRoot: path.resolve(__dirname),

  // Skip heavy/large binaries that don't need tracing at runtime.
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@swc/core-linux-x64-gnu/**",
      "node_modules/@swc/core-linux-x64-musl/**",
      "node_modules/@esbuild/**",
      "node_modules/typescript/**",
      "node_modules/@types/**",
      "node_modules/.pnpm/typescript@**",
      "node_modules/.pnpm/@swc+**",
      "node_modules/.pnpm/@esbuild+**"
    ]
  }
};

module.exports = nextConfig;
