import type { JWT } from "next-auth/jwt";
import type { Account, User } from "next-auth";
import { authClient } from "../../api/authClient";
import { isTokenExpired, getOrRefreshToken, saveTokenToNextAuth } from "../utils";

export const jwtCallback = async ({
  token,
  account,
  user,
}: {
  token: JWT;
  account: Account | null;
  user: User | null;
}) => {
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
        const result = await getOrRefreshToken(authClient, token.userId || "guest", "토큰 갱신");

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
};
