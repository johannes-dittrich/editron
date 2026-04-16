const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@editron/shared"],
  outputFileTracingRoot: path.resolve(__dirname, "../../"),

  async rewrites() {
    // Next.js snapshots rewrite destinations at build time, so
    // process.env.BACKEND_URL at build-time inside the Docker image
    // is unreliable (Azin buildkit doesn't pass runtime env to the
    // build). Hardcode the known public api host; switch to env for
    // staging via a `STAGING_API_URL` branch if we ever need it.
    const apiUrl =
      process.env.BACKEND_URL ||
      "https://api-production.4631dc.up.azin.host";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
