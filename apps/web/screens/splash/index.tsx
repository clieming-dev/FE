import { Logo } from '@/assets'

export function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FF6B4C]">
      <div className="text-center text-white space-y-4">
        <Logo />
        <p>로딩중...</p>
      </div>
    </div>
  )
}
