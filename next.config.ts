import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  outputFileTracingIncludes: {
    "/[locale]/[...path]": ["./src/content/publications/**/*.mdx"],
  },
  async redirects() {
    return [
      // Browsers may request the conventional icon again after history navigation.
      { source: "/favicon.ico", destination: "/icon.svg", permanent: true },
      {
        source: "/projets/maliflow",
        destination: "/projets/maliyaflow",
        permanent: true,
      },
      {
        source: "/en/projects/maliflow",
        destination: "/en/projects/maliyaflow",
        permanent: true,
      },
      {
        source: "/projets/association-web-platform",
        destination: "/projets/libiki-lya-kongo",
        permanent: true,
      },
      {
        source: "/en/projects/association-web-platform",
        destination: "/en/projects/libiki-lya-kongo",
        permanent: true,
      },
    ];
  },
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
