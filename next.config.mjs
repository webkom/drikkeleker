import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "atlasimagesgallery.blob.core.windows.net",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
