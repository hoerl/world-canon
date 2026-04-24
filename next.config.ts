import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  images: {
    domains: ['static.usernames.app-backend.toolsforhumanity.com'],
  },
  allowedDevOrigins: ['*'], // Add your dev origin here
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: false,
};

export default nextConfig;
