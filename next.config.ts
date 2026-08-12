import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Tabbed sections already have list UIs at their first child — send parents there.
      {
        source: "/media",
        destination: "/media/press-releases",
        permanent: false,
      },
      {
        source: "/downloads",
        destination: "/downloads/publications",
        permanent: false,
      },
      {
        source: "/projects",
        destination: "/projects/ongoing",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
