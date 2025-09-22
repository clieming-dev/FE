"use client";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";

export function Signin() {
  const handleKakaoLogin = () => {
    alert("카카오 로그인 기능은 추후 구현 예정입니다.");
  };

  const handleAppleLogin = () => {
    alert("애플 로그인 기능은 추후 구현 예정입니다.");
  };

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
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-foreground font-medium"
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
