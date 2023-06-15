/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  publicRuntimeConfig: {
    NEXT_PUBLIC_CALLISTO_HOST: process.env.NEXT_PUBLIC_CALLISTO_HOST,
  }
}

module.exports = nextConfig
