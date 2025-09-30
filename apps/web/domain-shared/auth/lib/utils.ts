import { AuthClient } from "../api/authClient";
import type { JWT } from "next-auth/jwt";

export const getOrRefreshToken = async (
  authClient: AuthClient,
  userId: string,
  context: string,
) => {
  try {
    const {
      status,
      data: { accessToken, expiresIn },
      error,
    } = await authClient.getAuthToken(userId);

    if (status !== 200) {
      const errorResult = handleTokenError(status, error || "", context);
      return { success: false, errorResult };
    }

    return {
      success: true,
      accessToken,
      expiresIn,
    };
  } catch (error) {
    console.error(`❌ 토큰 요청 실패 (${context}):`, error);
    return { success: false, errorResult: { shouldRetry: true, shouldReauth: false } };
  }
};

export const saveTokenToNextAuth = (token: JWT, accessToken: string, expiresIn: number) => {
  token.backendJWT = accessToken;
  token.expiresAt = Date.now() + expiresIn * 1000;
};

export const handleTokenError = (status: number, error: string, context: string) => {
  if (status === 401 || status === 403) {
    console.warn(`🔒 인증 오류 (${context}):`, error);
    return { shouldRetry: false, shouldReauth: true };
  } else if (status >= 500) {
    console.warn(`🖥️ 서버 오류 (${context}):`, error);
    return { shouldRetry: true, shouldReauth: false };
  } else {
    console.warn(`❌ 알 수 없는 오류 (${context}):`, error);
    return { shouldRetry: false, shouldReauth: true };
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};
