/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = {
  images: {
    qualities: [75, 100],  // Add 100 to the allowed qualities
  },
}