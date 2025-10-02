import { Logo } from "@/assets";

interface SplashProps {
  type?: "loading" | "moveToLogin";
  logoSize?: {
    width?: number;
    height?: number;
  };
  className?: string;
}

enum SplashText {
  loading = "로딩 중...",
  moveToLogin = "로그인 페이지로 이동 중...",
}

export function Splash({ type = "loading", logoSize, className = "" }: SplashProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#FF6B4C] ${className}`}>
      <div className="text-center text-white space-y-4">
        <Logo width={logoSize?.width} height={logoSize?.height} />
        <p className="mt-4 text-lg">{SplashText[type]}</p>
      </div>
    </div>
  );
}
