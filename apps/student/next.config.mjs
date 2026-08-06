/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The API client is imported only from server code; keeping it transpiled
  // here lets the workspace package ship raw TypeScript.
  transpilePackages: ["@unitrack/api-client"],
};

export default nextConfig;
