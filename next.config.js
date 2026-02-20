/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: require("path").join(__dirname, "../../"),
};

module.exports = nextConfig;
