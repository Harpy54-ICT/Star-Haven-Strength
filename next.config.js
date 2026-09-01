/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow serving local images from the /public directory.
    // Local images (imported or referenced by path) are always allowed;
    // remotePatterns is left empty because we only use local assets.
    remotePatterns: [],
  },
};

module.exports = nextConfig;
