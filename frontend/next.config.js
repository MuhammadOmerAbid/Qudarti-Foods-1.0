/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode was true — this causes every component to mount/unmount/remount
  // in development, doubling all effects and API calls, spiking CPU+RAM.
  reactStrictMode: false,
  images: {
    qualities: [75, 100],
  },
}

module.exports = nextConfig