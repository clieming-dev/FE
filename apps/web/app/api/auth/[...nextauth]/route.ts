import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import AppleProvider from "next-auth/providers/apple";
import { apiClient, UserInsertDto } from "@/shared/api";

const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        // 소셜 로그인 정보를 백엔드에 전송하여 사용자 생성/조회
        if (account && user) {
          const userData: UserInsertDto = {
            userId: user.id || user.email || `social_${account.provider}_${Date.now()}`,
            userName: user.name || user.email || "Unknown User",
            email: user.email || "",
            password: "", // 소셜 로그인 패스워드 없음
            profileImagePath: user.image || "",
            mbti: "",
            gender: "",
            birth: "",
            mainPicId: 0,
          };

          // 백엔드에 사용자 생성 요청
          const userId = await apiClient.createUser(userData);

          // 백엔드에서 인증 토큰 발급
          const authResponse = await apiClient.getAuthToken(userData.userId);

          // 토큰을 NextAuth 세션에 저장
          if (account) {
            account.backend_jwt = authResponse.access_token;
            account.user_id = userId.toString();
          }
        }

        return true;
      } catch (error) {
        console.error("Backend integration error:", error);
        return false;
      }
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.backendJWT = account.backend_jwt;
        token.userId = account.user_id;
      }
      return token;
    },
    async session({ session, token }) {
      // @ts-expect-error accessToken
      session.accessToken = token.accessToken;
      // @ts-expect-error backendJWT
      session.backendJWT = token.backendJWT;
      // @ts-expect-error userId
      session.userId = token.userId;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
