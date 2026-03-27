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
        source: "/api/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }]
      }
    ]
  },
};

export default nextConfig;
