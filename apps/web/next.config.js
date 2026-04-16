const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@editron/shared"],
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
};

module.exports = nextConfig;
