import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // Permite abrir o "npm run dev:rede" pelo Android (RT05):
  // 10.0.2.2 = computador visto de dentro do emulador; 192.168.*.* = celular na mesma rede Wi-Fi
  allowedDevOrigins: ["10.0.2.2", "192.168.*.*"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
