"use client";

import { signIn, useSession } from "next-auth/react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { Splash } from "@/screens/splash";
import { useUser } from "@/shared/hooks";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function Signin() {
  const { data: session, status } = useSession();
  const { user, loading: userLoading, error: userError } = useUser();
  const [loginError, setLoginError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "AccessDenied") {
      setLoginError("로그인 처리 중 오류가 발생했습니다. 백엔드 서버 상태를 확인해주세요.");
    } else if (error) {
      setLoginError(`로그인 오류: ${error}`);
    }
  }, [searchParams]);

  const handleKakaoLogin = async () => {
    setLoginError(null);
    try {
      await signIn("kakao", { callbackUrl: "/" });
    } catch (error) {
      setLoginError("카카오 로그인 중 오류가 발생했습니다.");
      console.error("Kakao login error:", error);
    }
  };

  const handleAppleLogin = async () => {
    setLoginError(null);
    try {
      await signIn("apple", { callbackUrl: "/" });
    } catch (error) {
      setLoginError("Apple 로그인 중 오류가 발생했습니다.");
      console.error("Apple login error:", error);
    }
  };

  if (status === "loading") {
    return <Splash type="loading" />;
  }

  if (session) {
    if (userLoading) {
      return <Splash type="loading" />;
    }

    if (userError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-red-600">오류 발생</CardTitle>
              <CardDescription>사용자 정보를 불러오는 중 오류가 발생했습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>오류 내용: {userError}</p>
              </div>
              <Button onClick={() => window.location.reload()} className="w-full" variant="outline">
                다시 시도
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <>
        {user && (
          <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-green-600">로그인 완료!</CardTitle>
                <CardDescription>백엔드에서 사용자 정보를 성공적으로 불러왔습니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">사용자 ID:</span>
                    <span>{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">이름:</span>
                    <span>{user.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">이메일:</span>
                    <span>{user.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">로그인 오류</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{loginError}</p>
                    <p className="mt-1 text-xs text-red-600">
                      문제가 지속되면 관리자에게 문의해주세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
