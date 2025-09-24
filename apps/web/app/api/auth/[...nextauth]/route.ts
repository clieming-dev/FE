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
        console.log("Social login successful:", {
          provider: account?.provider,
          userId: user.id,
          email: user.email,
          name: user.name,
        });

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

          try {
            const authResponse = await apiClient.getAuthToken(userData.userId);
            console.log("Auth token received:", authResponse);

            let userId: number;
            let isNewUser = false;

            try {
              const existingUser = await apiClient.getUserByUserId(
                userData.userId,
                authResponse.access_token,
              );

              if (existingUser) {
                userId = existingUser.id;
                console.log("✅ 기존 사용자 자동 로그인 성공:", {
                  userId: existingUser.id,
                  userName: existingUser.userName,
                  email: existingUser.email,
                });
              } else {
                console.log("🆕 새로운 사용자 생성 중...");
                try {
                  userId = await apiClient.createUser(userData);
                  isNewUser = true;
                  console.log("✅ 새 사용자 생성 성공:", {
                    userId,
                    userName: userData.userName,
                    email: userData.email,
                  });
                } catch (createError) {
                  console.error("❌ 사용자 생성 실패:", createError);
                  throw new Error(
                    `새 사용자 생성에 실패했습니다. 백엔드 서버를 확인해주세요: ${createError instanceof Error ? createError.message : String(createError)}`,
                  );
                }
              }
            } catch (userCheckError) {
              console.error("❌ 사용자 확인/생성 과정에서 오류 발생:", userCheckError);
              throw new Error(
                `사용자 인증 처리 중 오류가 발생했습니다: ${userCheckError instanceof Error ? userCheckError.message : String(userCheckError)}`,
              );
            }

            if (account) {
              account.backend_jwt = authResponse.access_token;
              account.user_id = userId.toString();
            }
          } catch (apiError) {
            console.error("Backend API error:", apiError);
            throw new Error(
              `백엔드 연동 실패: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
            );
          }
        }

        return true;
      } catch (error) {
        console.error("Social login error:", error);
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
