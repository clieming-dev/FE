import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import AppleProvider from "next-auth/providers/apple";
import { apiClient, UserInsertDto } from "@/shared/api";
import { generateAppleClientSecret, validateAppleConfig } from "@/shared/lib";

const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
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
      if (url === baseUrl || url === `${baseUrl}/` || url === `${baseUrl}/signin`) {
        return baseUrl;
      }

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

      return baseUrl;
    },
    async signIn({ user, account }) {
      try {
        if (account && user) {
          const userData: UserInsertDto = {
            userId: user.id,
            userName: user.name || user.email || "Unknown User",
            email: user.email || "",
            password: "",
            profileImagePath: user.image || "",
            mbti: "",
            gender: "",
            birth: "",
            mainPicId: 0,
          };

          try {
            const authResponse = await apiClient.getAuthToken(userData.userId);

            let userId: number;

            try {
              const originalUserId = user.id;
              const existingUser = await apiClient.getUserByUserId(
                originalUserId,
                authResponse.data.access_token,
              );

              if (existingUser && existingUser.id) {
                userId = existingUser.id;
              } else {
                try {
                  userId = await apiClient.createUser(userData);
                } catch (createError) {
                  throw new Error(
                    `❌ 새 사용자 생성 실패: ${createError instanceof Error ? createError.message : String(createError)}`,
                  );
                }
              }
            } catch (userCheckError) {
              throw new Error(
                `❌ 사용자 인증 처리 중 오류 발생: ${userCheckError instanceof Error ? userCheckError.message : String(userCheckError)}`,
              );
            }

            if (account && userId) {
              account.backend_jwt = authResponse.data.access_token;
              account.user_id = userId.toString();
            } else {
              throw new Error("❌ 사용자 ID 설정되지 않음");
            }
          } catch (apiError) {
            throw new Error(
              `❌ 백엔드 연동 실패: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
            );
          }
        }

        return true;
      } catch (error) {
        // console.error("Social login error:", error);
        return false;
      }
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token as string;
        token.backendJWT = account.backend_jwt as string;
        token.userId = account.user_id as string;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.backendJWT = token.backendJWT;
      if (token.userId) {
        session.user = {
          ...session.user,
          id: token.userId,
        };
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
