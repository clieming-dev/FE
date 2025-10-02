import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  logging: {
    fetches: {
      fullUrl: false, // URL 전체 표시 비활성화
    },
  },
};

export default nextConfig;
