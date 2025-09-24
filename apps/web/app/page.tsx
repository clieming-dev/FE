"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Splash } from "@/screens/splash";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/signin");
    }
  }, [session, status, router]);

  // TODO: 백엔드에 사용자 삭제 API 추가 요청 필요
  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "정말로 회원 탈퇴하시겠습니까?\n\n" +
        "⚠️ 주의: 현재는 임시 구현으로 백엔드 데이터는 삭제되지 않습니다.\n" +
        "세션만 종료되며, 나중에 백엔드 연동 시 완전한 탈퇴가 가능합니다.",
    );

    if (confirmed) {
      try {
        await signOut({ callbackUrl: "/signin" });
        alert("회원 탈퇴가 완료되었습니다.\n(임시 구현: 세션만 종료됨)");
      } catch (error) {
        console.error("회원 탈퇴 중 오류:", error);
        alert("회원 탈퇴 중 오류가 발생했습니다.");
      }
    }
  };

  if (status === "loading") {
    return <Splash type="loading" />;
  }

  if (!session) {
    return <Splash type="moveToLogin" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center space-y-4">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold text-green-600">로그인 성공!</h1>
        <p className="text-lg text-gray-600">
          안녕하세요,{" "}
          <span className="font-semibold">{session.user?.name || session.user?.email}</span>님!
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">소셜 로그인 정보</h2>
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="font-medium">이름:</span>
              <span>{session.user?.name || "정보 없음"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">이메일:</span>
              <span>{session.user?.email || "정보 없음"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">프로필 이미지:</span>
              <span>{session.user?.image ? "있음" : "없음"}</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors w-full">
            로그아웃
          </button>
          <button
            onClick={handleDeleteAccount}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors w-full">
            회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
