/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [75, 95],
  },
  // ✅ Updated: serverComponentsExternalPackages → serverExternalPackages
  serverExternalPackages: ["sharp"],
  // ✅ Add turbopack config to avoid the warning
  turbopack: {},
  // ✅ Remove webpack config if you don't need it
  // If you need custom webpack config, use it conditionally
  webpack: (config, { isServer, nextConfig: { turbopack } }) => {
    // Only apply webpack config if not using Turbopack
    if (!turbopack && isServer) {
      config.externals = [...(config.externals || []), "sharp"];
    }
    return config;
  },
};

export default nextConfig;
