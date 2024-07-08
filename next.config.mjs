/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "threads-clone-local-fran.s3.us-east-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
