import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: "img.shields.io"
    }],
  },
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-link",
      "@tiptap/extension-image",
      "@tiptap/extension-placeholder",
      "@tiptap/extension-highlight",
      "@tiptap/extension-underline",
      "@tiptap/extension-text-align",
      "react-icons",
      "recharts",
    ],
  },
  async headers() {
    return [
      {
        source: "/pub/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
        ],
      },
      {
        // Only the embeddable widget's own API needs to be callable from an
        // arbitrary third-party origin — this used to cover every /api/*
        // route, including /api/auth/* and the paid advisor endpoint.
        source: "/api/widget/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }]
      }
    ]
  },
};

export default nextConfig;
