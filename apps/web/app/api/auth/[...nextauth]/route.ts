import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import AppleProvider from "next-auth/providers/apple";
// import { apiClient, UserInsertDto } from "@/shared/api";
import { generateAppleClientSecret, validateAppleConfig } from "@/shared/lib";

const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
    // Apple 로그인: localhost 제한으로 인해 배포 환경에서만 테스트 가능
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: validateAppleConfig() ? generateAppleClientSecret() : "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });

      // 로그인 성공 후 메인 홈으로 리다이렉트
      if (url === baseUrl || url === `${baseUrl}/` || url === `${baseUrl}/signin`) {
        console.log("Redirecting to home:", baseUrl);
        return baseUrl;
      }

      // 상대 URL인 경우 baseUrl과 결합
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // 절대 URL이면서 같은 도메인인 경우
      if (url.startsWith(baseUrl)) {
        return url;
      }

      return baseUrl;
    },
    async signIn({ user, account }) {
      try {
        // 개발 단계: 백엔드 연동 우회하고 소셜 로그인만 테스트
        console.log("Social login successful:", {
          provider: account?.provider,
          userId: user.id,
          email: user.email,
          name: user.name,
        });

        // TODO: 백엔드 API가 준비되면 아래 코드 활성화
        /*
        if (account && user) {
          const userData: UserInsertDto = {
            userId: user.id || user.email || `social_${account.provider}_${Date.now()}`,
            userName: user.name || user.email || "Unknown User",
            email: user.email || "",
            password: "",
            profileImagePath: user.image || "",
            mbti: "",
            gender: "",
            birth: "",
            mainPicId: 0,
          };

          const userId = await apiClient.createUser(userData);
          const authResponse = await apiClient.getAuthToken(userData.userId);

          if (account) {
            account.backend_jwt = authResponse.access_token;
            account.user_id = userId.toString();
          }
        }
        */

        return true;
      } catch (error) {
        console.error("Social login error:", error);
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
