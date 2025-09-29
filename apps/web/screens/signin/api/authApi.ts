import { signIn } from "next-auth/react";

export class AuthApi {
  static async kakaoLogin(): Promise<void> {
    try {
      await signIn("kakao", { callbackUrl: "/" });
    } catch (error) {
      throw new Error("카카오 로그인 중 오류가 발생했습니다.");
    }
  }

  static async appleLogin(): Promise<void> {
    try {
      await signIn("apple", { callbackUrl: "/" });
    } catch (error) {
      throw new Error("Apple 로그인 중 오류가 발생했습니다.");
    }
  }
}
