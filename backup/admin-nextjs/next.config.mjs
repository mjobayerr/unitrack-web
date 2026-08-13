import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The API client is imported only from server code; keeping it transpiled
  // here lets the workspace package ship raw TypeScript.
  transpilePackages: ["@unitrack/api-client", "@unitrack/map", "@unitrack/theme"],
  // Bundles a minimal server plus only the files actually reached, so the
  // container does not carry the whole monorepo and its dev dependencies.
  output: "standalone",
  // Without this, tracing starts at this app and misses the workspace package
  // and the pnpm store above it — the image builds and then crashes on a
  // missing module at boot, which is the worst time to find out.
  outputFileTracingRoot: fileURLToPath(new URL("../..", import.meta.url)),
};

export default nextConfig;
