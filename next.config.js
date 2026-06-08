/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/hotel-app',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
