import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Hosts allowed for <Image />.
    //  - res.cloudinary.com: user-uploaded avatars (student profile + admin).
    //  - *.googleusercontent.com: Google profile photos returned with the
    //    OAuth `picture` claim. Google serves from lh3/lh4/lh5/lh6 subdomains
    //    so we match the whole suffix rather than pinning one.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
