/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow serving local images from the /public directory.
    // Local images (imported or referenced by path) are always allowed;
    // remotePatterns is left empty because we only use local assets.
    remotePatterns: [],
    // Preserve logo sharpness: keep lossless PNG output and avoid
    // over-compression of the optimized image.
    formats: ["image/webp"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 460, 640],
  },
};

module.exports = nextConfig;
