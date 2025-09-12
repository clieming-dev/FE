import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // React Native Web 지원을 위한 alias 설정
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": "react-native-web",
    };

    // React Native Web 관련 확장자 해결
    config.resolve.extensions = [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ...config.resolve.extensions,
    ];

    // React Native Web을 위한 추가 설정
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "react-native": "react-native-web",
      };
    }

    return config;
  },

  // React Native Web 컴포넌트 트랜스파일
  transpilePackages: ["react-native-web"],
};

export default nextConfig;
