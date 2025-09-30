import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import AppleProvider from "next-auth/providers/apple";
import {
  authClient,
  UserInsertDto,
  generateAppleClientSecret,
  validateAppleConfig,
  isTokenExpired,
  getOrRefreshToken,
  saveTokenToNextAuth,
} from "@/domain-shared/auth";

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
            name: user.name || user.email || "Unknown User",
            email: user.email || "",
            password: "",
            profileImagePath: user.image || "",
            mbti: "",
            gender: "",
            birth: "",
            mainPicId: 0,
          };

          const result = await getOrRefreshToken(authClient, userData.userId, "사용자 생성");

          if (!result.success) {
            const { shouldReauth } = result.errorResult || { shouldReauth: true };
            throw new Error(`❌ 토큰 발급 실패: ${shouldReauth ? "재인증 필요" : "서버 오류"}`);
          }

          let userId: number;

          try {
            const originalUserId = user.id;
            const existingUser = await authClient.getUserByUserId(
              originalUserId,
              result.accessToken,
            );

            if (existingUser && existingUser.id) {
              userId = existingUser.id;
            } else {
              try {
                userId = await authClient.createUser(userData, result.accessToken);
              } catch (error) {
                throw new Error(
                  `❌ 새 사용자 생성 실패: ${error instanceof Error ? error.message : String(error)}`,
                );
              }
            }
          } catch (error) {
            throw new Error(
              `❌ 사용자 인증 처리 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
            );
          }

          if (account && userId) {
            account.backend_jwt = result.accessToken;
            account.user_id = userId.toString();
          } else {
            throw new Error("❌ 사용자 ID 설정되지 않음");
          }
        }

        return true;
      } catch (error) {
        throw new Error(
          `❌ 소셜 로그인 실패: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    async jwt({ token, account, user }) {
      if (account) {
        const result = await getOrRefreshToken(authClient, user?.id || "guest", "로그인");

        if (result.success) {
          saveTokenToNextAuth(token, result.accessToken as string, result.expiresIn as number);
        }

        token.accessToken = account.access_token as string;
        token.userId = account.user_id as string;
      } else {
        if (token.backendJWT && isTokenExpired(token.backendJWT)) {
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            const result = await getOrRefreshToken(
              authClient,
              token.userId || "guest",
              "토큰 갱신",
            );

            if (result.success) {
              saveTokenToNextAuth(token, result.accessToken as string, result.expiresIn as number);
              break;
            } else {
              const { shouldRetry, shouldReauth } = result.errorResult || {
                shouldRetry: false,
                shouldReauth: true,
              };

              if (shouldReauth) {
                token.backendJWT = undefined;
                token.expiresAt = undefined;
                break;
              } else if (shouldRetry && retryCount < maxRetries - 1) {
                retryCount++;
                await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                continue;
              } else {
                token.backendJWT = undefined;
                token.expiresAt = undefined;
                break;
              }
            }
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.backendJWT = token.backendJWT;
      session.tokenExpiresAt = token.expiresAt;
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
