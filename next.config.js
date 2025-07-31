/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't set basePath here as we want flexibility between dev and prod
  trailingSlash: false,
  experimental: {
    // Enable if needed for future features
  },
  env: {
    CUSTOM_KEY: "custom-value",
  },
  async rewrites() {
    return [
      // No rewrites needed - using exact path matching
    ];
  },
  async redirects() {
    return [
      // Redirect root to form-marv in dev mode if needed
    ];
  },
};

module.exports = nextConfig;
