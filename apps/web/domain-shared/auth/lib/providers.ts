import KakaoProvider from "next-auth/providers/kakao";
import AppleProvider from "next-auth/providers/apple";
import { generateAppleClientSecret, validateAppleConfig } from "./appleAuth";

export const providers = [
  KakaoProvider({
    clientId: process.env.KAKAO_CLIENT_ID || "",
    clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
  }),
  AppleProvider({
    clientId: process.env.APPLE_CLIENT_ID || "",
    clientSecret: validateAppleConfig() ? generateAppleClientSecret() : "",
  }),
];
