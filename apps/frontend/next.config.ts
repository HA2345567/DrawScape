import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  transpilePackages: ["http-backend", "@repo/common", "@repo/backend-common", "@repo/db"],
  serverExternalPackages: ["pg"],
};
export default nextConfig;
