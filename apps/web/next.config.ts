import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['onnxruntime-node', '@xenova/transformers'],
};

export default nextConfig;
