/** @type {import('next').NextConfig} */
const nextConfig = {
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
