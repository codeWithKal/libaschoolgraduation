/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [75, 95],
  },
  // Add this to handle sharp on Vercel
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
  // Webpack configuration for sharp
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure sharp is properly bundled
      config.externals = [...(config.externals || []), "sharp"];
    }
    return config;
  },
};

export default nextConfig;
