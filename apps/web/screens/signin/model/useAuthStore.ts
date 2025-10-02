"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function useAuthStore() {
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

  const clearError = () => setLoginError(null);

  return {
    loginError,
    clearError,
  };
}
