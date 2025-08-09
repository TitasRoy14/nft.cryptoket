/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['emerald-raw-porcupine-369.mypinata.cloud'],
  },
};

module.exports = nextConfig;
