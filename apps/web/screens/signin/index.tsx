"use client";

import { signIn, useSession } from "next-auth/react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { Splash } from "@/screens/splash";
import { useUser } from "@/shared/hooks";

export function Signin() {
  const { data: session, status } = useSession();
  const { user, loading: userLoading, error: userError } = useUser();

  const handleKakaoLogin = () => {
    signIn("kakao", { callbackUrl: "/" });
  };

  const handleAppleLogin = () => {
    signIn("apple", { callbackUrl: "/" });
  };

  if (status === "loading") {
    return <Splash type="loading" />;
  }

  if (session) {
    if (userLoading) {
      return <Splash type="loading" />;
    }

    if (userError) {
      console.error(userError);
    }

    return (
      <>
        {user && (
          <div>
            <div className="text-2xl font-bold text-green-600">로그인 완료!</div>
            <span className="font-medium">사용자 ID:</span>
            <span>{user.id}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">로그인</CardTitle>
          <CardDescription>소셜 계정으로 간편하게 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleKakaoLogin}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            size="lg">
            카카오 로그인
          </Button>

          <Button onClick={handleAppleLogin} variant="outline" className="w-full" size="lg">
            Apple 로그인
          </Button>

          <div className="text-center text-sm text-neutral-500 pt-4">
            <p>로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
